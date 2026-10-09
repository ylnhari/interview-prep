const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const shell = fs.readFileSync('engine/shell.html', 'utf8');
function source(name) {
  const start = shell.indexOf('function ' + name + '(');
  assert(start >= 0); let depth = 0;
  for (let i = shell.indexOf('{', start); i < shell.length; i++) {
    if (shell[i] === '{') depth++;
    if (shell[i] === '}' && --depth === 0) return shell.slice(start, i + 1);
  }
  throw Error(name);
}
const hash = new Function('return (' + source('idHash') + ')')();
const order = new Function('idHash', 'return (' + source('quizDisplayOrder') + ')')(hash);
const legacy = new Function('idHash', 'return (' + source('legacyQuizIndex') + ')')(hash);
const positions = [0,0,0,0];
for (let i=0; i<400; i++) {
  const display = order('topic-'+i, 'section-'+i, 4);
  assert.deepEqual([...display].sort(), [0,1,2,3]);
  assert.deepEqual(display, order('topic-'+i, 'section-'+i, 4));
  positions[display.indexOf(1)]++;
  const rotation = hash('topic-'+i+'/section-'+i)%4;
  for (let canonical=0;canonical<4;canonical++) {
    const stored = legacy('topic-'+i,'section-'+i,canonical,4);
    assert.equal((stored+rotation)%4,canonical,'old rotated progress retains meaning');
  }
}
assert(positions.every(n => n > 50 && n < 150), 'answer display positions are distributed: '+positions);
const topics = [{id:'one',title:'Serving systems',learn:[{id:'lat',title:'Latency',body:'<p>Queue preemption and cache pressure: diagnose slow requests</p>',deeper:'Deadline evidence'}]}, {id:'two',title:'Data',learn:[{id:'leak',title:'Leakage',body:'Availability cutoff'}]}];
const search = new Function('orderedTopics','stripHtml','return ('+source('searchLessons')+')')(()=>topics, s=>s.replace(/<[^>]*>/g,''));
assert.equal(search('queue cache')[0].section.id,'lat');
assert.equal(search('DEADLINE')[0].section.id,'lat');
assert.equal(search('no such mechanism').length,0);
assert.equal(search('availability')[0].topic.id,'two');
assert.equal(search('How can I debug slow requests?')[0].section.id,'lat');
assert.equal(search('historical')[0].topic.id,'two');
assert(!shell.includes('c.check = {'), 'renderer never mutates canonical quiz options/answer');
assert(shell.includes("c.id + '@' + c.check.revision"), 'revised quizzes preserve historical selections separately');
assert(shell.includes("history.pushState(null, '', '#' + h)"), 'chapter clicks enter browser navigation history');
assert(shell.includes("vid === 'home' && publicCourse"), 'home is a valid route');
const scripts = [...shell.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for (const script of scripts) new vm.Script(script[1]);
console.log('test_visual_course: OK; shuffled positions '+positions.join(',')+'; legacy mapping, semantic search, routes, script syntax');
// Run the actual simulation controller against an inspectable, minimal DOM fixture.
// This verifies mount/event/output behavior, not pixel geometry or browser accessibility.
const inputs = {input:{value:'85',addEventListener(type,fn){this[type]=fn;}}, output:{}, '.sim-bars':{}, '.sim-output':{}};
let mounted;
const simWindow = {};
vm.runInNewContext(fs.readFileSync('engine/viz/interactive-practice.js','utf8'), {
 window:simWindow,
 document:{createElement(){return {setAttribute(){},querySelector(s){return inputs[s];},querySelectorAll(){return [];}};}}
});
simWindow.PREP_PRACTICE.mount({querySelector(){return null;},firstElementChild:{insertAdjacentElement(where,node){assert.equal(where,'afterend');mounted=node;}}},'evaluation-and-selection');
assert(mounted && mounted.innerHTML.includes('Predict precision first'), 'simulation is mounted into real chapter hook contract');
assert.match(inputs['.sim-output'].textContent,/Precision 1\.000/);
inputs.input.value='75';inputs.input.input();assert.match(inputs['.sim-output'].textContent,/Precision 0\.500/);
inputs.input.value='65';inputs.input.input();assert.match(inputs['.sim-output'].textContent,/Precision 0\.667/);
assert(shell.includes('window.PREP_PRACTICE.mount(ch, topic.id)'), 'shared renderer calls simulation controller');
const sim=simWindow.PREP_PRACTICE;
assert.equal(Math.round(sim.budget(1000000,.9995,500).allowed),500);
assert(Math.abs(sim.budget(1000000,.9995,500).burn-1)<1e-9);
assert.equal(sim.pointInTime([{id:'x',event:8,available:9,revision:1,value:12},{id:'x',event:8,available:13,revision:2,value:20}],10).x.value,12);
const jobs={queue:[{tenant:'A',id:1},{tenant:'A',id:2},{tenant:'B',id:3}],done:{A:0,B:0},last:'A'};
assert.equal(sim.tick(jobs,'fair').tenant,'B','tenant alternation avoids next A job when B waits');
console.log('test_visual_course: actual simulation mount, threshold events, SLO arithmetic, availability-time and tenant policy OK');
const routeCache={};
const routeStore={getItem:k=>routeCache[k]||null,setItem(k,v){routeCache[k]=v;}};
const byId=id=>topics.find(t=>t.id===id);
const remember=new Function('topicById','META','localStorage','return ('+source('rememberRoute')+')')(byId,{id:'course'},routeStore);
const resume=new Function('topicById','META','localStorage','return ('+source('resumeRoute')+')')(byId,{id:'course'},routeStore);
remember('one/lat');assert.equal(routeCache['prep-course-last-route'],'one/lat');assert.equal(resume().section.id,'lat');
remember('home');assert.equal(routeCache['prep-course-last-route'],'one/lat','home preserves last learning destination');
remember('one/not-a-lesson');assert.equal(routeCache['prep-course-last-route'],'one','unknown sections are not stored');
remember('two/leak');assert.equal(resume().topic.id,'two');
routeCache['prep-course-last-route']='missing/topic';assert.equal(resume(),null,'stale chapter routes fall back safely');
console.log('test_visual_course: Resume raw-string contract and validated chapter/section persistence OK');
let navigationRenders=0,navigationScrolls=0;
const routeContext={state:{view:'one',pendingScroll:'sec-lat'},publicCourse:true,publicMode:false,publicNavigationRevision:0,location:{hash:''},applyHash(){return false;},renderAll(){navigationRenders++;},document:{getElementById(){return null;}},window:{scrollTo(){navigationScrolls++;}}};
const routeEvent=new Function('context','with(context){return ('+source('handleRouteChange')+');}')(routeContext);
routeEvent();assert.equal(routeContext.state.view,'home','Back to initial empty fragment restores public course home');assert.equal(routeContext.state.pendingScroll,null);assert.equal(navigationRenders,1);assert.equal(navigationScrolls,1);
routeContext.location.hash='#unknown';routeContext.state.view='one';routeEvent();assert.equal(routeContext.state.view,'one','unknown fragment leaves current chapter intact');
routeContext.location.hash='';routeContext.publicCourse=false;routeEvent();assert.equal(routeContext.state.view,'one','private initial route is not replaced with public home');
console.log('test_visual_course: browser history empty-fragment event and invalid/private route behavior OK');

assert(shell.includes("teaching.open = !publicCourse && i === 0"),'public glossary starts collapsed; private disclosure contract retained');
assert(shell.includes('selected.focus({preventScroll:true})'),'role selection restores focus after rendering');
console.log('Public glossary default and role focus source contract passed; rendered checks recorded separately.');

const chooseResource = new Function('return ('+source('selectedResource')+')')();
const inheritedVideo={u:'https://www.youtube.com/watch?v=original',l:'Inherited overview'};
const curated={u:'https://example.org/targeted',l:'Selected task teaching',featured:true};
assert.equal(chooseResource([inheritedVideo,curated]),curated,'explicit curated teaching wins even when a direct video precedes it');
assert.equal(chooseResource([{u:'https://example.org/ref'},inheritedVideo]),inheritedVideo,'video fallback remains useful without a curated choice');
assert.equal(chooseResource([curated]),curated);
assert.equal(chooseResource([]),undefined,'no fake media when resources are absent');
