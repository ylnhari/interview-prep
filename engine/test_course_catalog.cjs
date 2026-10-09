const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const w={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window:w});vm.runInNewContext(fs.readFileSync('packs/course/content.js','utf8'),{window:w});
const c=w.PREP_CONTENT,topics=[...c.topics,...c.useCore.map(id=>w.PREP_CORE[id])],by=new Map(topics.map(t=>[t.id,t]));
assert.equal(new Set(topics.map(t=>t.id)).size,topics.length);assert.equal(c.paths.length,4);assert.equal(c.groups.filter(g=>g.id!=='start').length,6);
for(const t of topics){assert(!/interview|round|asked|comes up|preparation/i.test(t.levelLabel||""),t.id+" neutral orientation");assert(c.chapterGuides[t.id]?.outcome);assert(c.chapterGuides[t.id]?.artifact);assert(c.groups.some(g=>g.ids.includes(t.id)));for(const p of c.chapterGuides[t.id].prerequisites)assert(by.has(p));}
for(const p of c.paths){assert(p.capstone);assert.equal(new Set(p.ids).size,p.ids.length);for(const id of p.ids)assert(by.has(id));}
const missing=[];
function scan(value,where){if(typeof value==='string'){for(const match of value.matchAll(/href=["']#([a-z0-9-]+)(?:\/([a-z0-9-]+))?["']/g)){const [,tid,sid]=match;if(['home','glossary'].includes(tid))continue;const t=by.get(tid);if(!t||sid&&!t.learn.concat(t.activities).some(s=>s.id===sid))missing.push(where+' → '+tid+(sid?'/'+sid:''));}}else if(value&&typeof value==='object'){for(const [k,v]of Object.entries(value))scan(v,where+'/'+k);}}
for(const t of topics)scan(t,t.id);
if(missing.length){console.error('INVALID SEMANTIC DESTINATIONS\n'+missing.join('\n'));process.exitCode=1;}
console.log(JSON.stringify({topics:topics.length,lessons:topics.reduce((n,t)=>n+t.learn.length,0),checks:topics.reduce((n,t)=>n+t.learn.filter(s=>s.check).length,0),activities:topics.reduce((n,t)=>n+t.activities.length,0),codeActivities:topics.reduce((n,t)=>n+t.activities.filter(a=>a.type==='code').length,0),visualReferences:topics.reduce((n,t)=>n+t.learn.concat(t.activities).filter(s=>s.viz).length,0),readings:topics.reduce((n,t)=>n+(c.readings[t.id]||t.readings||[]).length,0),badLinks:missing.length}));
