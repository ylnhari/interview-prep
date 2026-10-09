// Executes the exact displayed structured-answer solution and validates new deep links.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.createContext(context);
const files = fs.readdirSync(path.join(root, 'core')).filter(f => f.endsWith('.js')).sort();
files.splice(files.indexOf('library.js'), 1); files.unshift('library.js');
for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, 'core', file), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'packs/course/content.js'), 'utf8'), context);
const core = context.window.PREP_CORE;
const exercise = core['genai-platform'].activities.find(a => a.id === 'gp-structured-output-drill');
const code = exercise.model.match(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/)[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const validate = new Function(code + '; return validateAnswer;')();
const budget = {attempt: 0, remainingMs: 1000};
const allowed = new Set(['doc1']);
const completed = text => ({status:'complete', text});
const valid = JSON.stringify({answer:'Evidence-backed answer', citations:['doc1']});
const check = (input, supports = () => true, b = budget) => validate(input, allowed, supports, b);
assert.equal(check(completed(valid)).status, 'accepted');
for (const text of ['{', '{}', 'null', '[]', JSON.stringify({answer:'',citations:['doc1']}), JSON.stringify({answer:3,citations:['doc1']}), JSON.stringify({answer:'ok', citations:'doc1'}), JSON.stringify({answer:'ok',citations:[1]}), JSON.stringify({answer:'ok',citations:[]}), JSON.stringify({answer:'ok',citations:['doc1'],extra:true})]) assert.equal(check(completed(text)).status,'repair');
assert.equal(check(completed(JSON.stringify({answer:'ok', citations:['other-tenant']}))).reason,'unauthorized-citation');
assert.equal(check(completed(valid), () => false).status,'abstain');
assert.equal(check({status:'refusal'}).status,'refusal');
for (const status of ['timeout','truncated']) {
  assert.equal(check({status}).status,'repair');
  assert.equal(check({status}, undefined, {attempt:2,remainingMs:1000}).status,'stop');
  assert.equal(check({status}, undefined, {attempt:0,remainingMs:0}).status,'stop');
}
const topics = {...core};
for (const t of context.window.PREP_CONTENT.topics) topics[t.id] = t;
let links = 0;
for (const file of ['core/zz-interview-practice.js','packs/course/content.js']) {
  const text = fs.readFileSync(path.join(root,file),'utf8');
  for (const match of text.matchAll(/href=["']#([\w-]+)(?:\/([\w-]+))?["']/g)) {
    const t = topics[match[1]]; assert(t, 'missing topic: '+match[1]);
    if (match[2]) assert([...t.learn,...t.activities].some(s => s.id === match[2]), 'missing section: '+match[0]);
    links++;
  }
}
console.log('focused practice: reference solution failure/success tests and '+links+' deep links OK');
