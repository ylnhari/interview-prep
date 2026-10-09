"use strict";
/* Prepare a reviewable exact-hash migration, never run during a Pages build. */
const fs = require('fs');
const vm = require('vm');
const { snapshotAt } = require('./check_progress_compatibility.cjs');
const { canonicalItemSha256 } = require('./progress-compatibility.cjs');
const baselineSha = process.argv[2];
const revision = process.argv[3] || 'audit-2026-10';
if (!/^[a-f0-9]{40}$/.test(baselineSha || '')) throw Error('Supply the full reviewed public baseline SHA');
if (!/^[A-Za-z0-9_-]{1,150}$/.test(revision)) throw Error('Revision must be a storage-safe identifier');
const baseline = snapshotAt(baselineSha);
const ctx = vm.createContext({window:{}});
fs.readdirSync('core').filter(f => f.endsWith('.js') && f !== 'zzzz-quiz-revisions.js')
  .sort((a,b) => a==='library.js'?-1:b==='library.js'?1:a.localeCompare(b))
  .forEach(f => new vm.Script(fs.readFileSync('core/'+f,'utf8'), {filename:f}).runInContext(ctx));
new vm.Script(fs.readFileSync('packs/course/content.js','utf8')).runInContext(ctx);
const content = ctx.window.PREP_CONTENT;
const topics = [...content.topics, ...content.useCore.map(id => ctx.window.PREP_CORE[id])];
const oldTopics = new Map(baseline.topics.map(t=>[t.id,t]));
const normalized = check => check && {question:check.question, options:check.options, answer:check.answer};
const existing = fs.existsSync('content-revisions.json') ? JSON.parse(fs.readFileSync('content-revisions.json','utf8')) : {retirements:[]};
const entries = [];
const revisions = [];
const priorEntries = new Map((existing.quizRevisions || []).map(e=>[e.topic+'/'+e.id,e]));
for (const topic of topics) {
  const old = oldTopics.get(topic.id);
  if (!old) continue;
  const sections = new Map((old.learn || []).map(s=>[s.id,s]));
  for (const section of topic.learn || []) {
    const previous = sections.get(section.id);
    if (!previous || !previous.check) continue;
    if (!section.check) throw Error('Retained quiz was removed: '+topic.id+'/'+section.id);
    const before = canonicalItemSha256(normalized(previous.check));
    const after = canonicalItemSha256(normalized(section.check));
    if (before === after) {
      const historical = priorEntries.get(topic.id+'/'+section.id);
      if (historical) {
        if (historical.after !== after) throw Error('Historical quiz hash no longer matches '+topic.id+'/'+section.id);
        entries.push(historical);
        revisions.push([topic.id,section.id,historical.revision]);
      }
      continue;
    }
    if (previous.check.revision === revision) throw Error('A subsequent correction requires a new revision: '+topic.id+'/'+section.id);
    entries.push({pack:'course',topic:topic.id,id:section.id,before,after,revision,
      reason:'Source-backed course audit correction; see docs/course-redesign-audit.md and domain resolution ledgers. Old answers remain historical evidence under the original key; revised practice uses a new versioned check key.'});
    revisions.push([topic.id,section.id,revision]);
  }
}
fs.writeFileSync('content-revisions.json', JSON.stringify({version:2,retirements:existing.retirements || [],quizRevisions:entries},null,2)+'\n');
fs.writeFileSync('core/zzzz-quiz-revisions.js', '/* Reviewed quiz versions preserve original stored choices. Generated only after audit review. */\n(function(root){\n  '+JSON.stringify(revisions)+'.forEach(function(r){var t=root.PREP_CORE[r[0]];var s=t.learn.find(function(x){return x.id===r[1];});if(s&&s.check)s.check.revision=r[2];});\n}(typeof window!=="undefined"?window:this));\n');
console.log('Prepared '+entries.length+' exact quiz revisions for review; no stored progress is modified.');
entries.forEach(e => console.log(e.topic+'/'+e.id));
