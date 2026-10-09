'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const w={};for(const f of ['library.js',...fs.readdirSync(path.join(__dirname,'../core')).filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../core',f),'utf8'),{window:w});
function section(t,id){return w.PREP_CORE[t].learn.find(s=>s.id===id);}
const budget=section('sre-practices','srep-f2').body;
assert.match(budget,/1,000,000/);assert.match(budget,/500 bad requests/);assert.equal(Math.round((1-.9995)*1e6),500);assert.ok(Math.abs((1-.9995)*43200-21.6)<1e-8);assert.equal(.0025/.0005,5);
const ndcg=section('search-and-retrieval','sr-f5').body;assert.match(ndcg,/IDCG@1=7/);assert.match(ndcg,/NDCG@1=1\/7/);assert.equal((2**1-1)/(2**3-1),1/7);
function fp(k){return (1-Math.exp(-k/10))**k;}assert.ok(fp(7)<fp(1));assert.ok(fp(7)<fp(20));assert.ok(Math.abs(fp(7)-.0082)<.0001);
assert.ok(Math.abs(1e8/86400-1157.4074)<.001);assert.ok(Math.abs(20*1e8/86400-23148.148)<.001);assert.equal(1e8*500/1e9,50);assert.equal(7*1e8*500/1e9,350);
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/feature-platform.json'),'utf8'));
// Execute the fixture's declared contract: identity isolation plus event and region-availability cutoff.
function reconstruct(tenant,entity,at,region){const xs=fixture.records.filter(r=>r.tenant===tenant&&r.entity===entity&&r.event_time<=at&&r.online_available[region]<=at);return xs.sort((a,b)=>b.version-a.version)[0]?.value??null;}
for(const d of fixture.observed_decisions)assert.equal(reconstruct(d.tenant,d.entity,d.at,d.region),d.observed_value);
assert.equal(reconstruct('b','same-key',fixture.cutoff,'west'),500);
assert.equal(reconstruct('a','same-key','2026-01-01T10:00:00Z','west'),99);
assert.equal(reconstruct('a','replica-lag',fixture.cutoff,'east'),20);
assert.equal(reconstruct('a','replica-lag',fixture.cutoff,'west'),null);
assert.equal(reconstruct('a','replica-lag','2026-01-01T09:35:00Z','west'),20);
assert.equal(reconstruct('unknown','same-key',fixture.cutoff,'west'),null);
for(const [t,id,pattern] of [['caching','cache-0',/never disagree/],['distributed-coordination','dc-3',/always current/],['reliability-ops','ro-f4',/uniquely available|single most valuable/],['serving-and-scale','ss-f2',/almost every serving round/]])assert.doesNotMatch(section(t,id).body,pattern);
assert.equal(section('enterprise-feature-platform','efp-0').title,'Key terms');assert.equal(w.PREP_CORE['system-design-cases'].learn[0].title,'Key terms');
console.log('Systems arithmetic, counterexamples, tenant/time fixtures and content regression checks passed.');
