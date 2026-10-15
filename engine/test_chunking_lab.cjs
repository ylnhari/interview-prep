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

function coversAll(chunks) {
  const seen = new Array(W).fill(false);
  chunks.forEach(c => { for (let i = c.range[0]; i < c.range[1]; i++) seen[i] = true; });
  return seen.every(Boolean);
}

for (const s of ['fixed', 'recursive', 'structural', 'semantic', 'parent', 'contextual', 'late']) {
  for (const size of [6, 12, 20, 40]) {
    const chunks = lab.run(s, size, 4);
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

// structural never splits the meal table
const tableUnits = lab.units.filter(u => u.kind === 'r').map(u => u.id);
for (const size of [6, 10, 20]) {
  const holders = lab.run('structural', size, 0).filter(c => c.units.some(id => tableUnits.includes(id)));
  assert.equal(holders.length, 1, 'table stays in one structural chunk at size ' + size);
}

// evidence verdicts
assert.equal(lab.assess('semantic', lab.run('semantic'), q('business')).level, 'good');
assert.equal(lab.assess('parent', lab.run('parent'), q('exception')).level, 'good');
assert.equal(lab.assess('structural', lab.run('structural', 40, 0), q('mumbai')).level, 'good');
const fixedVerdict = lab.assess('fixed', lab.run('fixed', 6, 0), q('exception'));
assert.notEqual(fixedVerdict.level, 'good', 'small fixed chunks split the exception evidence');
assert(/They/.test(fixedVerdict.text), 'dangling pronoun is reported');
const prop = lab.assess('proposition', lab.run('proposition'), q('business'));
assert.equal(prop.chunks.length, 2, 'two propositions answer the business-class question');
assert.equal(lab.assess('proposition', lab.run('proposition'), q('exception')).level, 'good', 'one rewritten proposition answers the exception question');

console.log('chunking lab tests passed');
