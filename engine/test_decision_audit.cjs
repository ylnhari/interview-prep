'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const os=require('node:os');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};
vm.createContext(sandbox);
const files=fs.readdirSync(path.join(root,'core')).filter(x=>x.endsWith('.js')&&x!=='library.js').sort();
for(const file of ['library.js',...files]) vm.runInContext(fs.readFileSync(path.join(root,'core',file),'utf8'),sandbox,{filename:file});
const core=sandbox.window.PREP_CORE;
const section=(t,id)=>core[t].learn.find(x=>x.id===id);
const task=(t,id)=>core[t].activities.find(x=>x.id===id);
const owned=['or-tooling','control-theory','rl-judgment','question-bank-fundamentals','scenario-questions'];
for(const t of owned){
  assert(core[t]);
  for(const a of core[t].activities) assert(a.rubric.includes('{{HONESTY}}'),a.id+' honesty');
}
// Extract and execute the actual displayed Python, not a separate reference.
function code(html){ const m=html.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/); assert(m,'displayed Python reference'); return m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'); }
const guard=code(task('or-tooling','or-status-validation').model);
const expectations=`
eligible={"A":["w1"],"B":["w1","w2"]}
capacity={"w1":1,"w2":1}
assert validate_plan("UNKNOWN", None, eligible, capacity)=="NO_USABLE_SOLUTION"
assert validate_plan("INFEASIBLE", {"A":"w1","B":"w2"}, eligible, capacity)=="NO_USABLE_SOLUTION"
assert validate_plan("FEASIBLE", {"A":"w1","B":"w1"}, eligible, capacity)=="OVER_CAPACITY"
assert validate_plan("OPTIMAL", {"A":"w2","B":"w1"}, eligible, capacity)=="INELIGIBLE_WORKER"
assert validate_plan("FEASIBLE", {"A":"w1","B":"w2"}, eligible, capacity)=="VALID_FOR_THIS_CONTRACT"
assert validate_plan("FEASIBLE", {"A":"w1","B":"w2"}, eligible, {"w1":1,"w2":0})=="OVER_CAPACITY"
assert validate_plan("FEASIBLE", {"A":"w1"}, eligible, capacity)=="MISSING_OR_EXTRA_JOB"
assert validate_plan("FEASIBLE", {}, {}, {})=="VALID_FOR_THIS_CONTRACT"
`;
const loss=code(section('question-bank-fundamentals','qb-1').deeper);
const arithmetic=`
assert decision_loss([0,0,9],0,"absolute") < decision_loss([0,0,9],3,"absolute")
assert decision_loss([0,0,9],3,"squared") < decision_loss([0,0,9],0,"squared")
assert abs((1 - .95**20) - .6415140775914581) < 1e-12
assert 3/(3+1) == .75
try:
    decision_loss([1],0,"unknown")
except ValueError:
    pass
else:
    raise AssertionError("invalid loss accepted")
`;
for(const [label,script] of [['displayed status guard',guard+expectations],['displayed loss counterexample',loss+arithmetic]]){
  let run;
  if(process.platform==='win32' && !process.env.PYTHON){
    // pyenv-win exposes python.bat, which cannot be spawned directly by Node.
    const filename=path.join(os.tmpdir(),'prep-decision-'+process.pid+'.py');
    fs.writeFileSync(filename,script);
    try {
      run=spawnSync(path.join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-Command','python $env:PREP_TEST_PYTHON_FILE'],{encoding:'utf8',cwd:root,env:{...process.env,PREP_TEST_PYTHON_FILE:filename}});
    } finally {fs.unlinkSync(filename);}
  } else run=spawnSync(process.env.PYTHON || 'python',['-c',script],{encoding:'utf8',cwd:root});
  assert.equal(run.status,0,label+': '+(run.stderr || run.error));
}
const effective=owned.map(id=>JSON.stringify(core[id])).join('\n');
for(const stale of ['No propensities, no credible','Teaching material, essentially never production','single most common','at zero customer risk','last-known-good plan always available','I have been wrong about that distinction before','a couple of hours','cannot tell a PID controller','convex problems only','Everyone moved','Recognize it; do not study it']) assert(!effective.includes(stale),'stale teaching: '+stale);
for(const id of ['sq-0','sq-1','sq-2','sq-3','sq-4']) assert(section('scenario-questions',id),'stable route '+id);
for(const id of ['qb-1','qb-2','qb-3','qb-4','qb-5','qb-6','qb-7']){
  const x=section('question-bank-fundamentals',id);
  const q=[...x.body.matchAll(/<b>Q\d+\.<\/b>/g)].length;
  const a=[...x.deeper.matchAll(/<b>A\d+\.<\/b>/g)].length;
  assert.equal(q,a,id+' reference coverage');
}
assert.equal(section('question-bank-fundamentals','qb-1').check,null);
assert(section('rl-judgment','rl-0').body.includes('direct/model-based evaluation'));
assert(section('question-bank-fundamentals','qb-2').deeper.includes('UNKNOWN/no incumbent'));
assert(section('question-bank-fundamentals','qb-4').deeper.includes('Direct/model-based or FQE'));
assert(task('scenario-questions','sq-a2').rubric.includes('defer'));
assert(task('scenario-questions','sq-a4').model.includes('approved tool'));
const rlChoice=section('rl-judgment','rl-1').check;
assert(rlChoice.question.includes('observes only the chosen'));
assert(rlChoice.question.includes('no consequential effect on future contexts'));
assert(rlChoice.options[rlChoice.answer].includes('contextual bandit'));
assert(!/most widely used|dominate industrial use/.test(JSON.stringify(rlChoice)),'final-loaded RL choice must not teach prevalence');
const leakageChoice=section('scenario-questions','sq-1').check;
assert(leakageChoice.options[leakageChoice.answer].includes('containment'));
assert(leakageChoice.options[leakageChoice.answer].includes('in parallel'));
assert(!/quantify harm before choosing|before considering any containment/.test(leakageChoice.options[leakageChoice.answer]),'investigation completion must not gate risk-aware containment');
assert(leakageChoice.explain.includes('before investigation is complete'));
console.log('Decision audit: displayed Python, changed constraints, arithmetic, stable routes and synchronized bank references pass.');
