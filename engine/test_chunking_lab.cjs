// Tests the pure chunking-lab functions used beside the RAG chunking lesson.
// Usage: node engine/test_chunking_lab.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'viz', 'zzzz-chunking-lab.js'), 'utf8'), ctx);
const lab = ctx.window.PREP_CHUNK_LAB;
assert(lab, 'lab API exported');
const W = lab.words.length;
const q = id => lab.queries.find(x => x.id === id);
const level = (s, id, size = 20, overlap = 4, thr = 0.5) => lab.assess(s, lab.run(s, size, overlap, thr), q(id)).level;

assert.equal(lab.strategies.length, 9, 'nine strategies');
assert.deepEqual(Array.from(lab.strategies, s => s[0]), ['fixed', 'recursive', 'sentence', 'structural', 'semantic', 'parent', 'late', 'contextual', 'proposition'], 'lab order matches the lesson headings');

function coversAll(chunks) {
  const seen = new Array(W).fill(false);
  chunks.forEach(c => { for (let i = c.range[0]; i < c.range[1]; i++) seen[i] = true; });
  return seen.every(Boolean);
}

for (const s of ['fixed', 'recursive', 'sentence', 'structural', 'semantic', 'parent', 'contextual', 'late']) {
  for (const size of [6, 12, 20, 40, 60]) {
    const chunks = lab.run(s, size, 4, 0.5);
    assert(chunks.length > 0, s + ' produces chunks');
    assert(coversAll(chunks), s + ' covers every word at size ' + size);
    if (s === 'recursive' || s === 'contextual' || s === 'late') {
      chunks.forEach(c => assert(c.range[1] - c.range[0] <= size, s + ' respects the size limit'));
      for (let i = 1; i < chunks.length; i++) assert.equal(chunks[i].range[0], chunks[i - 1].range[1], s + ' chunks are contiguous');
    }
  }
}

// fixed-size overlap repeats exactly `overlap` words between neighbours
const fx = lab.run('fixed', 10, 3);
for (let i = 1; i < fx.length; i++) assert.equal(fx[i - 1].range[1] - fx[i].range[0], 3, 'overlap is 3 words');

// sentence splitting never cuts inside a sentence and makes one piece per sentence or row
const content = lab.units.filter(u => u.kind !== 'h').length;
assert.equal(lab.run('sentence').length, content, 'one chunk per sentence or table row');

// structural never splits the meal table and adds the heading path
const tableUnits = lab.units.filter(u => u.kind === 'r').map(u => u.id);
for (const size of [6, 10, 20, 40]) {
  const holders = lab.run('structural', size, 0).filter(c => c.units.some(id => tableUnits.includes(id)));
  assert.equal(holders.length, 1, 'table stays in one structural chunk at size ' + size);
}
assert(lab.run('structural', 20).every(c => /^Travel and expense policy > /.test(c.meta.heading)), 'heading path added');

// semantic cuts follow the threshold: the overnight sentence (0.46) separates at 0.50, joins at 0.45
assert.equal(level('semantic', 'dinner'), 'bad');
assert.equal(level('semantic', 'dinner', 0, 0, 0.45), 'good');
assert(/0\.46, below the 0\.50 threshold/.test(lab.assess('semantic', lab.run('semantic', 0, 0, 0.5), q('dinner')).text));

// lesson claims at the default settings (20 words, overlap 4)
assert.equal(level('fixed', 'business'), 'bad', 'fixed windows split the business-class evidence');
assert.equal(level('recursive', 'dinner'), 'bad', 'recursive separates the overnight qualification');
assert.equal(level('sentence', 'mumbai'), 'bad', 'sentence splitting separates the row from its header');
assert(/header row/.test(lab.assess('sentence', lab.run('sentence'), q('mumbai')).text));
for (const id of lab.queries.map(x => x.id)) {
  assert.equal(level('parent', id), 'good', 'parent-child answers ' + id);
  assert.notEqual(level('late', id), 'bad', 'late chunking helps search for ' + id);
}
assert.equal(level('late', 'business'), 'warn');
assert.equal(level('contextual', 'exception'), 'warn');
const lateChunks = lab.run('late', 20);
assert(lateChunks.some(c => c.meta.late.some(x => x.pronoun === 'It' && /Business class/.test(x.referent))), 'late vector context names the referent');
assert(lab.run('contextual', 20).every(c => c.meta.note.length > 40), 'every contextual chunk has a note');

// small fixed chunks report the dangling pronoun
const fixedVerdict = lab.assess('fixed', lab.run('fixed', 6, 0), q('exception'));
assert.notEqual(fixedVerdict.level, 'good', 'small fixed chunks split the exception evidence');
assert(/They/.test(fixedVerdict.text), 'dangling pronoun is reported');

// propositions
const prop = lab.assess('proposition', lab.run('proposition'), q('business'));
assert.equal(prop.chunks.length, 2, 'two propositions answer the business-class question');
assert.equal(level('proposition', 'exception'), 'good', 'one rewritten proposition answers the exception question');
lab.queries.forEach(x => x.props.forEach(i => assert(lab.run('proposition')[i], 'proposition index exists for ' + x.id)));
const d = lab.diff('It needs written approval from a vice president before booking.', 'Business class needs written approval from a vice president before booking.');
assert.deepEqual(Array.from(d.filter(x => x.op !== 'same'), x => x.op + ':' + x.w), ['del:It', 'add:Business', 'add:class'], 'diff marks the pronoun rewrite');

console.log('chunking lab tests passed');
