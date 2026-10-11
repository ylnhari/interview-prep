'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const window = {};
const context = vm.createContext({window});
const files = fs.readdirSync(path.join(root, 'core')).filter(f => f.endsWith('.js'));
const patch = 'zzzzzzzz-review-practice.js';
const owned = ['start-here','scenario-questions','coding-drills','question-bank-system-design','question-bank-mle','question-bank-ml-foundations','question-bank-llm','question-bank-fundamentals'];
function run(f) { vm.runInContext(fs.readFileSync(path.join(root,'core',f),'utf8'), context, {filename:f}); }
run('library.js');
files.filter(f => f !== 'library.js' && f !== patch).sort().forEach(run);
function identity() {
  return JSON.stringify(owned.filter(id => window.PREP_CORE[id]).map(id => {
    const t = window.PREP_CORE[id];
    return {id, learn:t.learn.map(s => ({id:s.id,check:s.check})), activities:t.activities.map(s => ({id:s.id,check:s.check}))};
  }));
}
const before = identity(); run(patch); assert.strictEqual(identity(), before, 'routes and quiz mappings remain identical');
const core = window.PREP_CORE;
function s(topic,id,activity=false) { return core[topic][activity?'activities':'learn'].find(s=>s.id===id); }
assert.match(s('question-bank-system-design','qbsd-4').deeper,/predecessor to that new node/);
assert.doesNotMatch(s('question-bank-system-design','qbsd-5').deeper,/Redis's default approximates LRU/);
assert.match(s('question-bank-system-design','qbsd-6').deeper,/isolation comes from/);
assert.match(s('question-bank-ml-foundations','qbmlf-3').deeper,/negative gradient/);
assert.doesNotMatch(s('question-bank-ml-foundations','qbmlf-a2',true).model,/Transformers need learning rate warmup/);
assert.match(s('question-bank-mle','qb2-2').deeper,/not a guarantee that each value is physically computed once/);
assert.match(s('question-bank-mle','qb2-5').deeper,/cannot reverse decisions already made/);
assert.match(s('question-bank-llm','qbllm-2').deeper,/inter-token latency records actual gaps/);
assert.match(s('question-bank-llm','qbllm-3').deeper,/rather than keeping a protected subset in mixed precision/);
assert.match(s('coding-drills','cdr-a2',true).model,/sorting the retained output adds/);
assert.match(s('question-bank-system-design','qbsd-6').deeper,/current term/);
assert.match(s('question-bank-system-design','qbsd-1').deeper,/mean in-flight requests/);
assert.match(s('question-bank-system-design','qbsd-a2',true).model,/multiplexing/);
assert.match(s('question-bank-mle','qb2-2').deeper,/must use only feature information available/);
assert.match(s('question-bank-mle','qb2-6').deeper,/network egress/);
assert.match(s('question-bank-ml-foundations','qbmlf-3').deeper,/Both are strictly proper/);
assert.match(s('question-bank-mle','qb2-5').deeper,/region-specific availability/);
assert.match(s('question-bank-mle','qb2-2').deeper,/sampled serving inputs/);
assert.match(s('question-bank-mle','qb2-1').deeper,/Git history alone does not prove/);
assert.match(s('question-bank-llm','qbllm-4').deeper,/159,907,840/);
assert.doesNotMatch(s('question-bank-llm','qbllm-a1',true).model,/under about one percent/);
assert.doesNotMatch(s('question-bank-llm','qbllm-a1',true).rubric,/under roughly 1%/);
assert.strictEqual(32*64*(4*(4096+4096)+3*(4096+11008)),159907840);
assert.match(s('question-bank-ml-foundations','qbmlf-8').deeper,/Non-core border/);
assert.match(s('question-bank-ml-foundations','qbmlf-5').deeper,/continuous nonpolynomial/);
assert.doesNotMatch(s('question-bank-ml-foundations','qbmlf-a2',true).prompt,/transformers need/);
assert.match(s('question-bank-ml-foundations','qbmlf-1').deeper,/preserves neighbor ordering/);
assert.match(s('question-bank-fundamentals','qb-5').deeper,/n=4/);
assert.match(s('question-bank-system-design','qbsd-3').deeper,/read uncommitted level permits dirty reads/);
const acidAnswer=s('question-bank-system-design','qbsd-3').deeper.match(/<li><b>A16\.<\/b>(.*?)<\/li>/)[1];
for(const guarantee of ['Atomicity','Consistency','Isolation','Durability']) assert.ok(acidAnswer.includes(guarantee), guarantee+' retained in A16');
assert.match(s('question-bank-system-design','qbsd-7').deeper,/In-memory mutation can precede/);
assert.match(s('question-bank-system-design','qbsd-a2',true).model,/1,000 bad requests/);
assert.doesNotMatch(s('question-bank-system-design','qbsd-a1',true).model,/catches a contract mismatch at compile time/);
const childProcess=require('child_process');
const python=process.argv[2] || process.env.PYTHON || 'python';
function decode(text) {return text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
const featureCode=decode(s('coding-drills','cdr-a1',true).model.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)[1]);
const sqlPrompt=s('coding-drills','cdr-a4',true).prompt;
const eventDDL=sqlPrompt.match(/Use events\((.*?)\) and decisions/)[1];
const decisionDDL=sqlPrompt.match(/and decisions\((.*?)\)\./)[1];
const adversarial=`\nimport sqlite3\nfor args in [(float('nan'),120),(60,float('inf')),(float('inf'),float('inf'))]:\n    try: FeatureComputer(*args)\n    except ValueError: pass\n    else: raise AssertionError('nonfinite horizon accepted')\nf=FeatureComputer();f.add('a','k',1,1e308,1);f.add('b','k',2,-1e308,2)\ntry: f.query('k',2)\nexcept OverflowError: pass\nelse: raise AssertionError('overflow not rejected')\nf=FeatureComputer();f.add('a','k',1,1e308,1);f.add('b','k',2,1e308,2)\ntry: f.query('k',2)\nexcept OverflowError: pass\nelse: raise AssertionError('sum overflow not rejected')\nf=FeatureComputer();f.add('a','k',1,2,1);f.add('b','k',2,4,2)\nassert f.query('k',2)=={'count':2,'sum':6,'mean':3,'variance':2}\nc=sqlite3.connect(':memory:');c.execute(${JSON.stringify('CREATE TABLE events('+eventDDL+')')});c.execute(${JSON.stringify('CREATE TABLE decisions('+decisionDDL+')')})\nfor table,row in [('events',[None,'k',1,1,2,'x']),('events',['a',None,1,1,2,'x']),('events',['a','k',None,1,2,'x']),('events',['a','k',1,None,2,'x']),('decisions',[None,'k',2]),('decisions',['d',None,2]),('decisions',['d','k',None])]:\n    try: c.execute('INSERT INTO '+table+' VALUES ('+','.join('?' for _ in row)+')',row)\n    except sqlite3.IntegrityError: pass\n    else: raise AssertionError('NULL fixture accepted')\nprint('Python numerical overflow and SQLite NULL fixtures passed.')\n`;
const pyResult=childProcess.spawnSync(python,['-c',featureCode+adversarial],{encoding:'utf8'});
if(pyResult.status===0)process.stdout.write(pyResult.stdout);
else if(process.argv[2] || process.env.PYTHON)throw Error(pyResult.stderr || pyResult.error || pyResult.stdout);
else console.log('Python fixture execution unavailable; supply a Python executable as argument for numerical/SQL runtime checks.');
// A concrete clockwise ring counterexample: inserting 40 between 20 and 70
// transfers keys 21..40 from 70, not keys 41..70.
function owner(nodes,key) { return nodes.find(n=>n>=key) ?? nodes[0]; }
assert.strictEqual(owner([20,70],30),70);
assert.strictEqual(owner([20,40,70],30),40);
assert.strictEqual(owner([20,40,70],50),70);
console.log('Practice review: quiz/route compatibility and corrected technical contracts pass.');
