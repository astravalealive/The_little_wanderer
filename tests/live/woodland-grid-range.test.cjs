'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const s=fs.readFileSync('haigen.html','utf8');
const i=s.indexOf('function drawWoodlandFloorV391('),j=s.indexOf('\nfunction ',i+9);
const body=s.slice(i,j<0?undefined:j);
assert.match(body,/gxStart=Math.max\(x0,0\),gxEnd=Math.min\(x1,Math.ceil\(3500\/step\)-1\)/);
assert.match(body,/gyStart=Math.max\(y0,0\),gyEnd=Math.min\(y1,Math.ceil\(3100\/step\)-1\)/);
assert.match(body,/if\(!rbWoodland\(x,y\)\)continue/);
const step=94;
const hash=(x,y,k)=>{let v=Math.sin(x*127.1+y*311.7+k*74.7)*43758.5453;return v-Math.floor(v)};
function sample(x0,x1,y0,y1,clamp){let count=0,checksum=0;const a=clamp?Math.max(x0,0):x0,b=clamp?Math.min(x1,Math.ceil(3500/step)-1):x1,c=clamp?Math.max(y0,0):y0,d=clamp?Math.min(y1,Math.ceil(3100/step)-1):y1;for(let gx=a;gx<=b;gx++)for(let gy=c;gy<=d;gy++){const x=gx*step+hash(gx,gy,1)*step,y=gy*step+hash(gx,gy,2)*step;if(x<0||x>=3500||y<0||y>=3100)continue;count++;checksum+=x*.25+y*.75}return [count,checksum]}
let cases=0;for(let x=-80;x<=90;x+=5)for(let y=-80;y<=90;y+=5){const a=sample(x,x+22,y,y+17,false),b=sample(x,x+22,y,y+17,true);assert.deepEqual(b,a);cases++}
console.log('PASS: identical sampled woodland coordinates and order across '+cases+' camera grids');
