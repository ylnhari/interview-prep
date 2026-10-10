// Exercises the actual controller through select/change/click handlers.
// This DOM contract fixture deliberately makes no claim about pixel layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Field {
  constructor(value='') { this.value=value; this.hidden=false; this.textContent=''; this.handlers={}; }
  addEventListener(type,fn) { this.handlers[type]=fn; }
  dispatch(type) { this.handlers[type](); }
  focus() { this.focused=true; }
}
class Panel {
  constructor() { this.fields={}; }
  setAttribute(k,v) { this[k]=v; }
  set innerHTML(html) {
    this.html=html;
    for (const m of html.matchAll(/<select id="([^"]+)">([\s\S]*?)<\/select>/g)) this.fields['#'+m[1]]=new Field(m[2].match(/value="([^"]*)"/)[1]);
    for (const m of html.matchAll(/data-action="([^"]+)"/g)) this.fields['[data-action="'+m[1]+'"]']=new Field();
    this.fields['[data-fixture-output]']=new Field();
    this.fields['[data-fixture-summary]']=new Field();
    this.fields['[data-feedback]']=new Field();
  }
  get innerHTML() { return this.html; }
  querySelector(s) { return this.fields[s]||null; }
}
const window={VIZLIB:{},VIZLIB_CAPTIONS:{}};
vm.runInNewContext(fs.readFileSync('engine/viz/zzz-ai-learning.js','utf8'),{window,document:{createElement(){return new Panel();}}});
const api=window.PREP_AI_PRACTICE;
function mount(id,type,board=true) {
  let panel; const content=new Field(), visual={};
  const diagram={querySelector(){return content;}};
  const sec={querySelector(s){return s==='.ai-experiment'?panel||null:s==='.cviz'?visual:s.startsWith('[data-ai-board=')&&board?diagram:null;},insertBefore(p,before){assert.equal(before,visual);panel=p;}};
  api.mountLesson(sec,id); const first=panel; api.mountLesson(sec,id);assert.equal(panel,first,'mount is idempotent');
  return {panel,content:board?content:panel.querySelector('[data-fixture-output]'),fixture:panel.querySelector('#experiment-'+id+'-fixture'),decision:panel.querySelector('#experiment-'+id+'-decision'),feedback:panel.querySelector('[data-feedback]'),button:panel.querySelector('[data-action="'+(type==='agent'?'resume':'check')+'"]')};
}
const p=mount('gp-f2','platform');
assert(!p.content.innerHTML.includes('Chosen route:'),'route is hidden before a prediction');
p.button.dispatch('click');assert.match(p.feedback.textContent,/Choose/);assert(p.decision.focused);
p.fixture.value='confidential';p.fixture.dispatch('change');assert(p.feedback.hidden);assert.equal(p.decision.value,'');assert(!p.content.innerHTML.includes('Chosen route: model B'));
p.decision.value='B';p.button.dispatch('click');assert.match(p.feedback.textContent,/Correct/);assert.match(p.content.innerHTML,/Chosen route: model B/);
p.fixture.value='unavailable';p.fixture.dispatch('change');assert.equal(p.feedback.textContent,'');assert(!p.content.innerHTML.includes('Eligible set: empty'));p.decision.value='stop';p.button.dispatch('click');assert.match(p.content.innerHTML,/Eligible set: empty/);assert.match(p.content.innerHTML,/No model or tool is called/);
assert.match(p.panel.querySelector('[data-fixture-summary]').textContent,/Permitted route: none/);
assert.equal(api.platform('unknown').route,null);
const r=mount('raa-f1a','rag',false);
for(const fixture of ['superseded','revoked','missing','empty']) {
  r.fixture.value=fixture;r.fixture.dispatch('change');assert(!r.content.innerHTML.includes('Abstain:'));assert(r.feedback.hidden);
  r.decision.value='abstain';r.button.dispatch('click');assert.match(r.content.innerHTML,/Abstain/);assert.match(r.feedback.textContent,/Correct/);assert.equal(api.rag(fixture).complete,false);
}
assert(!api.rag('revoked').context.some(id=>id.startsWith('P2')),'forbidden evidence never enters context');
assert.equal(api.rag('empty').context.length,0);
const e=mount('raa-f5','evidence',false);assert(!e.content.innerHTML.includes('1/3 = 0.333'));e.decision.value='partial';e.button.dispatch('click');assert.match(e.content.innerHTML,/1\/3 = 0.333/);assert.match(e.content.innerHTML,/Complete evidence: false/);
e.fixture.value='all';e.fixture.dispatch('change');assert(!e.content.innerHTML.includes('3/3 = 1.000'));e.decision.value='complete';e.button.dispatch('click');assert.match(e.content.innerHTML,/3\/3 = 1.000/);assert.match(e.content.innerHTML,/Complete evidence: true/);
const a=mount('raa-agent-execution','agent');
for(const fixture of ['applied','revoked','changed','unsupported','success']) {
  a.fixture.value=fixture;a.fixture.dispatch('change');assert(a.feedback.hidden);
  a.button.dispatch('click');const once=a.content.innerHTML;
  a.button.dispatch('click');assert.equal(a.content.innerHTML,once,'repeated resume preserves effect and outcome');
  const state=api.resumeAgent(api.agentInitial(fixture));
  assert.equal(state.effects,fixture==='unsupported'?null:fixture==='changed'?0:1);
  if(fixture==='revoked')assert.match(a.feedback.textContent,/revoked/);
  if(fixture==='changed')assert.match(a.feedback.textContent,/differ/);
  if(fixture==='unsupported')assert.match(a.feedback.textContent,/escalate/);
  a.panel.querySelector('[data-action="reset"]').dispatch('click');assert(a.feedback.hidden);assert.equal(a.feedback.textContent,'');assert.notEqual(a.content.innerHTML,once);
}
assert.match(api.resumeAgent(api.agentInitial('unknown')).outcome,/unknown/);
const i=mount('lie-f1','inference');
i.fixture.value='C';i.fixture.dispatch('change');assert.match(i.content.innerHTML,/900 ms/);assert.match(i.content.innerHTML,/preemptions: 3/);
i.decision.value='cache';i.button.dispatch('click');assert.match(i.feedback.textContent,/hypothesis, not proved causation/);
assert.match(i.panel.querySelector('[data-fixture-summary]').textContent,/measurement feedback revealed/);
i.fixture.value='B';i.fixture.dispatch('change');assert.equal(i.decision.value,'');assert(i.feedback.hidden);assert.match(i.content.innerHTML,/Prefill: 600 ms/);assert.match(i.content.innerHTML,/not asserted to equal queue/);
assert.deepEqual(JSON.parse(JSON.stringify(api.traces.A)),{queue:800,prefill:80,median:20,stall:null,preemptions:0});
const shell=fs.readFileSync('engine/shell.html','utf8');
function source(name){const start=shell.indexOf('function '+name+'(');let depth=0;for(let i=shell.indexOf('{',start);i<shell.length;i++){if(shell[i]==='{')depth++;if(shell[i]==='}'&&--depth===0)return shell.slice(start,i+1);}throw Error(name);}
const split=new Function('stripHtml','return ('+source('splitLessonBody')+')')(s=>s.replace(/<[^>]*>/g,''));
const intro='<p>A concrete failure needs a mechanism and a measurement.</p>', long='<p>'+Array(135).fill('evidence').join(' ')+'</p>';
assert.deepEqual(split(intro,false),{visible:intro,remaining:''});
assert.deepEqual(split(intro+long,true),{visible:'',remaining:intro+long});
const shown=split(intro+long+'<ul><li>artifact</li></ul>',false);assert(shown.visible.includes(intro));assert(!shown.remaining.includes(intro));assert(shown.remaining.includes('artifact'));
const prepare=new Function('publicCourse','txt','return ('+source('prepareDiagram')+')')(true,()=>({}));
const svg={style:{},getAttribute(){return '0 0 760 200';},querySelectorAll(){return [{getAttribute(){return '9';}}];}};
const region={setAttribute(){},querySelectorAll(){return [svg];},insertBefore(){}};prepare(region,'Test');assert.equal(svg.style.minWidth,'1183px');assert.equal(region.tabIndex,0);
// Inspect the actual effective course text, rather than another rendering of its ideas.
const course={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window:course});
vm.runInNewContext(fs.readFileSync('packs/course/content.js','utf8'),{window:course});
const publishedTopics=[...course.PREP_CONTENT.topics,...course.PREP_CONTENT.useCore.map(id=>course.PREP_CORE[id])];
const openingMechanisms={
  'sdf-f3':/update an order and its payment record together[\s\S]*multi-record transactions/,
  'nb-f6':/propagation[\s\S]*transmission[\s\S]*queueing and processing[\s\S]*faster link/,
  'ss-v3-request-stages':/end-to-end deadline[\s\S]*queueing[\s\S]*tested fallback/,
  'ss-f4':/ramp time[\s\S]*zone-loss[\s\S]*startup delay/,
  'ss-f5':/100 requests per second[\s\S]*600-request-per-second[\s\S]*six healthy replicas[\s\S]*downstream/,
  'or-2':/variables, objective and constraints[\s\S]*LP[\s\S]*MIP[\s\S]*CP-SAT[\s\S]*solver status/,
  'ct-5':/noisy updates[\s\S]*already committed decisions[\s\S]*switching costs[\s\S]*hard constraints/
};
for(const [id,mechanism] of Object.entries(openingMechanisms)){
  const section=publishedTopics.flatMap(t=>t.learn).find(s=>s.id===id);
  const opening=split(section.body,false), text=section.body.match(/^<p>[\s\S]*?<\/p>/)[0];
  assert.match(opening.visible,mechanism,id+' explains a concrete mechanism before disclosure');
  assert(opening.visible.includes(text));assert(!opening.remaining.includes(text),id+' opening is not duplicated');
  assert(opening.remaining.includes('<li>'),id+' extended explanation is retained');
  assert(opening.visible.replace(/<[^>]*>/g,'').trim().split(/\s+/).length<=90,id+' concise authored context');
}
const sizing=publishedTopics.flatMap(t=>t.learn).find(s=>s.id==='ss-f5').body;
const perReplica=Number(sizing.match(/sustains (\d+) requests per second/)[1]);
const peakRequests=Number(sizing.match(/A (\d+)-request-per-second peak/)[1]);
assert.equal(Math.ceil(peakRequests/perReplica),6,'displayed sizing example needs six replicas before allowances');
for(const topic of publishedTopics.filter(t=>!t.id.includes('question-bank')))for(const [index,section] of topic.learn.entries()){
  if(!index||!section.body||course.PREP_CONTENT.lessonGuides?.[section.id])continue;
  const opening=split(section.body,false);
  assert(!opening.remaining||opening.visible.replace(/<[^>]*>/g,'').trim().split(/\s+/).length>17,section.id+' does not hide its teaching behind a slogan');
}
console.log('test_ai_learning: controller events, eligibility/evidence boundaries, unknown effects, reset/repeated resume, measured intervals and visible teaching passed');
