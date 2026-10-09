const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),w={};
for(const f of ['engine/viz-lib.js','engine/viz/interactive-practice.js','engine/viz/z-feature-platform-practice.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:w});
const h=w.HARBOR_PRACTICE;
for(const [d,value] of [[5,2],[300,3],[2760,4]])assert.equal(h.eligible(h.rows,'harbor-a',d,21600).value,value);
assert.equal(h.eligible(h.rows,'harbor-a',25000,21600),null);
assert(!h.architecture('test-1',1).includes('Event stream'));assert(h.architecture('test-2',2).includes('Event stream'));assert(!h.architecture('test-2',2).includes('Policy:'));assert(h.architecture('test-3',3).includes('Policy:'));assert(!h.architecture('test-3',3).includes('Home writer'));assert(h.architecture('test-4',4).includes('Home writer'));assert(w.PREP_PRACTICE.styles.includes('max-width:100%'));assert.equal(h.eligible(h.rows,'missing',300,21600),null);
assert.deepEqual(JSON.parse(JSON.stringify(h.allocate(100).allocation)),{A:60,B:20,C:20});assert.equal(h.allocate(100).backlog.A,30);assert.equal(h.allocate(100).backfill,0);
assert.deepEqual(JSON.parse(JSON.stringify(h.allocate(60).allocation)),{A:20,B:20,C:20});assert.equal(h.allocate(60).backlog.A,70);
const current={asof:720,rev:2,value:7};assert.equal(h.publish(current,{asof:0,rev:9,value:4}).value,current);assert.equal(h.publish(current,{asof:720,rev:2,value:7}).value,current);assert.equal(h.publish(current,{asof:780,rev:1,value:8}).value.value,8);
assert.ok(Math.abs(100000000/86400-1157.4074)<.001);assert.ok(Math.abs(100000000/86400*20-23148.148)<.001);assert.equal(100000000*500/1e9,50);
console.log('Harbor: tenant/time/age eligibility, capacity reservations, no-regression replay and synthetic capacity arithmetic passed');

// Execute the real mounted controller: changing the regional scenario changes the stated contract.
const nodes={};let mounted;
for(const key of ['.harbor-stage','.harbor-diagram','.harbor-failure','.harbor-feedback','.build-history','.build-stream','.build-online','.build-feedback','.time-select','.time-lanes','.time-feedback','.capacity','.fair-bars','.fair-feedback','.replay-feedback'])nodes[key]={value:'',checked:false,addEventListener(event,fn){this[event]=fn;}};
nodes['.harbor-failure'].value='none';nodes['.build-history'].checked=true;nodes['.build-online'].checked=true;nodes['.time-select'].value='5';nodes['.capacity'].value='100';
const browserWindow={};const context={window:browserWindow,document:{createElement(){return {setAttribute(){},querySelector(sel){assert(nodes[sel],sel);return nodes[sel];},querySelectorAll(){return [];}};}}};
for(const f of ['engine/viz-lib.js','engine/viz/interactive-practice.js','engine/viz/z-feature-platform-practice.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
browserWindow.PREP_PRACTICE.mount({querySelector(){return null;},firstElementChild:{insertAdjacentElement(where,node){mounted=node;}}},'enterprise-feature-platform');
assert(mounted.innerHTML.includes('Regional scenario: 60s freshness, replica lag 5m'));
assert.match(nodes['.harbor-feedback'].textContent,/six-hour/);
assert.doesNotMatch(nodes['.build-feedback'].textContent,/60 seconds/);
nodes['.harbor-failure'].value='region';nodes['.harbor-failure'].change();
assert.match(nodes['.harbor-feedback'].textContent,/changes the target to 60 seconds/);
assert.match(nodes['.harbor-feedback'].textContent,/original six-hour target/);
assert.match(nodes['.build-feedback'].textContent,/60 seconds/);
nodes['.harbor-failure'].value='none';nodes['.harbor-failure'].change();
assert.doesNotMatch(nodes['.build-feedback'].textContent,/60 seconds/);
console.log('Harbor mounted regional scenario and original-contract restoration passed.');
