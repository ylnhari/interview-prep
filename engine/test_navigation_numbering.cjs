const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const shell = fs.readFileSync('engine/shell.html', 'utf8'), window = {};
for (const f of ['library.js', ...fs.readdirSync('core').filter(f => f.endsWith('.js') && f !== 'library.js').sort()]) vm.runInNewContext(fs.readFileSync('core/' + f, 'utf8'), {window});
vm.runInNewContext(fs.readFileSync('packs/course/content.js', 'utf8'), {window});
const C = window.PREP_CONTENT, TOPICS = C.topics.concat(C.useCore.map(id => window.PREP_CORE[id])), GROUPS = C.groups;
class Node {
  constructor(tag, cls, text = '') { this.tag = tag; this.cls = cls || ''; this.text = text; this.children = []; this.dataset = {}; this.attrs = {}; this.style = {setProperty(){}}; }
  appendChild(n) { this.children.push(n); return n; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(k, fn) { this[k] = fn; }
  set innerHTML(v) { this.children = []; }
}
const rail = new Node('nav'), context = {C, TOPICS, GROUPS, roleId: '', publicCourse: true, GLOSSARY: [], PART_SHORT: {}, TICK: '\u2713', DOT: '\u00b7', state: {},
  document: {getElementById(id){ return id === 'rail' ? rail : new Node('div'); }},
  el: (tag, cls, text) => new Node(tag, cls, text), txt: (tag, cls, text) => new Node(tag, cls, text),
  nextUnfinished: () => null, overall: () => 0, topicProgress: () => ({rL: 1, nL: 3, pct: 10, label: 'started'}),
  T: () => ({learn: Object.fromEntries(TOPICS.flatMap(t => t.learn.map(s => [s.id, true])))}), go: (...args) => {context.route = args;}, stripHtml: s => s.replace(/<[^>]*>/g, '')};
for (const name of ['groupOf', 'orderedTopics', 'topicById', 'chapterNumber', 'lessonNumber', 'pathStepLabel', 'searchLessonLabel', 'selectedPath', 'recommendedTopics', 'searchLessons', 'renderRail']) {
  const start = shell.indexOf('  function ' + name + '('); let depth = 0, end;
  for (let i = shell.indexOf('{', start); i < shell.length; i++) {
    if (shell[i] === '{') depth++;
    else if (shell[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const src = shell.slice(start, end).trim();
  context[name] = new Function('context', 'with(context) { return (' + src + '); }')(context);
}
function all(node) { return [node, ...node.children.flatMap(all)]; }
const ordered = context.orderedTopics();
for (const [i, t] of ordered.entries()) {
  context.state.view = t.id; context.renderRail();
  const nodes = all(rail), button = nodes.find(n => n.dataset.id === t.id);
  assert.equal(button.children[0].children[0].text, `${i + 1}. ${t.title}`);
  assert.equal(button.attrs['aria-current'], 'page'); button.click(); assert.deepEqual(context.route, [t.id]);
  for (const [j, s] of t.learn.entries()) {
    const link = nodes.find(n => n.href === '#sec-' + s.id);
    assert.equal(link.children[0].text, `${i + 1}.${j + 1}`);
    assert.equal(link.attrs['aria-label'], `${i + 1}.${j + 1} ${s.title}, completed`);
  }
}
for (const path of C.paths) {
  context.roleId = path.id;
  for (const t of context.recommendedTopics()) assert.equal(context.chapterNumber(t.id), ordered.indexOf(t) + 1);
  path.ids.forEach((id, i) => {
    const t = context.topicById(id);
    assert.equal(context.pathStepLabel(t, i), `Step ${i + 1} ${context.DOT} Chapter ${ordered.indexOf(t) + 1}: ${t.title}`);
  });
}
context.T = () => ({learn: {}});
context.state.view = ordered[0].id; context.renderRail();
for (const [j, s] of ordered[0].learn.entries()) {
  const link = all(rail).find(n => n.href === '#sec-' + s.id);
  assert.equal(link.children[0].text, `1.${j + 1}`);
  assert.equal(link.children[1].text, s.title);
  assert.equal(link.attrs['aria-label'], undefined);
}
for (const query of ['cache', 'latency', 'historical', 'binary search', 'union-find', 'backtracking', 'trie']) for (const {topic, section} of context.searchLessons(query)) {
  assert.equal(context.lessonNumber(topic, section), `${ordered.indexOf(topic) + 1}.${topic.learn.indexOf(section) + 1}`);
  assert.equal(context.searchLessonLabel(topic, section), `${context.lessonNumber(topic, section)} ${topic.title} / ${section.title}`);
}
assert.match(shell, /pathStepLabel\(t, i\)/);
assert.match(shell, /searchLessonLabel\(match.topic, match.section\)/);
assert.match(shell, /grid-template-columns: max-content minmax\(0, 1fr\)/);
console.log('Catalogue chapter/lesson labels, completion, retained anchors, click targets, role paths and filtered search passed (' + ordered.length + ' chapters).');
