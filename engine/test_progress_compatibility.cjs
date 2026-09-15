"use strict";

const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { assertProgressCompatible, canonicalItemSha256 } = require("./progress-compatibility.cjs");

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
const legacyUnhashableField = course();
legacyUnhashableField.topics[0].learn[0].legacyOptional = undefined;
assert.strictEqual(assertProgressCompatible(legacyUnhashableField, legacyUnhashableField), true,
  "two-argument callers do not canonical-hash legacy item fields");

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

function retirementManifest(item, overrides = {}) {
  return {
    version: 1,
    retirements: [{
      pack: "public_course", topic: "systems_caching", role: "learn", id: "cache_basics",
      sha256: canonicalItemSha256(item), reason: "Replace the synthetic lesson with new IDs.",
      replacements: ["cache_basics_v2"],
      ...overrides
    }]
  };
}

const retiredBaseline = course();
const retiredCandidate = clone(retiredBaseline);
retiredCandidate.topics[0].learn = [{ id: "cache_basics_v2", check: { question: "New question", options: ["One", "Two"], answer: 0 } }];
assert.strictEqual(assertProgressCompatible(retiredBaseline, retiredCandidate,
  retirementManifest(retiredBaseline.topics[0].learn[0])), true,
"an exact, reviewed retirement permits only the matching removed item");

assert.throws(() => assertProgressCompatible(retiredBaseline, retiredCandidate,
  retirementManifest(retiredBaseline.topics[0].learn[0], { sha256: "0".repeat(64) })),
/sha256 does not match/, "wrong baseline hash fails closed");
assert.throws(() => assertProgressCompatible(retiredBaseline, retiredCandidate,
  retirementManifest(retiredBaseline.topics[0].learn[0], { reason: " " })),
/reason must be a non-empty/, "blank retirement reason fails closed");
assert.throws(() => assertProgressCompatible(retiredBaseline, retiredCandidate,
  retirementManifest(retiredBaseline.topics[0].learn[0], { replacements: ["missing_replacement"] })),
/replacements must exist/, "replacement must be in the same candidate role and topic");
const reusedBaselineReplacement = clone(retiredBaseline);
reusedBaselineReplacement.topics[0].learn.push({ id: "already_present", check: null });
const candidateWithOldReplacement = clone(reusedBaselineReplacement);
candidateWithOldReplacement.topics[0].learn = [
  { id: "already_present", check: null },
  { id: "cache_basics_v2", check: { question: "New question", options: ["One", "Two"], answer: 0 } }
];
assert.throws(() => assertProgressCompatible(reusedBaselineReplacement, candidateWithOldReplacement,
  retirementManifest(reusedBaselineReplacement.topics[0].learn[0], { replacements: ["already_present"] })),
/replacements must be new IDs absent from the baseline/, "a retirement cannot claim an existing baseline item as its replacement");
assert.throws(() => assertProgressCompatible(retiredBaseline, retiredCandidate,
  { version: 1, retirements: [retirementManifest(retiredBaseline.topics[0].learn[0]).retirements[0], retirementManifest(retiredBaseline.topics[0].learn[0]).retirements[0]] }),
/duplicate content retirement/, "duplicate retirement entries fail closed");

const reusedRetiredId = clone(retiredCandidate);
reusedRetiredId.topics[0].activities.push({ id: "cache_basics" });
assert.throws(() => assertProgressCompatible(retiredBaseline, reusedRetiredId,
  retirementManifest(retiredBaseline.topics[0].learn[0])),
/retired id is reused/, "a retired ID cannot migrate across roles");
assert.throws(() => assertProgressCompatible(retiredBaseline, { meta: { id: "public_course" }, topics: [] },
  retirementManifest(retiredBaseline.topics[0].learn[0])),
/topic must exist|lost topic/, "a manifest cannot delete a topic or course");

const chainedBaseline = clone(retiredCandidate);
assert.strictEqual(assertProgressCompatible(chainedBaseline, clone(retiredCandidate),
  retirementManifest(retiredBaseline.topics[0].learn[0])), true,
"a prior retirement remains valid when its replacements remain in a later baseline");
const chainedMissingReplacement = clone(retiredCandidate);
chainedMissingReplacement.topics[0].learn = [];
assert.throws(() => assertProgressCompatible(chainedBaseline, chainedMissingReplacement,
  retirementManifest(retiredBaseline.topics[0].learn[0])),
/replacements must exist/, "a chained retirement requires its replacement IDs to remain");
const prototypeManifest = JSON.parse('{"version":1,"retirements":[],"__proto__":{}}');
assert.throws(() => assertProgressCompatible(retiredBaseline, retiredCandidate, prototypeManifest),
/must contain exactly/, "prototype manifest keys fail closed");

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

withFixture({}, ({ root, sha: initialSha }) => {
  const legacySection = { id: "synthetic_legacy_section", check: { question: "Synthetic legacy question", options: ["A", "B"], answer: 1 } };
  write(root, "core/topic.js", "window.PREP_CORE.topic_one=" + JSON.stringify({ id: "topic_one", learn: [legacySection], activities: [] }) + ";\n");
  git(root, ["add", "core/topic.js"]); git(root, ["commit", "-m", "synthetic baseline"]);
  const baselineSha = git(root, ["rev-parse", "HEAD"]);
  const replacement = { id: "synthetic_v2_section", check: { question: "Synthetic replacement", options: ["One", "Two"], answer: 0 } };
  write(root, "core/topic.js", "window.PREP_CORE.topic_one=" + JSON.stringify({ id: "topic_one", learn: [replacement], activities: [] }) + ";\n");
  write(root, "content-revisions.json", JSON.stringify({
    version: 1,
    retirements: [{
      pack: "course", topic: "topic_one", role: "learn", id: "synthetic_legacy_section",
      sha256: canonicalItemSha256(legacySection), reason: "Synthetic clean-context replacement.",
      replacements: ["synthetic_v2_section"]
    }]
  }) + "\n");
  git(root, ["add", "core/topic.js", "content-revisions.json"]); git(root, ["commit", "-m", "synthetic retirement"]);
  const candidateSha = git(root, ["rev-parse", "HEAD"]);
  assert.strictEqual(cli(root, baselineSha, candidateSha).status, 0, "candidate commit's exact retirement manifest permits a hash-matched replacement");
  write(root, "content-revisions.json", "not valid JSON from the dirty working tree\n");
  assert.strictEqual(cli(root, baselineSha, candidateSha).status, 0, "CLI reads the candidate commit manifest, not a dirty working tree file");
  write(root, "content-revisions.json", JSON.stringify({
    version: 1,
    retirements: [{
      pack: "course", topic: "topic_one", role: "learn", id: "synthetic_legacy_section",
      sha256: "0".repeat(64), reason: "Synthetic invalid hash.", replacements: ["synthetic_v2_section"]
    }]
  }) + "\n");
  git(root, ["add", "content-revisions.json"]); git(root, ["commit", "-m", "invalid synthetic retirement"]);
  failsCli("candidate manifest hash", cli(root, baselineSha, git(root, ["rev-parse", "HEAD"])), /sha256 does not match/);
  assert.notStrictEqual(initialSha, baselineSha, "fixture baseline is a distinct commit");
});

withFixture({}, ({ root, sha }) => {
  const blob = git(root, ["hash-object", "-w", "--stdin"], "outside manifest");
  git(root, ["update-index", "--add", "--cacheinfo", "120000," + blob + ",content-revisions.json"]);
  git(root, ["commit", "-m", "symlink manifest"]);
  const candidateSha = git(root, ["rev-parse", "HEAD"]);
  failsCli("symlink manifest", cli(root, sha, candidateSha), /content revision manifest is not a regular blob/);
});

console.log("progress compatibility tests passed");
