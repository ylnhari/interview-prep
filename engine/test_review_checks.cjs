'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { snapshotAt } = require('./check_progress_compatibility.cjs');
const { canonicalItemSha256, assertProgressCompatible } = require('./progress-compatibility.cjs');
const root = path.resolve(__dirname, '..');
const baselineSha = 'abd4b97ad27c9b2c95a8409a49b018fd9a5311fe';
const baseline = snapshotAt(baselineSha);
const context = vm.createContext({ window: {} });
for (const file of ['library.js', ...fs.readdirSync(path.join(root, 'core')).filter(f => f.endsWith('.js') && f !== 'library.js').sort()])
  new vm.Script(fs.readFileSync(path.join(root, 'core', file), 'utf8'), { filename: file }).runInContext(context);
new vm.Script(fs.readFileSync(path.join(root, 'packs/course/content.js'), 'utf8')).runInContext(context);
const { PREP_CORE: core, PREP_CONTENT: content } = context.window;
const candidate = { meta: content.meta, topics: [...content.topics, ...content.useCore.map(id => core[id])] };
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content-revisions.json'), 'utf8'));
assertProgressCompatible(baseline, candidate, manifest);
const normalize = check => ({ question: check.question, options: check.options, answer: check.answer });
const cases = [
  ['sql-databases', 'sql-f2', 1, /skip scans/, /PostgreSQL 18/],
  ['sql-databases', 'sql-f9', 1, /destructive contraction/, /not promise every step is reversible/],
  ['networking-basics', 'nb-f3', 1, /frames from several streams/, /multiple streams/],
  ['search-and-retrieval', 'sr-f2', 2, /raw-count TF-IDF/, /Raw-count term frequency/],
  ['mlops-tooling', 'mot-0', 1, /DVC supports experiments/, /separate tracker is not mandatory/],
  ['llm-inference-engineering', 'lie-f9', 1, /goodput may rise or fall/, /180\/s/],
  ['system-design-cases', 'sdc-10', 1, /independently verified segments/, /cannot undo disclosure/],
  ['classical-models', 'cm-0', 1, /without inducing sparsity/, /does not categorically forbid/],
  ['deep-learning-essentials', 'dle-f2', 1, /local data-loss gradient/, /momentum, weight decay/],
  ['deep-learning-essentials', 'dle-f6', 1, /equal input\/intermediate\/output/, /9\*Cin\*Cmid/],
  ['or-tooling', 'or-6', 1, /I=100/, /denominators differ/],
  ['counting-and-sketches', 'cs-f4', 1, /nonnegative increments/, /Signed deletions or overflow/]
];
const shell = fs.readFileSync(path.join(root, 'engine/shell.html'), 'utf8');
const keyExpression = shell.match(/var checkKey = ([^;]+);/)[1];
const rendererKey = c => vm.runInNewContext(keyExpression, { c });
const indexSource = shell.match(/function idHash\(str\)[\s\S]*?(?=  \/\/ Display permutation)/)[0];
const indexContext = vm.createContext({});
new vm.Script(indexSource).runInContext(indexContext);
for (const [topic, id, answer, text, explanation] of cases) {
  const previous = baseline.topics.find(t => t.id === topic).learn.find(s => s.id === id).check;
  const current = core[topic].learn.find(s => s.id === id).check;
  assert.equal(current.answer, answer);
  assert.equal(current.answer, previous.answer, 'Canonical answer indices stay unchanged');
  assert.equal(current.options.length, previous.options.length);
  assert.match(current.question + ' ' + current.options[current.answer], text);
  assert.match(current.explain, explanation);
  assert.equal(current.revision, 'audit-2026-10-11-review');
  assert.notEqual(current.revision, previous.revision);
  const entry = manifest.quizRevisions.filter(e => e.topic === topic && e.id === id);
  assert.equal(entry.length, 1);
  assert.equal(entry[0].before, canonicalItemSha256(normalize(previous)));
  assert.equal(entry[0].after, canonicalItemSha256(normalize(current)));
  assert.equal(entry[0].revision, current.revision);
  const oldKey = rendererKey({ id, check: previous });
  const newKey = rendererKey({ id, check: current });
  assert.notEqual(oldKey, newKey);
  const oldIndex = indexContext.legacyQuizIndex(topic, id, previous.answer, previous.options.length);
  const currentIndex = indexContext.legacyQuizIndex(topic, id, current.answer, current.options.length);
  assert.equal(oldIndex, currentIndex, 'Legacy rotation remains stable');
  const checks = { [oldKey]: oldIndex };
  assert.equal(checks[newKey], undefined, 'Old selections do not answer the corrected check');
  checks[newKey] = currentIndex;
  assert.equal(checks[oldKey], oldIndex, 'Answering the revision preserves historical evidence');
  delete checks[newKey];
  assert.equal(checks[oldKey], oldIndex, 'Retry removes only the new revision key');
}
assert.equal(100 * .99, 99);
assert.equal(200 * .9, 180);
assert.equal((100 - 97) / 100, .03);
assert.equal(9 * 4 * 4 + 9 * 4 * 4, 18 * 4 * 4);
console.log('Twelve revised mappings verified against exact baseline, manifest hashes and actual renderer key/index functions.');
