'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('haigen.html','utf8'),start=html.indexOf('function path(){'),end=html.indexOf('\nfunction ellipse(',start),body=html.slice(start,end);
assert(body.includes('ctx.drawImage(paintedTrails,0,0,7800,7800)'));
assert(body.includes('if(cam.x+halfW>0&&cam.x-halfW<3500&&cam.y+halfH>0&&cam.y-halfH<3100)'));
assert(body.includes('drawWoodlandPathEdges();return'));
function cull(cx,cy,w,h){return cx+w/2>0&&cx-w/2<3500&&cy+h/2>0&&cy-h/2<3100}
function intersects(cx,cy,w,h){const left=cx-w/2,right=cx+w/2,top=cy-h/2,bottom=cy+h/2;return Math.max(left,0)<Math.min(right,3500)&&Math.max(top,0)<Math.min(bottom,3100)}
let cases=0;for(let cx=-3000;cx<=8500;cx+=230)for(let cy=-3000;cy<=8000;cy+=220)for(const [w,h] of [[300,250],[1400,900],[4000,2400]]){assert.equal(cull(cx,cy,w,h),intersects(cx,cy,w,h));cases++}
console.log('PASS: painted path glaze culling matches rectangle intersection for '+cases+' camera views');
