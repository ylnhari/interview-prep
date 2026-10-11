const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const w={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window:w});vm.runInNewContext(fs.readFileSync('packs/course/content.js','utf8'),{window:w});
const c=w.PREP_CONTENT,topics=[...c.topics,...c.useCore.map(id=>w.PREP_CORE[id])],by=new Map(topics.map(t=>[t.id,t]));
assert.equal(new Set(topics.map(t=>t.id)).size,topics.length);assert.equal(c.paths.length,4);assert.equal(c.groups.filter(g=>g.id!=='start').length,6);
for(const t of topics){assert(!/interview|round|asked|comes up|preparation/i.test(t.levelLabel||""),t.id+" neutral orientation");assert(c.chapterGuides[t.id]?.outcome);assert(c.chapterGuides[t.id]?.artifact);assert(c.groups.some(g=>g.ids.includes(t.id)));for(const p of c.chapterGuides[t.id].prerequisites)assert(by.has(p));}
for(const p of c.paths){assert(p.capstone);assert.equal(new Set(p.ids).size,p.ids.length);for(const id of p.ids)assert(by.has(id));}
const missing=[];
function scan(value,where){if(typeof value==='string'){for(const match of value.matchAll(/href=["']#([a-z0-9-]+)(?:\/([a-z0-9-]+))?["']/g)){const [,tid,sid]=match;if(['home','glossary'].includes(tid))continue;const t=by.get(tid);if(!t||sid&&!t.learn.concat(t.activities).some(s=>s.id===sid))missing.push(where+' → '+tid+(sid?'/'+sid:''));}}else if(value&&typeof value==='object'){for(const [k,v]of Object.entries(value))scan(v,where+'/'+k);}}
for(const t of topics)scan(t,t.id);
function validAnchors(value,where){if(typeof value==='string'){assert.equal((value.match(/<a\s[^>]*>/g)||[]).length,(value.match(/<\/a>/g)||[]).length,where+' balanced links');}else if(value&&typeof value==='object'){for(const [key,v]of Object.entries(value))validAnchors(v,where+'/'+key);}}
for(const t of topics)validAnchors(t,t.id);
for(const [id,g]of Object.entries(c.lessonGuides||{})){assert(topics.some(t=>t.learn.some(s=>s.id===id)),id+' guide has a retained destination');for(const field of ['scenario','mechanism','diagram','prediction'])assert(typeof g[field]==='string'&&g[field].length>25,id+' meaningful '+field);}
if(missing.length){console.error('INVALID SEMANTIC DESTINATIONS\n'+missing.join('\n'));process.exitCode=1;}
console.log(JSON.stringify({topics:topics.length,lessons:topics.reduce((n,t)=>n+t.learn.length,0),checks:topics.reduce((n,t)=>n+t.learn.filter(s=>s.check).length,0),activities:topics.reduce((n,t)=>n+t.activities.length,0),codeActivities:topics.reduce((n,t)=>n+t.activities.filter(a=>a.type==='code').length,0),visualReferences:topics.reduce((n,t)=>n+t.learn.concat(t.activities).filter(s=>s.viz).length,0),readings:topics.reduce((n,t)=>n+(c.readings[t.id]||t.readings||[]).length,0),badLinks:missing.length}));

// Direct within-path prerequisites precede their dependents. Entry diagnostics may be revisited later.
for(const p of c.paths){
 assert(p.background);assert(Array.isArray(p.entryReviewIds));
 for(const [i,id] of p.ids.entries())for(const pr of c.chapterGuides[id].prerequisites){
  if(p.ids.includes(pr))assert(p.ids.indexOf(pr)<i||p.entryReviewIds.includes(pr),p.id+': '+pr+' before '+id);
  else assert(p.entryReviewIds.includes(pr),p.id+': omitted background is explicit: '+pr);
 }
}
assert(c.paths.find(p=>p.id==='fde').ids.includes('search-and-retrieval'));
for(const id of ['classical-models','deep-learning-essentials','training-at-scale','system-design-cases','recommendation-systems','experimentation-and-causal-measurement']){
 const rs=c.readings[id];assert(rs.some(r=>r.featured),id+' curated choice');
 for(const original of w.PREP_CORE[id].readings)assert(rs.some(r=>r.u===original.u),id+' preserves useful reference '+original.u);
 assert.equal(new Set(rs.map(r=>r.u)).size,rs.length,id+' no duplicated URL');
 for(const r of rs)assert(r.provider&&r.format&&r.purpose&&r.access&&r.budgetLabel,id+' honest metadata');
}
console.log('Role prerequisite order/background and inherited external references passed.');
assert.equal(c.chapterGuides['ml-math-essentials'].prerequisites.length,0,'coding is optional numerical practice, not a mathematical prerequisite');
assert.match(c.chapterGuides['ml-math-essentials'].background,/optional background/);
for(const [id,url] of [['rag-and-agents','https://research.google/pubs/sufficient-context-a-new-lens-on-retrieval-augmented-generation-systems/'],['distributed-coordination','http://thesecretlivesofdata.com/raft/']]){
 const rs=c.readings[id]||w.PREP_CORE[id].readings;
 assert.equal(rs.filter(r=>r.featured).length,1);
 assert.equal(rs.find(r=>r.featured).u,url);
 assert(rs.find(r=>r.featured).provider&&rs.find(r=>r.featured).format);
}
assert((c.readings['rag-and-agents']||w.PREP_CORE['rag-and-agents'].readings).some(r=>r.optional&&/ByteMonk/.test(r.l)),'sponsored overview remains an optional reference');

const metadataOnly={};vm.runInNewContext(fs.readFileSync('packs/course/content.js','utf8'),{window:metadataOnly});assert.equal(metadataOnly.PREP_CONTENT.paths.length,4,'roadmap metadata extraction works without core loaded');

for(const t of topics)assert(!/interviewers?|most people|universally asked|senior answer|2025.2026/.test(t.why||""),t.id+" introduces the engineering outcome without an unsupported interview or audience prediction");

// Coding scope is a learning progression, rather than a six-pattern-only list.
const coding=by.get('coding-drills');
for(const id of ['cdr-binary-search','cdr-intervals-greedy','cdr-stacks','cdr-linked-lists','cdr-trees','cdr-graphs-ordering','cdr-union-find','cdr-shortest-paths','cdr-backtracking','cdr-dynamic-programming','cdr-tries','cdr-bits','cdr-arrays-hashing','cdr-two-pointers','cdr-heaps']) {
 const lesson=coding.learn.find(s=>s.id===id);assert(lesson,id+' is discoverable by stable section ID');
 assert(lesson.body.indexOf('<b>Learn.</b>')<lesson.body.indexOf('<b>Solve.</b>'),id+' teaches before assigning practice');
 const urls=[...lesson.body.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(urls.filter(u=>u.startsWith('https://leetcode.com/problems/')).length,2,id+' starter and follow-up are direct problems');
 assert(urls.some(u=>/^https:\/\/(runestone\.academy|usaco\.guide|cp-algorithms\.com|docs\.python\.org)\//.test(u)),id+' has a topic-specific teaching source');
 assert(lesson.deeper&&lesson.check&&lesson.check.explain,id+' has a reference approach and explained quick check');
 assert.match(lesson.body,/<b>Test and explain\.<\/b>/);
}
assert.equal(coding.learn.find(s=>s.id==='cdr-f1').title,'Six starter patterns, with pseudocode models');
assert(c.readings['coding-drills'].some(r=>r.provider==='MIT OpenCourseWare'));
assert(c.readings['coding-drills'].some(r=>r.provider==='Runestone Academy'));
console.log('Expanded coding learning sources, practice progression and stable destinations passed.');

// Execute the actual body splitter against every new lesson, including the
// two longer bodies that previously hid their Learn/Solve links.
const rendererText=fs.readFileSync('engine/shell.html','utf8');
function rendererFunction(name) {
 const start=rendererText.indexOf('function '+name+'(');let depth=0;
 for(let i=rendererText.indexOf('{',start);i<rendererText.length;i++){
  if(rendererText[i]==='{')depth++;
  if(rendererText[i]==='}'&&--depth===0)return rendererText.slice(start,i+1);
 }
 throw Error('Missing renderer function '+name);
}
const splitBody=new Function('stripHtml','return ('+rendererFunction('splitLessonBody')+')')(s=>s.replace(/<[^>]+>/g,''));
const directCoding=coding.learn.filter(s=>s.presentation==='learn-solve');assert.equal(directCoding.length,15);
for(const s of directCoding){
 const display=splitBody(s.body,false,true);assert.equal(display.remaining,'',s.id+' has no hidden primary teaching');
 for(const match of s.body.matchAll(/href="([^"]+)"/g))assert(display.visible.includes(match[0]),s.id+' keeps each resource visible');
}
const scenarios=by.get('scenario-questions');assert.equal(scenarios.presentation,'scenario-qa');
assert.deepEqual(Array.from(scenarios.learn,s=>s.id),['sq-0','sq-1','sq-2','sq-3','sq-4']);
let cases=0;
for(const [i,s]of scenarios.learn.entries()){
 assert.equal(s.presentation,'scenario-qa');assert.equal(s.viz,null);assert.equal(s.deeper,null);
 assert(s.check,'retained canonical quiz data');assert.equal(splitBody(s.body,i===0,true).remaining,'');
 if(i){const count=(s.body.match(/<h4>/g)||[]).length;cases+=count;
 for(const label of ['Situation.','A worked response.','Why this works.'])assert.equal(s.body.split(label).length-1,count,s.id+' complete Q&A cases');
 assert(!/<b>\d+\.|Artifact:|Predeclare/.test(s.body),s.id+' no numbered instruction leftovers');}
}
assert.equal(cases,14);
assert.equal(scenarios.activities.length,6);
for(const a of scenarios.activities){assert(a.prompt.includes('Situation.'));assert(a.model.includes('A worked response.'));assert(a.model.includes('Why this works.'));assert.equal(a.viz,null);}
assert.match(rendererText,/if \(scenarioQA\) \{ box2\.appendChild\(el\('div', 'prose', a\.model\)\)[^\n]+return; \}/,'scenario responses bypass the generic answer form');
assert.match(rendererText,/c\.presentation !== 'learn-solve' && topic\.presentation !== 'scenario-qa'/,'generic quiz UI is omitted without changing saved mapping');
console.log('All 15 coding lessons keep resources visible; 14 scenario cases and 6 follow-ups show direct Q&A with retained IDs.');

// Render the real chapter function into a small synthetic node tree. This
// checks disclosure ancestry and form presence; it does not simulate layout.
class RenderNode {
 constructor(tag,cls,html=''){this.tag=tag;this.cls=cls||'';this.html=html;this.children=[];this.dataset={};this.style={setProperty(){}};this.attrs={};}
 appendChild(n){this.children.push(n);return n;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(){}
 querySelectorAll(){return [];}
 set innerHTML(v){this.html=v;}
}
const makeNode=(tag,cls,html)=>new RenderNode(tag,cls,html);
const renderContext={C:c, publicCourse:true, TOPICS:topics, GROUPS:c.groups, READINGS:c.readings,VIZ:{},window:{},state:{},progressApi:null,
 T:()=>({learn:{},checks:{},reads:{},said:false}),AC:()=>({status:'none',attempts:0,lastAnswer:''}),
 topicProgress:t=>({rL:0,nL:t.learn.length,nA:t.activities.length,pA:0,pct:0,label:'started'}),
 isQBank:()=>false,isPrereqs:()=>false,groupOf:()=>({label:'Practice'}),topicById:id=>by.get(id),
 el:makeNode,txt:makeNode,document:{createElement:tag=>makeNode(tag),createTextNode:text=>makeNode('text',null,text)},
 DOT:'·',TICK:'✓',selectedResource:()=>null,safeExternalUrl:u=>u,URL,
 splitLessonBody:splitBody,graded:()=>false,legacyQuizIndex:(t,s,i)=>i,quizDisplayOrder:(t,s,n)=>Array.from({length:n},(_,i)=>i),
 selfMarkButton:()=>makeNode('button'),revealBlock:(title,model)=>makeNode('div',null,model),persist(){},persistDraft(){},rerenderChapter(){},rerenderCheck(){},renderGrade:()=>makeNode('div')};
const realRenderChapter=new Function('context','with(context){return ('+rendererFunction('renderChapter')+');}')(renderContext);
function renderedNodes(node,ancestors=[]){return [{node,ancestors},...node.children.flatMap(child=>renderedNodes(child,ancestors.concat(node)))];}
const scenarioTree=renderedNodes(realRenderChapter(scenarios,40));
assert(!scenarioTree.some(({node})=>node.tag==='textarea'),'scenario Q&A has no answer boxes');
assert(!scenarioTree.some(({node})=>node.tag==='details'),'scenario Q&A has no template accordions');
assert(!scenarioTree.some(({node})=>node.cls==='cviz'),'no decorative scenario diagrams');
for(const a of scenarios.activities){const box=scenarioTree.find(({node})=>node.id==='sec-'+a.id);assert(box,a.id+' retained activity anchor');assert(box.node.children.some(n=>n.html===a.model),a.id+' directly visible response');}
const codingTree=renderedNodes(realRenderChapter(coding,39));
for(const lesson of directCoding){
 const body=codingTree.find(({node})=>node.html===lesson.body);assert(body,lesson.id+' complete body rendered');
 assert(!body.ancestors.some(n=>n.tag==='details'),lesson.id+' Learn/Solve outside any disclosure');
 const reference=codingTree.find(({node})=>node.html===lesson.deeper);assert(reference);assert(!reference.ancestors.some(n=>n.tag==='details'),lesson.id+' brief reference directly visible');
}
console.log('Actual synthetic chapter rendering: all coding links directly visible; scenario Q&A has no disclosures, diagrams or answer boxes.');
