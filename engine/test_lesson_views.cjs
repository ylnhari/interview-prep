// Execute the public renderer and route helpers using the complete course.
// Synthetic DOM coverage deliberately makes no claim about rendered pixels.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),window={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window});
vm.runInNewContext(fs.readFileSync('packs/course/content.js','utf8'),{window});
const C=window.PREP_CONTENT,TOPICS=C.topics.concat(C.useCore.map(id=>window.PREP_CORE[id])),shell=fs.readFileSync('engine/shell.html','utf8');
function source(name){const start=shell.indexOf('  function '+name+'(');assert(start>=0,name);let depth=0;for(let i=shell.indexOf('{',start);i<shell.length;i++){if(shell[i]==='{')depth++;if(shell[i]==='}'&&--depth===0)return shell.slice(start,i+1);}throw Error(name);}
class Node{constructor(tag,cls,html=''){this.tag=tag;this.cls=cls||'';this.html=html;this.children=[];this.attrs={};this.dataset={};}appendChild(n){this.children.push(n);return n;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this[k]=v;}querySelectorAll(){return [];}querySelector(){return null;}set innerHTML(v){this.html=v;this.children=[];}}
function all(n){return [n,...n.children.flatMap(all)];}
const records=new Map(),activities=new Map(),book=new Node('main'),location={hash:''};let persists=0;
const ctx={C,TOPICS,GROUPS:C.groups,roleId:'',publicCourse:true,privateHost:false,privateReady:true,GLOSSARY:[],state:{},location,book,READINGS:C.readings,VIZ:{},window:{},progressApi:null,URL,TICK:'✓',
 el:(...a)=>new Node(...a),txt:(...a)=>new Node(...a),safeExternalUrl:u=>u,prepareDiagram(){},extLink:l=>new Node('a',null,l.label),
 T:id=>{if(!records.has(id))records.set(id,{learn:{},reads:{},checks:{}});return records.get(id);},AC:(t,s)=>{const id=t+'/'+s;if(!activities.has(id))activities.set(id,{status:'none'});return activities.get(id);},
 persist(){persists++;},rerenderChapter(){},rememberRoute(){},selfMarkButton:r=>new Node('button',null,r.status),renderHome:()=>new Node('section','home'),renderGlossary:()=>new Node('section','glossary')};
for(const name of ['groupOf','orderedTopics','topicById','chapterNumber','lessonNumber','selectedPath','recommendedTopics','selectedResource','viewOrder','lessonSections','selectedLesson','renderLesson','renderLessonNav','renderBook','applyHash'])ctx[name]=new Function('context','with(context){return ('+source(name)+');}')(ctx);
let count=0;
for(const topic of ctx.orderedTopics()){
 ctx.state.view=topic.id;location.hash='#'+topic.id;ctx.renderBook();assert.equal(book.children[0].id,'sec-'+topic.learn[0].id,'chapter route opens first lesson');
 for(const lesson of ctx.lessonSections(topic)){
  location.hash='#'+topic.id+'/'+lesson.id;assert(ctx.applyHash());ctx.renderBook();
  const nodes=all(book),page=book.children[0];assert.equal(page.id,'sec-'+lesson.id);assert.equal(nodes.filter(n=>n.tag==='article').length,1);assert.equal(nodes.filter(n=>n.tag==='h1').length,1);
  assert(!nodes.some(n=>n.tag==='textarea'||n.tag==='details'),'no generated worksheet/disclosure');
  assert(nodes.some(n=>n.html===(topic.learn.includes(lesson)?lesson.body:lesson.prompt)),lesson.id+' primary content visible');
  if(lesson.model)assert(nodes.some(n=>n.html===lesson.model),lesson.id+' worked answer visible');
  if(topic.learn.includes(lesson)){
   assert(page.children[1].html.startsWith(ctx.lessonNumber(topic,lesson)+' '));
   const button=nodes.find(n=>n.cls.includes('lesson-completion')).children[0];button.click();assert(ctx.T(topic.id).learn[lesson.id]);ctx.renderBook();assert.equal(all(book).find(n=>n.attrs['aria-pressed']).attrs['aria-pressed'],'true');
  }
  count++;
 }
 location.hash='#'+topic.id+'/missing';ctx.applyHash();assert.equal(ctx.state.pendingScroll,null);assert.equal(ctx.selectedLesson(topic),topic.learn[0]);
}
for(const path of C.paths){ctx.roleId=path.id;const sequence=ctx.recommendedTopics().flatMap(topic=>ctx.lessonSections(topic).map(section=>({topic,section})));for(const [i,x]of sequence.entries()){const nav=ctx.renderLessonNav(x.topic,x.section),links=nav.children.filter(n=>n.tag==='a');if(i)assert.equal(links[0].href,'#'+sequence[i-1].topic.id+'/'+sequence[i-1].section.id);if(i<sequence.length-1)assert.equal(links.at(-1).href,'#'+sequence[i+1].topic.id+'/'+sequence[i+1].section.id);assert.equal(ctx.chapterNumber(x.topic.id),ctx.orderedTopics().indexOf(x.topic)+1);}}
// Direct URL transitions and Back/Forward restore the requested lesson identity.
for(const route of ['#coding-drills/cdr-binary-search','#scenario-questions/sq-3','#coding-drills/cdr-binary-search']){location.hash=route;ctx.applyHash();ctx.renderBook();assert.equal(book.children[0].id,'sec-'+route.split('/')[1]);}
assert(persists>=391);assert.match(shell,/\.lesson-video[^}]*aspect-ratio:16\/9/);assert.match(shell,/max-width:940px/);assert.match(shell,/grid-template-columns:245px minmax\(0,1fr\)/);
console.log('Single-view primary content, canonical numbering, completion, valid/invalid deep links, history routes and four role sequences passed: '+count+' retained lesson/practice routes.');

// Mobile direct navigation sets the new route before rendering, closes the
// independently scrolling menu and returns keyboard focus to Contents.
const calls=[],goContext={publicCourse:true,state:{},book:{querySelector(){return null;}},document:{body:{classList:{contains(){return true;}}}},setHash(route){calls.push(route);},persist(){calls.push('persist');},closeMenu(){calls.push('close');},renderAll(){calls.push('render');},window:{scrollTo(){calls.push('top');}},menuBtn:{focus(){calls.push('focus');}}};
const go=new Function('context','with(context){return ('+source('go')+');}')(goContext);go('coding-drills','cdr-trees');assert.deepEqual(calls,['coding-drills/cdr-trees','persist','close','render','top','focus']);assert.equal(goContext.state.view,'coding-drills');
const mounts=[];ctx.window.PREP_AI_PRACTICE={mountLesson(container,id){mounts.push('ai:'+id);}};ctx.window.PREP_PRACTICE={mount(container,id){mounts.push('sim:'+id);}};
const threshold=ctx.topicById('evaluation-and-selection');ctx.renderLesson(threshold,threshold.learn.find(s=>s.id==='es-f4'));assert(mounts.includes('sim:evaluation-and-selection'));mounts.length=0;ctx.renderLesson(threshold,threshold.learn[0]);assert(!mounts.some(x=>x.startsWith('sim:')),'chapter simulation is not repeated on unrelated lessons');
console.log('Public mobile navigation sequencing/focus and subject-specific demo placement passed.');

// Completion replaces the lesson DOM: keyboard focus must follow the new button.
for (const focused of [true, false]) {
 const events=[], replacement={focus(options){assert.equal(options.preventScroll,true);events.push('focus');}};
 const refresh={state:{view:'coding-drills'},publicCourse:true,document:{activeElement:{matches(selector){assert.equal(selector,'.lesson-completion button');return focused;}}},
  book:{querySelectorAll(){return [];},querySelector(){return replacement;}},window:{scrollY:137,scrollTo(options){assert.equal(options.top,137);events.push('scroll');}},renderBook(){events.push('book');},renderRail(){events.push('rail');}};
 new Function('context','with(context){return ('+source('rerenderChapter')+');}')(refresh)({id:'coding-drills'});
 assert.deepEqual(events,focused?['book','rail','scroll','focus']:['book','rail','scroll']);
}
console.log('Completion rerender preserves keyboard focus and scroll without stealing unrelated focus.');

ctx.nextUnfinished=new Function('context','with(context){return ('+source('nextUnfinished')+');}')(ctx);
for(const path of C.paths){
 ctx.roleId=path.id;activities.clear();
 const first=ctx.recommendedTopics().find(t=>t.activities.length);
 assert.equal(ctx.nextUnfinished().section.id,first.activities[0].id,'completed lessons continue to exact unfinished practice');
 for(const topic of TOPICS)for(const practice of topic.activities)ctx.AC(topic.id,practice.id).status='pass';
 assert.equal(ctx.nextUnfinished(),null,'all complete supplies no false chapter restart');
 const lesson=ctx.recommendedTopics()[0].learn[0];ctx.T(ctx.recommendedTopics()[0].id).learn[lesson.id]=false;
 assert.equal(ctx.nextUnfinished().section.id,lesson.id,'unfinished learning retains priority');
 ctx.T(ctx.recommendedTopics()[0].id).learn[lesson.id]=true;
}
const resourceTopic=TOPICS[0],resourceLesson=resourceTopic.learn[0],savedReadings=ctx.READINGS[resourceTopic.id];
const optional={l:'Sponsored overview',u:'https://www.youtube.com/watch?v=aaaaaaaaaaa',optional:true,featured:true,access:'Public video'};
const coreVideo={l:'Core mechanism',u:'https://www.youtube.com/watch?v=bbbbbbbbbbb',featured:true,access:'Free'};
ctx.READINGS[resourceTopic.id]=[optional,coreVideo];
let resourceNodes=all(ctx.renderLesson(resourceTopic,resourceLesson));
assert.deepEqual(resourceNodes.filter(n=>n.tag==='iframe').map(n=>n.src),['https://www.youtube-nocookie.com/embed/bbbbbbbbbbb']);
assert(resourceNodes.some(n=>n.html==='Sponsored overview (optional)'));
assert(resourceNodes.some(n=>n.html==='Access: Public video'));
ctx.READINGS[resourceTopic.id]=[optional,{l:'Core reading',u:'https://example.org/mechanism',featured:true}];
assert.equal(all(ctx.renderLesson(resourceTopic,resourceLesson)).filter(n=>n.tag==='iframe').length,0,'featured reading never embeds unrelated optional video');
ctx.READINGS[resourceTopic.id]=savedReadings;
console.log('All role paths continue to unfinished practice; curated media, optional and access labels pass.');

const actualSelfMark=new Function('context','with(context){return ('+source('selfMarkButton')+');}')(ctx);
const legacyPractice={status:'pass',lastAnswer:'retained answer',attempts:2};
const legacyButton=actualSelfMark(legacyPractice,TOPICS[1],'Mark practised');
assert.equal(legacyButton.attrs['aria-pressed'],'true','historical pass remains visibly complete without a new self flag');
legacyButton.click();assert.equal(legacyPractice.status,'none');assert.equal(legacyPractice.lastAnswer,'retained answer');assert.equal(legacyPractice.attempts,2);
const retryButton=actualSelfMark(legacyPractice,TOPICS[1],'Mark practised');retryButton.click();assert.equal(legacyPractice.status,'pass');assert.equal(legacyPractice.self,true);
