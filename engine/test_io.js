// Unit test for the progress export/import functions in engine/shell.html (window.PREP_IO).
// No DOM, no dependencies. Usage: node engine/test_io.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
const block = [...shell.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => /window\.PREP_IO\s*=/.test(s));
assert(block, 'shell.html has no PREP_IO script block');
const w = {};
new Function('window', block)(w);
const IO = w.PREP_IO;

const key = 'prep-state-example-v1';
const state = { view: 'serving-and-scale', hideAnswers: true, whoOpen: true,
  topics: { 'serving-and-scale': { learn: { 'ss-0': true, 'ss-1:deeper': true }, checks: { 'ss-0': 1 }, reads: { 0: true }, connect: { status: 'none', attempts: 0 }, acts: { 'ss-a1': { status: 'pass', attempts: 2, lastScore: 81, lastAnswer: 'x' } }, said: true, updatedAt: null } } };

// round trip through the export envelope
const text = IO.serialise(key, state, new Date('2026-09-09T10:00:00Z'));
const doc = JSON.parse(text);
assert.strictEqual(doc.format, IO.FORMAT);
assert.strictEqual(doc.key, key);
assert.strictEqual(doc.exportedAt, '2026-09-09T10:00:00.000Z');
const back = IO.parse(text);
assert.deepStrictEqual(back.state, state);
assert.strictEqual(back.key, key);

// a raw state object (localStorage value pasted into a file) is accepted, with no key
const raw = IO.parse(JSON.stringify(state));
assert.deepStrictEqual(raw.state, state);
assert.strictEqual(raw.key, null);

// rejects things that are not progress
for (const bad of ['', 'nope', '[]', '{}', '{"topics":[]}', '{"format":"interview-prep-progress","state":{"topics":"x"}}', '42']) {
  assert.throws(() => IO.parse(bad), 'should reject ' + JSON.stringify(bad));
}
assert.strictEqual(IO.validState({ topics: {} }), true);
assert.strictEqual(IO.validState({ topics: [] }), false);
assert.strictEqual(IO.validState(null), false);

// file name is derived from the storage key
assert.strictEqual(IO.filename(key, new Date('2026-09-09T10:00:00Z')), 'example-progress-2026-09-09.json');
assert.strictEqual(IO.filename('prep-state-acme-mle-loop-r2-v1', new Date('2026-01-02T00:00:00Z')), 'acme-mle-loop-r2-progress-2026-01-02.json');

console.log('test_io: OK');
