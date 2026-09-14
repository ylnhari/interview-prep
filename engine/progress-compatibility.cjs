"use strict";

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

/*
 * A snapshot is the resolved course shape:
 * { meta: { id }, topics: [{ id, learn: [{ id, check }], activities: [{ id }] }] }.
 * Callers that source core topics or overlays separately should resolve them
 * before calling this public, dependency-free API.
 */
function index(snapshot, label) {
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
      sections.set(sectionId, { quiz: quiz(section.check, "section " + topicId + "/" + sectionId + ".check") });
    });
    optionalArray(topic.activities, "topic " + topicId + ".activities").forEach((activity, activityIndex) => {
      object(activity, "topic " + topicId + ".activities[" + activityIndex + "]");
      const activityId = addUnique(topicActivityIds, activity.id, "activity id in topic " + topicId);
      topicActivityIds.set(activityId, true);
    });
    indexedTopics.set(topicId, { sections, activityIds: topicActivityIds });
  });

  return { packId, topics: indexedTopics };
}

function requireExisting(candidate, baseline, kind, topicId) {
  for (const key of baseline.keys()) {
    if (!candidate.has(key)) fail("lost " + kind + (topicId ? " in topic " + topicId : "") + ": " + key);
  }
}

function sameQuiz(before, after, location) {
  if (before === null) return;
  if (after === null || before.question !== after.question || before.answer !== after.answer ||
      before.options.length !== after.options.length || before.options.some((option, index) => option !== after.options[index])) {
    fail("changed saved quiz mapping: " + location);
  }
}

function assertProgressCompatible(baseline, candidate) {
  const before = index(baseline, "baseline");
  const after = index(candidate, "candidate");
  if (before.packId !== after.packId) fail("changed pack id: " + before.packId + " -> " + after.packId);
  requireExisting(after.topics, before.topics, "topic");

  for (const [topicId, beforeTopic] of before.topics) {
    const afterTopic = after.topics.get(topicId);
    requireExisting(afterTopic.sections, beforeTopic.sections, "section", topicId);
    requireExisting(afterTopic.activityIds, beforeTopic.activityIds, "activity", topicId);
    for (const [sectionId, beforeSection] of beforeTopic.sections) {
      sameQuiz(beforeSection.quiz, afterTopic.sections.get(sectionId).quiz, topicId + "/" + sectionId);
    }
  }
  return true;
}

module.exports = { assertProgressCompatible };
