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
const walTerms=section('storage-engines','se-0').body;
const walGlossary=w.PREP_CORE['storage-engines'].glossary.flatMap(g=>g.rows).find(r=>r[0]==='Write-ahead log')[1];
for(const text of [walTerms,walGlossary]){
 assert.match(text,/durable acknowledgement/);
 assert.match(text,/memory/i);
 assert.match(text,/machine|power/);
 assert.doesNotMatch(text,/never lose|before a change touches|before the change itself/);
}
assert.match(section('sql-databases','sql-0').body,/non-synchronous acknowledgement/);
const diagramWindow={};for(const file of ['engine/viz-lib.js','engine/viz/sd-data.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),{window:diagramWindow});
assert.match(diagramWindow.VIZLIB_CAPTIONS['wal-recovery'],/In-memory pages may change earlier/);
assert.match(diagramWindow.VIZLIB_CAPTIONS['wal-recovery'],/non-synchronous acknowledgements/);
assert.doesNotMatch(diagramWindow.VIZLIB['wal-recovery']('wal-test'),/log is the source of truth|undo open work/);
const modelChoices=activity=>w.PREP_CORE[activity[0]].activities.find(a=>a.id===activity[1]);
assert.match(modelChoices(['deep-learning-essentials','dle-a2']).rubric,/CNN or vision transformer/);
assert.match(modelChoices(['classical-models','cm-a2']).rubric,/Unequal cluster sizes are a diagnostic hypothesis/);
assert.match(modelChoices(['serving-and-scale','ss-a1']).rubric,/inference, authorization or another hop may dominate/);
assert.doesNotMatch(modelChoices(['serving-and-scale','ss-a1']).rubric,/normally the feature fetch|feature fetch treated as the largest/);
assert.match(section('mlops-tooling','mot-local-build-track').body,/mixed valid\/invalid batch returns 422 before inference/);
assert.match(section('mlops-tooling','mot-local-build-track').body,/partial-result API is a separate optional extension/);

function activity(t,id){return w.PREP_CORE[t].activities.find(a=>a.id===id);}
const scale=activity('serving-and-scale','ss-a2');
assert.match(scale.rubric,/divided by/);assert.doesNotMatch(scale.rubric,/multiplied by the forecast peak/);
assert.match(scale.model,/ceiling\(300,000 \/ 1,000\) = 300/);assert.equal(Math.ceil(300000/1000),300);
const route=activity('rag-and-agents','raa-a2');assert.match(route.prompt,/Both route groups average 800 billable tokens/);assert.match(route.prompt,/one-shot/);
assert.match(route.model,/\$37,750/);assert.equal(20e6*(.7*500+.3*1500),16e9);assert.equal(14e6*500/1e6*.25+6e6*1500/1e6*4,37750);assert.equal(16e9/1e6*(.7*.25+.3*4),22000);
const serve=w.PREP_CORE['question-bank-mle'].learn.find(s=>s.id==='qb2-3').deeper;const inference=w.PREP_CORE['question-bank-mle'].learn.find(s=>s.id==='qb2-6').deeper;
assert.doesNotMatch(serve,/worse decision, never no decision|It schedules pods|p99 is much worse/);assert.match(serve,/safe halt/);assert.match(serve,/scheduler places them/);assert.match(serve,/perfectly correlated/i);assert.ok(Math.abs((1-.99**5)*100-4.90099501)<1e-8);
const perfectlyCorrelated=[...Array(99).fill([20,20,20,20,20]),[100,100,100,100,100]];assert.equal(perfectlyCorrelated.filter(xs=>Math.max(...xs)>20).length,1);
assert.match(inference,/often compute-heavy/);assert.match(inference,/preempt\/recompute/);assert.doesNotMatch(inference,/once the cache is full, new requests queue/);
const payment=section('system-design-cases','sdc-5');assert.match(payment.check.options[payment.check.answer],/verified processor contract/);assert.match(payment.check.explain,/expired keys|expired/i);assert.match(payment.body,/shard-local clearing/);
const payExercise=activity('system-design-cases','sdc-a2');assert.match(payExercise.rubric,/transactional partition/);assert.match(payExercise.model,/cross-shard atomic|atomic transfer protocol/);
assert.match(activity('queues-and-streams','qs-a2').rubric,/Accept durable RabbitMQ/);assert.match(activity('queues-and-streams','qs-a2').model,/already acknowledged history/);
const wal=section('storage-engines','se-f3');assert.match(wal.body,/sync=false/);assert.match(wal.body,/operating-system buffers/);assert.match(wal.check.explain,/not sufficient alone/);
assert.match(section('storage-engines','se-f2').body,/Retain a tombstone/);assert.match(section('storage-engines','se-0').deeper,/need not be at least one/);
assert.match(section('system-design-cases','sdc-4').body,/silent network loss cannot be detected instantly/);assert.match(activity('networking-basics','nb-a1').model,/60 \+ 200 \+ 200 \+ 100 \+ 40 \+ 100 = 700/);assert.equal(60+200+200+100+40+100,700);
const leakage=section('data-and-generalization','dag-f5');assert.match(leakage.check.question,/January 31/);assert.match(leakage.check.options[leakage.check.answer],/legitimate early-warning/);assert.doesNotMatch(activity('data-and-generalization','dag-a2').model,/would this value exist if the customer had not churned/);
const split=section('evaluation-and-selection','es-f1');assert.match(split.check.question,/absent from its training data/);assert.match(split.deeper,/existing accounts/);assert.match(split.deeper,/unseen accounts/);assert.match(activity('evaluation-and-selection','es-a2').rubric,/does not prove leakage/);
// Withdrawn claim stays correct: observed failures are input; allowance and burn are worked feedback.
const build=section('mlops-tooling','mot-local-build-track');assert.match(build.body,/1,000 bad requests/);assert.match(build.deeper,/500 allowed bad requests and burn rate 2/);
console.log('Independent review: effective optional answers, conditional contracts, arithmetic counterexamples and assessment consistency passed.');
