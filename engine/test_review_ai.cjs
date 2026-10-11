const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const folder = path.join(__dirname, '..', 'core');
const override = 'zzzzzzzz-review-ai.js';
const context = vm.createContext({window: {}});
const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
for (const file of ['library.js', ...files.filter(f => f !== 'library.js' && f !== override).sort()]) {
  vm.runInContext(fs.readFileSync(path.join(folder,file),'utf8'), context);
}
const core = context.window.PREP_CORE;
const mapping = () => JSON.stringify(Object.entries(core).map(([id,c]) => [id,
  c.learn.map(s => [s.id,s.check]), (c.activities||[]).map(a => [a.id,a.type])]));
const before = mapping();
vm.runInContext(fs.readFileSync(path.join(folder,override),'utf8'), context);
assert.equal(mapping(),before,'all existing routes and complete quiz objects must remain unchanged');
const lesson = (chapter,id) => core[chapter].learn.find(s => s.id === id);
assert(!lesson('genai-platform','gp-0').body.includes('this round'));
assert.equal(core['genai-platform'].activities.find(a=>a.id==='gp-a4').title,'Explain and apply: three AI mechanisms');
assert(!lesson('rag-and-agents','raa-0').deeper.includes('retrieval is cheaper than fine-tuning'));
assert.match(lesson('rag-and-agents','raa-f4').body,/compares the query against all centroids/);
assert.match(lesson('rag-and-agents','raa-f2').body,/longer ideas, tables or dependencies can still/);
assert.match(lesson('llm-inference-engineering','lie-0').body,/normalization, segmentation and encoding/);
assert(!lesson('llm-inference-engineering','lie-0').body.includes('500 separate passes'));
assert(!lesson('llm-inference-engineering','lie-0').body.includes('input prompt in one pass'));
assert.match(lesson('rag-and-agents','raa-f6').body,/still attend to the retained prefix keys and values/);
assert(!core['genai-platform'].activities.find(a=>a.id==='gp-a2').model.includes('Everything else on this list is recoverable'));
assert.match(lesson('llm-inference-engineering','lie-f4').deeper,/2023[\s\S]*FasterTransformer and Orca/);
for (const term of ['Chunked prefill','Prefix caching','Prefill/decode disaggregation','KV transfer'])
  assert(lesson('llm-inference-engineering','lie-f7').body.includes(term));
for (const term of ['Tensor parallelism','Pipeline parallelism','Mixture of experts','load imbalance'])
  assert(lesson('llm-inference-engineering','lie-f8').body.includes(term));
// Execute the retained validation example, testing independent result contracts.
const model = core['genai-platform'].activities.find(a=>a.id==='gp-structured-output-drill').model;
const code = model.match(/<code>([\s\S]*?)<\/code>/)[1]
  .replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');
const validate = new Function(code+'; return validateAnswer;')();
const permitted = new Set(['p1']);
const budget = {attempt:0,remainingMs:10};
const response = value=>({status:'complete',text:JSON.stringify(value)});
const valid = response({answer:'Claim',citations:['p1']});
assert.equal(validate(valid,permitted,()=>true,budget).status,'accepted');
assert.equal(validate(valid,permitted,()=>false,budget).status,'abstain');
assert.equal(validate(valid,new Set(),()=>true,budget).status,'stop');
assert.equal(validate(response({answer:'Claim',citations:['p1'],extra:1}),permitted,()=>true,budget).status,'repair');
assert.equal(validate({status:'refusal'},permitted,()=>true,budget).status,'refusal');
assert.equal(validate({status:'timeout'},permitted,()=>true,{attempt:2,remainingMs:10}).status,'stop');
assert.equal(validate({status:'truncated'},permitted,()=>true,{attempt:0,remainingMs:0}).status,'stop');
assert.equal(validate({status:'complete',text:'{'},permitted,()=>true,budget).status,'repair');
assert.equal(validate(response({answer:'',citations:['p1']}),permitted,()=>true,budget).status,'repair');
assert.match(lesson('llm-fine-tuning-and-alignment','lft-0').body,/does not impose a hard bound on policy distance/);
const ppo=core['llm-fine-tuning-and-alignment'].glossary.flatMap(g=>g.rows).find(r=>r[0]==='PPO')[1];
assert.match(ppo,/PPO-Clip[\s\S]*PPO-Penalty[\s\S]*fixed reference policy/);
const goodput=core['llm-inference-engineering'].activities.find(a=>a.id==='lie-a3');
assert.match(goodput.model,/Worse attainment does not necessarily mean fewer good requests per second/);
assert.match(goodput.rubric,/distinguishes this rate from the SLO attainment fraction/);
assert.equal(100*.99,99);assert.equal(200*.9,180);
assert(200*.9>100*.99 && .9<.99 && 200*(1-.9)>100*(1-.99));
console.log('AI review: preserved routes/quiz mappings, corrected mechanism coverage and 9 validation contracts passed');
