// Validate a built page (dist/*.html) or a content file (packs/**/content.js).
// Usage: node engine/check.js <file>
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.log('usage: node engine/check.js <built.html | content.js>'); process.exit(2); }
const s = fs.readFileSync(file, 'utf8');
const isHtml = /<script>/.test(s);
const scripts = isHtml ? [...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]) : [s];
console.log(isHtml ? 'built page' : 'content file', '| scripts', scripts.length, '| bytes', s.length);
if (/\$\{/.test(scripts.slice(0, isHtml ? -1 : 1).join('\n'))) { console.log('FAIL: template interpolation ${ found in content'); process.exit(1); }

const w = {};
if (isHtml) {
  scripts.slice(0, -1).forEach(sc => { new Function('window', sc)(w); });
  new Function(scripts[scripts.length - 1]); // app script must parse
  console.log('app script syntax OK');
} else {
  new Function('window', scripts[0])(w);
  const coreFile = path.join(path.dirname(file), '..', '..', '..', 'core', 'library.js');
  if (fs.existsSync(coreFile)) new Function('window', fs.readFileSync(coreFile, 'utf8'))(w);
  const ovFile = path.join(path.dirname(file), 'overlays.js');
  if (fs.existsSync(ovFile)) new Function('window', fs.readFileSync(ovFile, 'utf8'))(w);
}
const C = w.PREP_CONTENT;
if (!C || !Array.isArray(C.topics)) { console.log('FAIL: no PREP_CONTENT.topics'); process.exit(1); }
if (C.useCore && w.PREP_CORE) C.useCore.forEach(id => { if (w.PREP_CORE[id] && !C.topics.some(t => t.id === id)) C.topics.push(w.PREP_CORE[id]); });

const src = scripts.join('\n');
let badMcq = 0, noRoom = 0, vizIds = new Set(), missingViz = [];
if (w.VIZLIB) Object.keys(w.VIZLIB).forEach(k => vizIds.add(k));
C.topics.forEach(t => t.learn.forEach(c => {
  if (c.check && (c.check.answer < 0 || c.check.answer >= c.check.options.length)) badMcq++;
  if (!/In the room:/.test(c.body || '')) noRoom++;
  if (c.viz && vizIds.size && !vizIds.has(c.viz)) missingViz.push(t.id + '/' + c.id + ':' + c.viz);
}));
const rubrics = (src.match(/rubric: `/g) || []).length + (src.match(/"rubric": "/g) || []).length;
const honesty = (src.match(/Honesty rule/g) || []).length;
console.log('topics', C.topics.length, '| groups', (C.groups || []).map(g => g.id + ':' + g.ids.length).join(' '));
console.log('bad MCQ answers', badMcq, '| chunks without In-the-room', noRoom, '| rubrics', rubrics, '| honesty mentions', honesty, '| viz ids known', vizIds.size, '| unknown viz refs', missingViz.length);
if (missingViz.length) console.log('  ', missingViz.slice(0, 10).join(', '));
let fail = badMcq > 0;
if (C.groups) {
  const ids = new Set(C.topics.map(t => t.id));
  const missing = C.groups.flatMap(g => g.ids).filter(i => !ids.has(i));
  if (missing.length) { console.log('FAIL: groups reference missing topics', missing); fail = true; }
}
if (fail) process.exit(1);
console.log('OK');
