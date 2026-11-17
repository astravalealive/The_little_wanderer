'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const s=fs.readFileSync('haigen.html','utf8');
const start=s.indexOf('function rbDrawGround(){'),end=s.indexOf('function rbTreeImage(',start);
assert(start>=0&&end>start);
const ground=s.slice(start,end);
assert.match(ground,/const xWobble=\[\]/);
assert.match(ground,/const fade=transition\*transition\*\(3-2\*transition\)/);
assert.match(ground,/ctx\.fillRect\(x,y,cell,cell\)/);
function old(l,t,r,b){let sum=0;const cell=6;for(let y=Math.floor(t/cell)*cell;y<b;y+=cell)for(let x=Math.floor(l/cell)*cell;x<r;x+=cell){const cx=x+cell*.5,cy=y+cell*.5;const wobble=90*Math.sin(cy/245)+40*Math.sin(cy/91+cx/310)+24*Math.sin(cx/133+cy/170);const wobbleY=80*Math.sin(cx/280)+32*Math.sin(cx/107+cy/270);sum+=wobble+wobbleY;}return sum}
function improved(l,t,r,b){let sum=0;const cell=6,firstX=Math.floor(l/cell)*cell,firstY=Math.floor(t/cell)*cell,xWobble=[];for(let x=firstX;x<r;x+=cell){const cx=x+cell*.5;xWobble.push(80*Math.sin(cx/280))}for(let y=firstY;y<b;y+=cell){const cy=y+cell*.5,yWobble=90*Math.sin(cy/245);for(let x=firstX;x<r;x+=cell){const cx=x+cell*.5;const wobble=yWobble+40*Math.sin(cy/91+cx/310)+24*Math.sin(cx/133+cy/170);const wobbleY=xWobble[(x-firstX)/cell]+32*Math.sin(cx/107+cy/270);sum+=wobble+wobbleY}}return sum}
for(const rect of [[0,0,600,600],[128,320,1200,1300],[-180,-180,500,500],[3000,1500,3750,2400]])assert.equal(old(...rect),improved(...rect),'math must be exactly equivalent');
function time(fn){const samples=[];for(let i=0;i<7;i++){const t=performance.now();for(let j=0;j<3;j++)fn(300,300,1800,1500);samples.push(performance.now()-t)}return samples.sort((a,b)=>a-b)[3]}
old(300,300,1800,1500);improved(300,300,1800,1500);
const baseline=time(old),optimized=time(improved);
console.log(JSON.stringify({baseline_ms:baseline,optimized_ms:optimized,speedup:baseline/optimized}));
assert(optimized<baseline*1.1,'optimized math should not regress >10% on benchmark');
console.log('PASS: exact arithmetic equivalence and woodland edge math microbenchmark');
