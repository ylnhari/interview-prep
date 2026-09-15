"use strict";

const crypto = require("crypto");

/*
 * Compatibility is intentionally stricter than rendering validity. Saved browser
 * progress is keyed by course, topic, section, and activity identifiers; an
 * existing quiz is also a saved mapping because its answer index is persisted.
 */

function fail(message) {
  throw new Error("progress compatibility: " + message);
}

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(label + " must be an object");
  return value;
}

function plainObject(value, label) {
  object(value, label);
  const prototype = Object.getPrototypeOf(value);
  if (Object.prototype.toString.call(value) !== "[object Object]" ||
      (prototype !== null && Object.getPrototypeOf(prototype) !== null)) {
    fail(label + " must be a plain object");
  }
  return value;
}

function exactKeys(value, expected, label) {
  plainObject(value, label);
  const actual = Object.getOwnPropertyNames(value).sort();
  const wanted = expected.slice().sort();
  if (Object.getOwnPropertySymbols(value).length || actual.length !== wanted.length ||
      actual.some((key, index) => key !== wanted[index])) {
    fail(label + " must contain exactly: " + wanted.join(", "));
  }
  if (actual.some((key) => key === "__proto__" || key === "prototype" || key === "constructor")) {
    fail(label + " must not contain prototype keys");
  }
  return value;
}

function id(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(value)) {
    fail(label + " must match /^[A-Za-z0-9_-]{1,150}$/");
  }
  return value;
}

function array(value, label) {
  if (!Array.isArray(value)) fail(label + " must be an array");
  return value;
}

function optionalArray(value, label) {
  return value === undefined ? [] : array(value, label);
}

function quiz(value, label) {
  if (value == null) return null;
  object(value, label);
  if (typeof value.question !== "string") fail(label + ".question must be a string");
  const options = array(value.options, label + ".options");
  if (options.length < 2 || options.some((option) => typeof option !== "string")) {
    fail(label + ".options must contain at least two strings");
  }
  if (!Number.isInteger(value.answer) || value.answer < 0 || value.answer >= options.length) {
    fail(label + ".answer must be an option index");
  }
  return { question: value.question, options: options.slice(), answer: value.answer };
}

function addUnique(map, value, label) {
  const key = id(value, label);
  if (map.has(key)) fail("duplicate " + label + ": " + key);
  map.set(key, true);
  return key;
}

function canonicalJson(value, label) {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(label + " contains a non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return "[" + value.map((item, index) => canonicalJson(item, label + "[" + index + "]")).join(",") + "]";
  if (value && typeof value === "object") {
    plainObject(value, label);
    const keys = Object.getOwnPropertyNames(value).sort();
    if (Object.getOwnPropertySymbols(value).length || keys.some((key) => key === "__proto__" || key === "prototype" || key === "constructor")) {
      fail(label + " contains prototype keys");
    }
    return "{" + keys.map((key) => JSON.stringify(key) + ":" + canonicalJson(value[key], label + "." + key)).join(",") + "}";
  }
  fail(label + " contains an unsupported value");
}

function canonicalItemSha256(value) {
  return crypto.createHash("sha256").update(canonicalJson(value, "item"), "utf8").digest("hex");
}

/*
 * A snapshot is the resolved course shape:
 * { meta: { id }, topics: [{ id, learn: [{ id, check }], activities: [{ id }] }] }.
 * Callers that source core topics or overlays separately should resolve them
 * before calling this public, dependency-free API.
 */
function index(snapshot, label, withHashes) {
  object(snapshot, label);
  const packId = id(object(snapshot.meta, label + ".meta").id, label + ".meta.id");
  const topics = array(snapshot.topics, label + ".topics");
  const topicIds = new Map();
  const indexedTopics = new Map();

  topics.forEach((topic, topicIndex) => {
    object(topic, label + ".topics[" + topicIndex + "]");
    const topicId = addUnique(topicIds, topic.id, "topic id");
    const topicActivityIds = new Map();
    const sections = new Map();

    optionalArray(topic.learn, "topic " + topicId + ".learn").forEach((section, sectionIndex) => {
      object(section, "topic " + topicId + ".learn[" + sectionIndex + "]");
      const sectionId = addUnique(sections, section.id, "section id in topic " + topicId);
      sections.set(sectionId, {
        quiz: quiz(section.check, "section " + topicId + "/" + sectionId + ".check"),
        sha256: withHashes ? canonicalItemSha256(section) : undefined
      });
    });
    optionalArray(topic.activities, "topic " + topicId + ".activities").forEach((activity, activityIndex) => {
      object(activity, "topic " + topicId + ".activities[" + activityIndex + "]");
      const activityId = addUnique(topicActivityIds, activity.id, "activity id in topic " + topicId);
      topicActivityIds.set(activityId, { sha256: withHashes ? canonicalItemSha256(activity) : undefined });
    });
    indexedTopics.set(topicId, { sections, activityIds: topicActivityIds });
  });

  const itemIds = new Set();
  indexedTopics.forEach((topic) => {
    topic.sections.forEach((_, itemId) => itemIds.add(itemId));
    topic.activityIds.forEach((_, itemId) => itemIds.add(itemId));
  });
  return { packId, topics: indexedTopics, itemIds };
}

function requireExisting(candidate, baseline, kind, topicId, retired) {
  for (const key of baseline.keys()) {
    if (!candidate.has(key) && !(retired && retired.has(key))) {
      fail("lost " + kind + (topicId ? " in topic " + topicId : "") + ": " + key);
    }
  }
}

function sameQuiz(before, after, location) {
  if (before === null) return;
  if (after === null || before.question !== after.question || before.answer !== after.answer ||
      before.options.length !== after.options.length || before.options.some((option, index) => option !== after.options[index])) {
    fail("changed saved quiz mapping: " + location);
  }
}

function manifestRoleMap(topic, role) {
  return role === "learn" ? topic.sections : topic.activityIds;
}

function validateRetirementManifest(manifest, before, after) {
  const retired = new Map();
  if (manifest === undefined) return retired;
  exactKeys(manifest, ["retirements", "version"], "content revision manifest");
  if (manifest.version !== 1) fail("content revision manifest version must be 1");
  const entries = array(manifest.retirements, "content revision manifest.retirements");
  const seen = new Set();
  entries.forEach((entry, index) => {
    const label = "content revision manifest.retirements[" + index + "]";
    exactKeys(entry, ["id", "pack", "reason", "replacements", "role", "sha256", "topic"], label);
    const packId = id(entry.pack, label + ".pack");
    const topicId = id(entry.topic, label + ".topic");
    const itemId = id(entry.id, label + ".id");
    if (entry.role !== "learn" && entry.role !== "activities") fail(label + ".role must be learn or activities");
    if (typeof entry.reason !== "string" || !entry.reason.trim() || entry.reason.trim().length > 1000) {
      fail(label + ".reason must be a non-empty string up to 1000 characters");
    }
    if (typeof entry.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(entry.sha256)) fail(label + ".sha256 must be a lowercase SHA-256 hash");
    const replacements = array(entry.replacements, label + ".replacements");
    if (!replacements.length) fail(label + ".replacements must not be empty");
    const replacementIds = new Set();
    replacements.forEach((replacement, replacementIndex) => {
      const replacementId = id(replacement, label + ".replacements[" + replacementIndex + "]");
      if (replacementId === itemId || replacementIds.has(replacementId)) fail(label + ".replacements must contain unique new IDs");
      replacementIds.add(replacementId);
    });
    const key = packId + "/" + topicId + "/" + entry.role + "/" + itemId;
    if (seen.has(key)) fail("duplicate content retirement: " + key);
    seen.add(key);
    if (packId !== before.packId || packId !== after.packId) fail(label + ".pack must exactly match the course pack id");
    const beforeTopic = before.topics.get(topicId);
    const afterTopic = after.topics.get(topicId);
    if (!beforeTopic || !afterTopic) fail(label + ".topic must exist in both baseline and candidate");
    const baselineItem = manifestRoleMap(beforeTopic, entry.role).get(itemId);
    const candidateRole = manifestRoleMap(afterTopic, entry.role);
    replacementIds.forEach((replacementId) => {
      if (!candidateRole.has(replacementId)) fail(label + ".replacements must exist in the same candidate topic and role: " + replacementId);
      if (baselineItem && before.itemIds.has(replacementId)) fail(label + ".replacements must be new IDs absent from the baseline: " + replacementId);
    });
    if (after.itemIds.has(itemId)) fail("retired id is reused by candidate: " + itemId);
    if (baselineItem && baselineItem.sha256 !== entry.sha256) {
      fail(label + ".sha256 does not match the canonical baseline item");
    }
    if (baselineItem) {
      const topicKey = topicId + "/" + entry.role;
      if (!retired.has(topicKey)) retired.set(topicKey, new Set());
      retired.get(topicKey).add(itemId);
    }
  });
  return retired;
}

function assertProgressCompatible(baseline, candidate, manifest) {
  const withHashes = manifest !== undefined;
  const before = index(baseline, "baseline", withHashes);
  const after = index(candidate, "candidate", withHashes);
  if (before.packId !== after.packId) fail("changed pack id: " + before.packId + " -> " + after.packId);
  const retired = validateRetirementManifest(manifest, before, after);
  requireExisting(after.topics, before.topics, "topic");

  for (const [topicId, beforeTopic] of before.topics) {
    const afterTopic = after.topics.get(topicId);
    requireExisting(afterTopic.sections, beforeTopic.sections, "section", topicId, retired.get(topicId + "/learn"));
    requireExisting(afterTopic.activityIds, beforeTopic.activityIds, "activity", topicId, retired.get(topicId + "/activities"));
    for (const [sectionId, beforeSection] of beforeTopic.sections) {
      const afterSection = afterTopic.sections.get(sectionId);
      if (!afterSection && retired.get(topicId + "/learn")?.has(sectionId)) continue;
      sameQuiz(beforeSection.quiz, afterSection.quiz, topicId + "/" + sectionId);
    }
  }
  return true;
}

module.exports = { assertProgressCompatible, canonicalItemSha256 };
