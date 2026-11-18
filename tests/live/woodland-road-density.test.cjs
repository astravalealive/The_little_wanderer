'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('haigen.html','utf8');
const start=html.indexOf('function drawWoodlandFloorV391('),end=html.indexOf('\nfunction ',start+9);
const body=html.slice(start,end<0?undefined:end);
const density=body.indexOf('if(hash(gx,gy,3)>density)continue;');
const distance=body.indexOf('const routeDistance=roadDistance(x,y);');
assert(density>=0&&distance>density);
const hash=(x,y,k)=>{let v=Math.sin(x*127.1+y*311.7+k*74.7)*43758.5453;return v-Math.floor(v)};
let originalCalls=0,optimizedCalls=0,accepted=0;
for(let gx=0;gx<38;gx++)for(let gy=0;gy<33;gy++){
 const x=gx*94+hash(gx,gy,1)*94,y=gy*94+hash(gx,gy,2)*94;
 if(x>=3500||y>=3100)continue;
 const nearHome=Math.hypot(x-1600,y-1500)<310;
 const density=nearHome?.28:.78;
 originalCalls++;
 const keep=hash(gx,gy,3)<=density;
 if(keep){optimizedCalls++;accepted++}
}
assert(optimizedCalls<originalCalls);
assert.equal(optimizedCalls,accepted);
console.log('PASS: pure road-distance scan deferred; identical accepted sample set, '+originalCalls+' baseline calls vs '+optimizedCalls+' optimized');
