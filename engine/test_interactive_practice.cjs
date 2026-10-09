const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const w={}; vm.runInNewContext(fs.readFileSync('engine/viz/interactive-practice.js','utf8'),{window:w});
const p=w.PREP_PRACTICE;
assert.equal(p.threshold(.85).precision,1); assert.equal(p.threshold(.75).precision,.5); assert.ok(p.threshold(.65).precision>.5);
const events=[{id:'x',event:8,available:9,revision:1,value:12},{id:'x',event:8,available:13,revision:2,value:20},{id:'y',event:11,available:11,revision:1,value:-4}];
assert.equal(p.pointInTime(events,10).x.value,12);assert.equal(p.pointInTime(events,14).x.value,20);assert.equal(p.pointInTime(events,7).x,undefined);
assert.ok(Math.abs(p.budget(1000000,.9995,500).allowed-500)<1e-8);assert.ok(Math.abs(p.budget(1000000,.9995,1000).burn-2)<1e-9);
for(const policy of ['fifo','fair']){const s={queue:Array.from({length:8},(_,i)=>({tenant:'A',id:i})).concat({tenant:'B',id:8}),last:null,done:{A:0,B:0}};p.tick(s,policy);p.tick(s,policy);assert.equal(s.done.B,policy==='fair'?1:0);assert.equal(s.done.A+s.done.B,2);}
console.log('interactive practice: precision counterexample, availability revisions, request budgets and tenant fairness passed');
