// Structural regression test for the DOM append order in engine/shell.html.
// The dependency-free engine test suite has no browser DOM implementation, so
// this verifies the renderer's append sequence rather than executing layout.
// Usage: node engine/test_teaching_order.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');

function between(source, start, end, label) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, 'could not isolate ' + label);
  return source.slice(from, to);
}

function inOrder(source, markers, label) {
  let at = -1;
  for (const marker of markers) {
    const next = source.indexOf(marker, at + 1);
    assert(next > at, label + ': expected after prior marker: ' + marker);
    at = next;
  }
}

assert(!shell.includes("c.body = (c.body || '') + c.deeper"), 'extended text remains optional depth');
assert(!shell.includes('c.check = {'), 'canonical quiz mapping is not mutated');

const sections = between(
  shell,
  '// sections, grouped into parts only when the chapter has more than one part',
  'var G = graded();',
  'learn-section renderer'
);
inOrder(sections, [
  "sh.appendChild(txt('h3', null, c.title))",
  'if (c.link && c.link.url) sec.appendChild(extLink(c.link));',
  'if (qbank && c.deeper)',
  'review.appendChild(pr);',
  "teaching.appendChild(el('div', 'prose', c.body));",
  'if (c.viz && window.VIZLIB && window.VIZLIB[c.viz])',
  'sec.insertBefore(cv, sec.children[1] || null)',
  "if (c.deeper && !qbank)",
  'if (c.check && !c.check.auditCaution)'
], 'diagram is inserted before optional teaching, depth and prediction check');
assert(sections.includes("cv.setAttribute('aria-label', c.title + ' diagram and text explanation')"), 'scrollable diagram has accessible region label');

assert(
  sections.includes("window.VIZLIB_CAPTIONS[c.viz] ? '<div class=\"cap\">' + window.VIZLIB_CAPTIONS[c.viz]"),
  'learn-section diagram includes its available caption'
);
inOrder(sections, [
  'body.appendChild(sec);',
  '});',
  'appendTopicViz();',
  'appendReadings();'
], 'extended resources follow all learn sections');

const prereqs = between(
  shell,
  'if (prereqs) {',
  '} else {',
  'prerequisite renderer'
);
inOrder(prereqs, [
  'body.appendChild(list);',
  'appendTopicViz();',
  'appendReadings();'
], 'prerequisite topic summary follows the complete checklist');

const empty = "if (!topic.learn.length) { appendTopicViz(); appendReadings(); }";
assert(shell.includes(empty), 'an empty chapter renders each legacy topic diagram/readings block once');
assert(!shell.includes('appendVizAndReadings'), 'combined legacy placement helper is not used');

const exercises = between(
  shell,
  '// exercises',
  '// spoken answer',
  'exercise renderer'
);
inOrder(exercises, [
  "ah.appendChild(txt('h4', null, a.title))",
  "box2.appendChild(el('div', 'prose', a.prompt));",
  'if (a.viz && window.VIZLIB && window.VIZLIB[a.viz])',
  'var ta2 = document.createElement(\'textarea\')'
], 'exercise DOM order is title, prompt, diagram, answer field');
assert(
  exercises.includes("window.VIZLIB_CAPTIONS[a.viz] ? '<div class=\"cap\">' + window.VIZLIB_CAPTIONS[a.viz]"),
  'exercise diagram includes its available caption'
);

console.log('test_teaching_order: OK (structural DOM-append ordering; no browser DOM in the dependency-free test suite)');
