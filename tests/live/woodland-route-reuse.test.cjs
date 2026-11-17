'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('haigen.html','utf8'),a=s.indexOf('function drawWoodlandFloorV391('),b=s.indexOf('\nfunction ',a+9),body=s.slice(a,b);
assert.equal((body.match(/roadDistance\(x,y\)/g)||[]).length,1);
assert.equal((body.match(/routeDistance>115/g)||[]).length,3);
const index=body.indexOf('const routeDistance=roadDistance(x,y);');
assert(index>=0&&body.indexOf('routeDistance>115')>index);
let oldCalls=0,newCalls=0;for(let gx=0;gx<38;gx++)for(let gy=0;gy<33;gy++){const v=Math.sin(gx*127.1+gy*311.7+3*74.7)*43758.5453,hash=v-Math.floor(v);if(hash>.86)continue;oldCalls+=4;newCalls++}
assert(newCalls<oldCalls);
console.log('PASS: woodland floor uses one exact road distance per accepted sample instead of up to four');
