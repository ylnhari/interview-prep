// Geometry/readability regression for lesson 8.2; browser pixels are separate QA.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),window={};
vm.runInNewContext(fs.readFileSync('engine/viz-lib.js','utf8'),{window});
const diagram=window.VIZLIB['load-balancer-replicas']('readability');
assert.match(diagram,/viewBox="0 0 640 346"/);
const sizes=[...diagram.matchAll(/<text[^>]*font-size="([0-9.]+)"/g)].map(m=>+m[1]);
assert(sizes.length>5);assert(sizes.every(s=>s>=14),'labels are readable at native canvas width');
for(const rect of diagram.matchAll(/<rect\b([^>]+)>/g)){const attrs=Object.fromEntries([...rect[1].matchAll(/([\w-]+)="([^"]+)"/g)].map(m=>[m[1],m[2]]));assert(+attrs.x>=0);assert(+attrs.x + +attrs.width<=640,'replica/status boxes fit inside the viewBox');}
assert.match(diagram,/Not ready: no new traffic/);assert.match(diagram,/Shutdown separately drains in-flight work/);
const shell=fs.readFileSync('engine/shell.html','utf8'),start=shell.indexOf('  function prepareDiagram(');let depth=0,end;
for(let i=shell.indexOf('{',start);i<shell.length;i++){if(shell[i]==='{')depth++;if(shell[i]==='}'&&--depth===0){end=i+1;break;}}
const svg={style:{},getAttribute:()=> '0 0 640 346',querySelectorAll:()=>sizes.map(s=>({getAttribute:()=>String(s)}))};
const container={attrs:{},setAttribute(k,v){this.attrs[k]=v;},querySelectorAll:()=>[svg],insertBefore(n){this.hint=n;}};
const prepare=new Function('publicCourse','txt','return ('+shell.slice(start,end)+')')(true,(tag,cls,text)=>({tag,cls,text}));prepare(container,'Request path');
assert.equal(svg.style.minWidth,'640px','fits the desktop reading column without a forced 1064px canvas');
assert.equal(container.tabIndex,0,'keyboard users can focus the scroll region');assert.equal(container.attrs.role,'region');assert.match(container.hint.text,/Scroll this diagram horizontally/);
assert.match(shell,/\.cviz \{[^}]*overflow(?:-x)?:\s*auto/);
console.log('8.2 diagram: 640px bounded geometry, >=14px labels and keyboard-accessible narrow-screen scrolling passed.');
