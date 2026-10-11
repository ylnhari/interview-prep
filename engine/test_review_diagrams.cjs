// Full public-reference geometry/ID regression; browser pixel QA is separate.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const window={};
const run=p=>vm.runInNewContext(fs.readFileSync(p,'utf8'),{window},{filename:p});
run('core/library.js');
for(const f of fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort())run('core/'+f);
run('packs/course/content.js');run('engine/viz-lib.js');
for(const f of fs.readdirSync('engine/viz').filter(f=>f.endsWith('.js')).sort())run('engine/viz/'+f);
const c=window.PREP_CONTENT,topics=[...c.topics];
for(const id of c.useCore)if(!topics.some(t=>t.id===id))topics.push(window.PREP_CORE[id]);
const references=[];
function scan(x,path){if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){if(k==='viz'&&typeof v==='string')references.push({id:v,path});else scan(v,path+'.'+k);}}
topics.forEach(t=>scan(t,t.id));
const ids=[...new Set(references.map(r=>r.id))],rendered={};
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
let svgCount=0,htmlCount=0;
for(const id of ids){
 assert.equal(typeof window.VIZLIB[id],'function',id+' exists');
 const markup=rendered[id]=window.VIZLIB[id]('review-'+id);
 const definitions=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(definitions).size,definitions.length,id+' has unique internal IDs');
 for(const m of markup.matchAll(/url\(#([^)]*)\)/g))assert(definitions.includes(m[1]),id+' defines referenced marker '+m[1]);
 for(const m of markup.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g))for(const ref of m[1].split(/\s+/))assert(definitions.includes(ref),id+' defines accessible name '+ref);
 const vb=markup.match(/<svg[^>]*viewBox="([^"]+)"/);
 if(!vb){htmlCount++;assert.match(markup,/<section\b/);assert.match(markup,/@media/);continue;}
 svgCount++;const[x,y,w,h]=vb[1].split(/\s+/).map(Number);assert(w>0&&h>0,id+' finite canvas');
 for(const m of markup.matchAll(/<text\b([^>]+)>/g)){const a=attrs(m[1]);assert(+a.x>=x&&+a.x<=x+w&&+a.y>=y&&+a.y<=y+h,id+' text anchor/baseline inside canvas');}
 for(const m of markup.matchAll(/<rect\b([^>]+)>/g)){const a=attrs(m[1]);assert(+a.x>=x&&+a.y>=y&&+a.x + +a.width<=x+w&&+a.y + +a.height<=y+h,id+' rectangle inside canvas');}
 const body=markup.replace(/<defs>[\s\S]*?<\/defs>/g,'');
 for(const m of body.matchAll(/<(circle|ellipse|line)\b([^>]+)>/g)){const a=attrs(m[2]),bounds=m[1]==='line'?[Math.min(+a.x1,+a.x2),Math.min(+a.y1,+a.y2),Math.max(+a.x1,+a.x2),Math.max(+a.y1,+a.y2)]:[+a.cx- +(a.r||a.rx),+a.cy- +(a.r||a.ry),+a.cx+ +(a.r||a.rx),+a.cy+ +(a.r||a.ry)];assert(bounds[0]>=x&&bounds[1]>=y&&bounds[2]<=x+w&&bounds[3]<=y+h,id+' '+m[1]+' inside canvas');}
}
// Recompute the shown rankings rather than accepting a hand-written fused rank.
const ranks=[['B','A','D','C'],['A','D','C','B']],scores={};
for(const list of ranks)list.forEach((doc,i)=>scores[doc]=(scores[doc]||0)+1/(60+i+1));
const ordered=Object.keys(scores).sort((a,b)=>scores[b]-scores[a]);
assert.equal(ordered.join(','),'A,B,D,C');assert.match(rendered['hybrid-rank-fusion'],new RegExp('D is fused #'+(ordered.indexOf('D')+1)));
assert(Math.abs(scores.D-0.032)<0.00001);
// Separators must partition every shown leaf, including the highlighted key.
const leafRanges=[[1,24],[25,54],[55,69],[70,99]],root=55,left=25,right=70;
for(const[lo,hi]of leafRanges){assert.equal(lo<root,hi<root);assert.equal(lo<(lo<root?left:right),hi<(lo<root?left:right));}
for(const separator of [root,left,right])assert(rendered['btree-index'].includes('['+separator+']'));
assert(62>=leafRanges[2][0]&&62<=leafRanges[2][1]);assert.match(rendered['btree-index'],/B\+ tree/);
assert.match(rendered['quorum-w-r-n'],/retained versions still need correct reconciliation/);
assert.match(rendered['raft-election'],/current-term entry/);
assert.match(window.VIZLIB_CAPTIONS['paged-attention-blocks'],/partially filled block/);
assert.match(window.VIZLIB_CAPTIONS['bandit-vs-rl'],/reward may be delayed/);
assert.match(window.VIZLIB_CAPTIONS['chunk-overlap'],/longer than that overlap can still be split/);
assert.match(rendered['capacity-estimate'],/86,400 s/);assert.match(rendered['capacity-estimate'],/2 MB/);
// Offset dots represent positions inside their own 150-unit partition bars.
for(const m of rendered['consumer-group-offsets'].matchAll(/<circle\b([^>]+)>/g)){const a=attrs(m[1]);if(+a.cy!==45)continue;assert([40,220,400,580].some(start=>+a.cx- +a.r>=start&&+a.cx+ +a.r<=start+150),'consumer offset belongs to a displayed partition');}
console.log(`${topics.length} chapters: ${references.length} references, ${ids.length} diagrams (${svgCount} SVG / ${htmlCount} responsive HTML) passed canvas, internal-ID and reviewed numerical/mechanism regressions.`);

// Independent numerical fixtures recover coordinates from actual rendered SVG.
const tags=(id,tag)=>[...rendered[id].matchAll(new RegExp('<'+tag+'\\b([^>]+)>','g'))].map(m=>attrs(m[1]));
const close=(a,b,msg)=>assert(Math.abs(a-b)<1e-8,msg+': '+a+' vs '+b);
const circles=id=>tags(id,'circle');
const polys=id=>tags(id,'polyline').map(a=>a.points.trim().split(/\s+/).map(p=>p.split(',').map(Number)));
const origin=[70,190],query=[226,108],candidates=[[210,96],[246,118],[180,128],[330,70],[366,150],[130,68],[300,172],[396,106],[150,172]];
const cosine=p=>{const a=p.map((v,i)=>v-origin[i]),b=query.map((v,i)=>v-origin[i]);return(a[0]*b[0]+a[1]*b[1])/Math.hypot(...a)/Math.hypot(...b);};
const top=candidates.slice().sort((a,b)=>cosine(b)-cosine(a)).slice(0,3);
assert.deepEqual(top,[[180,128],[330,70],[246,118]]);
const highlighted=circles('vector-similarity').filter(a=>a.fill==='var(--accent)').map(a=>[+a.cx,+a.cy]);
assert.deepEqual(highlighted,top,'cosine top-k matches the coordinates, not Euclidean proximity');
const canary=tags('canary-rollout','rect').filter(a=>a.fill==='var(--accent)').map(a=>+a.width);
assert.deepEqual(canary,[.01,.05,.25,1].map(p=>300*p),'traffic bar width is proportional to percentage');
assert.match(rendered['rollback-path'],/M640 138H470/);
const bars=tags('scale-test-3x','rect');assert.deepEqual(bars.map(a=>+a.x+ +a.width/2),[280,370,460,640]);
assert.deepEqual(bars.map(a=>(180- +a.y)*2),[65,115,170,260]);assert(+bars.at(-1).y<80,'3x measured latency really exceeds horizontal 200ms budget');
const observed=polys('calibration-curve')[0].map(([x,y])=>[(x-70)/330,(176-y)/146]);
for(const[p,o]of observed)assert(o<p,'overconfident curve is below the probability diagonal');
const [roc,pr]=polys('roc-vs-pr'),rates=roc.map(([x,y])=>[(x-60)/240,(170-y)/140]);let auc=0;
for(let i=1;i<rates.length;i++){auc+=(rates[i][0]-rates[i-1][0])*(rates[i][1]+rates[i-1][1])/2;const[fpr,tpr]=rates[i],precision=.001*tpr/(.001*tpr+.999*fpr);close((pr[i-1][0]-420)/240,tpr,'PR recall uses same threshold');close((170-pr[i-1][1])/140*.01,precision,'PR precision uses same threshold');}
close(auc,0.8211309523809524,'trapezoid ROC AUC');assert.match(rendered['roc-vs-pr'],/AUC = 0.82113/);assert.match(rendered['roc-vs-pr'],/precision = 0.00512/);
assert(tags('roc-vs-pr','line').some(a=>+a.x1===420&&+a.x2===660&&+a.y1===156),'zoomed baseline maps prevalence .001');
const tree=circles('tree-split').filter(a=>a.fill==='var(--good)'||a.fill==='var(--danger)');
const gini=items=>{const n=items.length,p=items.filter(a=>a.fill==='var(--good)').length/n;return 1-p*p-(1-p)*(1-p);};
const leftPts=tree.filter(a=>+a.cx<=112),rightPts=tree.filter(a=>+a.cx>112);
close(gini(leftPts),20/49,'left Gini');close(gini(rightPts),0,'right Gini');
close((leftPts.length*gini(leftPts)+rightPts.length*gini(rightPts))/tree.length,2/7,'weighted Gini');assert.match(rendered['tree-split'],/gain = 0.2143/);
const svmLines=tags('svm-margin','line'),boundary=svmLines.find(a=>a.stroke==='var(--ink)');
for(const p of [[+boundary.x1,+boundary.y1],[+boundary.x2,+boundary.y2]])close(80*p[0]+30*p[1],25050,'boundary is exact support-plane midpoint');
for(const a of circles('svm-margin').filter(a=>+a.r===6)){const score=(80* +a.cx+30* +a.cy-25050)/10750;assert(a.fill==='var(--good)'?score<=-1+1e-12:score>=1-1e-12,'all training points clear their own class margin');}
const l2=circles('ridge-vs-lasso').filter(a=>a.fill==='var(--good)')[0],l1=circles('ridge-vs-lasso').filter(a=>a.fill==='var(--good)')[1];
const coef=[(+l2.cx-200)/40,(140- +l2.cy)/40];close(Math.hypot(...coef),1,'L2 tangency is on unit circle');close(coef[0]/coef[1],4,'L2 solution radially projects optimum');
close((+l1.cx-560)/40,1,'L1 first-touch corner');close((140- +l1.cy)/40,0,'L1 second coefficient is zero');
let theta=-2.8;for(const p of circles('gradient-descent-bowl')){close((+p.cx-400)/100,theta,'actual GD iterate');close(+p.cy,190-14*theta*theta,'iterate lies on shown objective');theta*=.6;}
const km=tags('kmeans-steps','rect').slice(-3).map(a=>[(+a.x+6)-570,(+a.y+6)-40]);
assert.deepEqual(km,[[40,50],[130,52.5],[81.25,146.25]],'centroids are means of plotted clusters');
assert(tags('sigmoid-threshold','line').some(a=>+a.x1===70&&+a.x2===720&&+a.y1===103),'0.5 threshold uses probability coordinate mapping');
for(const poly of polys('distribution-shift'))for(const[x,y]of poly)assert(x>=0&&x<=760&&y>=0&&y<=228,'offset addition cannot concatenate coordinates off-canvas');
const yhat=1/(1+Math.exp(.07)),incoming=yhat-1;close(incoming,-0.5174928576663897,'output derivative');close(incoming*-.3,.15524785729991689,'hidden B incoming derivative');assert.match(rendered['backprop-two-layer'],/dL\/da_A=-0.51749; dL\/dz_A=0/);
assert.match(rendered['coverage-vs-width'],/62.5% covered \(5\/8\)/);assert.match(rendered['coverage-vs-width'],/100% covered \(8\/8\)/);
assert.match(rendered['fastapi-serving'],/M245 60V34H80V70/);assert.match(rendered['fastapi-serving'],/cancelling a request may not stop GPU work/);
assert.match(rendered['lru-list'],/M200 96C175 60 150 60 100 94/);assert.match(rendered['lru-list'],/new order C, D, B, A/);
console.log('Numerical diagram fixtures passed: cosine, canary, scale budget, calibration, shared ROC/PR, Gini, SVM, L1/L2 tangency, GD, k-means, sigmoid, distribution offsets and backprop.');
