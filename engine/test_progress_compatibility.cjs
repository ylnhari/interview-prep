"use strict";

const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { assertProgressCompatible } = require("./progress-compatibility.cjs");

const CLI = path.join(__dirname, "check_progress_compatibility.cjs");

function course() {
  return {
    meta: { id: "public_course" },
    topics: [{
      id: "systems_caching",
      learn: [{ id: "cache_basics", check: { question: "What is cached?", options: ["A", "B"], answer: 1 } }],
      activities: [{ id: "cache_exercise" }]
    }]
  };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rejects(label, change) {
  const baseline = course(); const candidate = clone(baseline); change(candidate);
  assert.throws(() => assertProgressCompatible(baseline, candidate), /progress compatibility:/, label);
}

assert.strictEqual(assertProgressCompatible(course(), clone(course())), true, "same course is compatible");

const reordered = clone(course());
reordered.topics.unshift({ id: "new_topic", learn: [{ id: "new_section", check: null }], activities: [{ id: "new_activity" }] });
reordered.topics[1].learn.unshift({ id: "new_section_existing_topic", check: null });
reordered.topics[1].activities.unshift({ id: "new_activity_existing_topic" });
assert.strictEqual(assertProgressCompatible(course(), reordered), true, "new IDs and stable reordering are allowed");

const repeatedLocalIds = {
  meta: { id: "public_course" },
  topics: [
    { id: "topic_one", learn: [{ id: "shared_id", check: null }], activities: [{ id: "shared_id" }] },
    { id: "topic_two", learn: [{ id: "shared_id", check: null }], activities: [{ id: "shared_id" }] }
  ]
};
assert.strictEqual(assertProgressCompatible(repeatedLocalIds, clone(repeatedLocalIds)), true,
  "the same local ID is valid in separate topics and roles");
assert.strictEqual(assertProgressCompatible(
  { meta: { id: "empty_course" }, topics: [{ id: "optional_lists" }] },
  { meta: { id: "empty_course" }, topics: [{ id: "optional_lists" }] }
), true, "absent learn and activities resolve to empty lists");

const addedQuiz = clone(course());
addedQuiz.topics[0].learn[0].check = null;
const newQuiz = clone(addedQuiz);
newQuiz.topics[0].learn[0].check = { question: "New question", options: ["A", "B"], answer: 0 };
assert.strictEqual(assertProgressCompatible(addedQuiz, newQuiz), true, "adding a quiz to a formerly quiz-free section is allowed");

rejects("changed question", (candidate) => { candidate.topics[0].learn[0].check.question = "Changed"; });
rejects("changed option text", (candidate) => { candidate.topics[0].learn[0].check.options[0] = "Changed"; });
rejects("changed option order", (candidate) => { candidate.topics[0].learn[0].check.options.reverse(); });
rejects("changed option count", (candidate) => { candidate.topics[0].learn[0].check.options.push("C"); });
rejects("changed answer index", (candidate) => { candidate.topics[0].learn[0].check.answer = 0; });
rejects("removed quiz", (candidate) => { candidate.topics[0].learn[0].check = null; });
rejects("lost topic", (candidate) => { candidate.topics = []; });
rejects("lost section", (candidate) => { candidate.topics[0].learn = []; });
rejects("lost activity", (candidate) => { candidate.topics[0].activities = []; });
rejects("moved section", (candidate) => {
  candidate.topics.push({ id: "other_topic", learn: [candidate.topics[0].learn.pop()], activities: [] });
});
rejects("moved activity", (candidate) => {
  candidate.topics.push({ id: "other_topic", learn: [], activities: [candidate.topics[0].activities.pop()] });
});
rejects("changed pack", (candidate) => { candidate.meta.id = "other_course"; });
rejects("duplicate topic", (candidate) => { candidate.topics.push(clone(candidate.topics[0])); });
rejects("duplicate section in topic", (candidate) => { candidate.topics[0].learn.push(clone(candidate.topics[0].learn[0])); });
rejects("duplicate activity in topic", (candidate) => { candidate.topics[0].activities.push(clone(candidate.topics[0].activities[0])); });
rejects("malformed section", (candidate) => { candidate.topics[0].learn = null; });
rejects("malformed activity", (candidate) => { candidate.topics[0].activities = null; });
rejects("malformed quiz", (candidate) => { candidate.topics[0].learn[0].check.options = ["A"]; });
rejects("malformed id", (candidate) => { candidate.topics[0].id = "topic/with/slash"; });
assert.throws(() => assertProgressCompatible(null, course()), /baseline must be an object/, "missing baseline fails closed");

function git(cwd, args, input) {
  const result = childProcess.spawnSync("git", args, { cwd, encoding: "utf8", input });
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function write(root, name, source) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source, "utf8");
}

function courseSource(useCore) {
  return "window.PREP_CONTENT={meta:{id:'course'},topics:[],useCore:" + JSON.stringify(useCore) + "};\n";
}

function createFixture({ courseFile = true, library = true, coreTopic = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "interview-prep-progress-"));
  git(root, ["init"]);
  git(root, ["config", "user.email", "test@example.invalid"]);
  git(root, ["config", "user.name", "Compatibility Test"]);
  if (library) write(root, "core/library.js", "window.PREP_CORE=window.PREP_CORE||{};\n");
  if (coreTopic) write(root, "core/topic.js", "window.PREP_CORE.topic_one={id:'topic_one',learn:[],activities:[]};\n");
  if (courseFile) write(root, "packs/course/content.js", courseSource(["topic_one"]));
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "fixture"]);
  return { root, sha: git(root, ["rev-parse", "HEAD"]) };
}

function cli(root, ...args) {
  return childProcess.spawnSync(process.execPath, [CLI, ...args], { cwd: root, encoding: "utf8" });
}

function failsCli(label, result, pattern) {
  assert.notStrictEqual(result.status, 0, label + " unexpectedly passed");
  assert.match(result.stderr + result.stdout, pattern, label);
}

function withFixture(options, test) {
  const fixture = createFixture(options);
  try { test(fixture); } finally { fs.rmSync(fixture.root, { recursive: true, force: true }); }
}

withFixture({}, ({ root, sha }) => {
  assert.strictEqual(cli(root, sha, sha).status, 0, "same committed public revision passes");
  write(root, "packs/course/content.js", "throw new Error('dirty source must not be loaded');\n");
  assert.strictEqual(cli(root, sha, sha).status, 0, "dirty source is excluded in favour of committed Git objects");
  failsCli("missing baseline", cli(root, "0".repeat(40), sha), /BASE_SHA/);
});

withFixture({ courseFile: false }, ({ root, sha }) => {
  failsCli("missing course", cli(root, sha, sha), /missing allowlisted packs\/course\/content\.js/);
});

withFixture({ library: false }, ({ root, sha }) => {
  failsCli("missing core", cli(root, sha, sha), /missing allowlisted core\/library\.js/);
});

withFixture({}, ({ root }) => {
  write(root, "packs/course/content.js", courseSource(["topic_one", "topic_one"]));
  git(root, ["add", "packs/course/content.js"]); git(root, ["commit", "-m", "duplicate core"]);
  const sha = git(root, ["rev-parse", "HEAD"]);
  failsCli("duplicate useCore", cli(root, sha, sha), /duplicate useCore topic id/);
});

withFixture({}, ({ root }) => {
  write(root, "packs/course/content.js", courseSource(["topic_one"]) + "window.PREP_CONTENT.overlays={topic_one:{}};\n");
  git(root, ["add", "packs/course/content.js"]); git(root, ["commit", "-m", "unresolved overlay"]);
  const sha = git(root, ["rev-parse", "HEAD"]);
  failsCli("in-content overlay", cli(root, sha, sha), /unresolved in-content overlays/);
});

withFixture({}, ({ root }) => {
  write(root, "packs/course/content.js", courseSource(["topic_one"]) + "window.PREP_OVERLAYS={topic_one:{}};\n");
  git(root, ["add", "packs/course/content.js"]); git(root, ["commit", "-m", "unresolved global overlay"]);
  const sha = git(root, ["rev-parse", "HEAD"]);
  failsCli("global overlay", cli(root, sha, sha), /unresolved PREP_OVERLAYS/);
});

withFixture({}, ({ root }) => {
  const blob = git(root, ["hash-object", "-w", "--stdin"], "ignored");
  git(root, ["update-index", "--add", "--cacheinfo", "120000," + blob + ",core/library.js"]);
  git(root, ["commit", "-m", "symlink core"]);
  const sha = git(root, ["rev-parse", "HEAD"]);
  failsCli("symlink blob", cli(root, sha, sha), /not a regular blob: core\/library\.js/);
});

console.log("progress compatibility tests passed");
