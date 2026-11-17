'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('haigen.html','utf8');
const start=html.indexOf('function drawWoodlandFloorV391('),end=html.indexOf('\nfunction ',start+9);
const body=html.slice(start,end<0?undefined:end);
assert(body.includes('if((x1+1)*step<=0||x0*step>=3500||(y1+1)*step<=0||y0*step>=3100)return;'));
assert(body.includes('if(!rbWoodland(x,y))continue;'));
const step=94;
function oldSamples(x0,x1,y0,y1){let n=0;for(let gx=x0;gx<=x1;gx++)for(let gy=y0;gy<=y1;gy++){const x=gx*step+step*.5,y=gy*step+step*.5;if(x>=0&&x<3500&&y>=0&&y<3100)n++}return n}
function culled(x0,x1,y0,y1){if((x1+1)*step<=0||x0*step>=3500||(y1+1)*step<=0||y0*step>=3100)return 0;return oldSamples(x0,x1,y0,y1)}
for(let x=-100;x<=100;x+=5)for(let y=-100;y<=100;y+=5){const a=oldSamples(x,x+20,y,y+15),b=culled(x,x+20,y,y+15);assert.equal(a,b,'viewport cull must not discard woodland samples')}
const outside=[-90,-70,80,100],count=oldSamples(outside[0],outside[1],outside[2],outside[3]);
assert.equal(count,0);assert.equal(culled(...outside),0);
console.log('PASS: viewport culling preserves all woodland sample opportunities across 1681 camera windows');
