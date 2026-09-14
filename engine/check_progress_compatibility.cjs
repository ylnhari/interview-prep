"use strict";

const childProcess = require("child_process");
const vm = require("vm");
const { assertProgressCompatible } = require("./progress-compatibility.cjs");

const FULL_SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const COURSE_FILE = "packs/course/content.js";
const CORE_FILE = /^core\/[A-Za-z0-9][A-Za-z0-9._-]*\.js$/;
const ID = /^[A-Za-z0-9_-]{1,150}$/;

function git(args, options) {
  return childProcess.execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}

function commit(sha, label) {
  if (!FULL_SHA.test(sha)) throw new Error(label + " must be a full 40- or 64-character commit SHA");
  let resolved;
  try {
    resolved = git(["rev-parse", "--verify", sha + "^{commit}"]).trim().toLowerCase();
  } catch (_) {
    throw new Error(label + " must name an existing commit");
  }
  if (resolved !== sha.toLowerCase()) throw new Error(label + " did not resolve to the supplied full commit SHA");
  return resolved;
}

function publicFiles(sha) {
  const entries = git(["ls-tree", "-r", "-z", sha, "--", "core", "packs/course"])
    .split("\0").filter(Boolean).map((entry) => {
      const match = /^(\d+) ([a-z]+) ([0-9a-f]+)\t(.+)$/.exec(entry);
      if (!match) throw new Error(sha + " returned an unreadable tree entry");
      return { mode: match[1], type: match[2], name: match[4] };
    });
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const core = entries.filter((entry) => CORE_FILE.test(entry.name)).sort((a, b) => {
    const aName = a.name; const bName = b.name;
    if (aName === "core/library.js") return -1;
    if (bName === "core/library.js") return 1;
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });
  if (!byName.has("core/library.js")) throw new Error(sha + " is missing allowlisted core/library.js");
  if (!byName.has(COURSE_FILE)) throw new Error(sha + " is missing allowlisted " + COURSE_FILE);
  const selected = [...core, byName.get(COURSE_FILE)];
  selected.forEach((entry) => {
    if (entry.type !== "blob" || !/^100(?:644|755)$/.test(entry.mode)) {
      throw new Error(sha + " allowlisted source is not a regular blob: " + entry.name);
    }
  });
  return selected.map((entry) => entry.name);
}

function sourceAt(sha, name) {
  return git(["show", sha + ":" + name], { maxBuffer: 16 * 1024 * 1024 });
}

function snapshotAt(sha) {
  const sandbox = vm.createContext({ window: {} }, { codeGeneration: { strings: false, wasm: false } });
  const files = publicFiles(sha);
  files.forEach((name) => {
    new vm.Script(sourceAt(sha, name), { filename: sha + ":" + name }).runInContext(sandbox, { timeout: 2000 });
  });
  const content = sandbox.window.PREP_CONTENT;
  if (!content || typeof content !== "object") throw new Error(sha + " did not define public course content");
  if (!content.meta || typeof content.meta !== "object" || content.meta.id !== "course") {
    throw new Error(sha + " public course meta.id must be course");
  }
  const core = sandbox.window.PREP_CORE || {};
  const emptyPlainObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.prototype.toString.call(value) !== "[object Object]") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  };
  if (content.overlays !== undefined && (!emptyPlainObject(content.overlays) || Object.keys(content.overlays).length)) {
    throw new Error(sha + " public course has unresolved in-content overlays");
  }
  if (sandbox.window.PREP_OVERLAYS !== undefined && (!emptyPlainObject(sandbox.window.PREP_OVERLAYS) || Object.keys(sandbox.window.PREP_OVERLAYS).length)) {
    throw new Error(sha + " public course has unresolved PREP_OVERLAYS");
  }
  if (!Array.isArray(content.topics)) throw new Error(sha + " public course topics must be an array");
  if (!Array.isArray(content.useCore)) throw new Error(sha + " public course useCore must be an array");
  const topics = content.topics.slice();
  const topicIds = new Set();
  topics.forEach((topic) => {
    if (!topic || typeof topic !== "object" || typeof topic.id !== "string" || !ID.test(topic.id)) throw new Error(sha + " public course has an invalid local topic id");
    if (topicIds.has(topic.id)) throw new Error(sha + " public course has a duplicate local topic id: " + topic.id);
    topicIds.add(topic.id);
  });
  const usedCore = new Set();
  content.useCore.forEach((topicId) => {
    if (typeof topicId !== "string" || !ID.test(topicId)) throw new Error(sha + " public course has an invalid useCore topic id");
    if (usedCore.has(topicId)) throw new Error(sha + " public course has a duplicate useCore topic id: " + topicId);
    usedCore.add(topicId);
    if (!Object.hasOwn(core, topicId)) throw new Error(sha + " public course references missing core topic: " + topicId);
    if (!core[topicId] || typeof core[topicId] !== "object" || core[topicId].id !== topicId) {
      throw new Error(sha + " core topic id does not match its useCore key: " + topicId);
    }
    if (topicIds.has(topicId)) throw new Error(sha + " public course local topic duplicates useCore topic: " + topicId);
    topicIds.add(topicId);
    topics.push(core[topicId]);
  });
  return { meta: content.meta, topics };
}

function main(argv) {
  if (argv.length !== 2) {
    console.error("Usage: node engine/check_progress_compatibility.cjs BASE_SHA HEAD_SHA");
    return 2;
  }
  const baselineSha = commit(argv[0], "BASE_SHA");
  const headSha = commit(argv[1], "HEAD_SHA");
  assertProgressCompatible(snapshotAt(baselineSha), snapshotAt(headSha));
  console.log("progress compatibility passed: " + baselineSha + " -> " + headSha);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error("progress compatibility failed: " + error.message);
    process.exitCode = 1;
  }
}

module.exports = { snapshotAt };
