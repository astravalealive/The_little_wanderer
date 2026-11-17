'use strict';
const {chromium}=require('playwright-core'),{spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),port=18768,out=path.join(root,'woodland-cache-204-extended');
fs.mkdirSync(out,{recursive:true});
const devices=[{name:'iphone-emulated',width:390,height:844},{name:'ipad-emulated',width:1024,height:768}];
async function serve(){const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});for(let i=0;i<70;i++){try{const ok=await new Promise((res,rej)=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();res(r.statusCode===200)}).on('error',rej));if(ok)return child}catch{}await new Promise(r=>setTimeout(r,150))}child.kill();throw Error('server unavailable')}
const injection=`
window.__cache204Extended=async function(){
 const cache=window.__woodlandCache204,orig={x:cam.x,y:cam.y,zoom:cameraZoom,enabled:cache.enabled};
 const maxBytes=cache.maxTiles*cache.tileCells*cache.tileCells*8;
 const cases=[
  {name:'centre-day',x:1500,y:1500,zoom:1,night:0},
  {name:'west-edge',x:50,y:1400,zoom:1,night:0},
  {name:'east-edge',x:3490,y:1500,zoom:1,night:0},
  {name:'north-edge',x:1500,y:30,zoom:1,night:0},
  {name:'south-edge',x:1500,y:3070,zoom:1,night:0},
  {name:'centre-zoom-in',x:1500,y:1500,zoom:1.35,night:0},
  {name:'centre-zoom-out',x:1500,y:1500,zoom:.75,night:0},
  {name:'centre-night',x:1500,y:1500,zoom:1,night:1},
  {name:'edge-night',x:3300,y:1500,zoom:1,night:1},
  {name:'outside',x:4900,y:4200,zoom:1,night:0}
 ];
 const oldNight=nightStrength;
 let nightValue=0;
 nightStrength=()=>nightValue;
 const render=(enabled,readPixels)=>{
  cache.enabled=enabled;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
  const z=worldZoom();ctx.translate(cv.width/2,cv.height/2);ctx.scale(z,z);ctx.translate(-cam.x,-cam.y);
  const t=performance.now();rbDrawGround();const ms=performance.now()-t;ctx.restore();
  return {ms,pixels:readPixels?ctx.getImageData(0,0,cv.width,cv.height).data.slice():null};
 };
 const results=[],round=n=>Math.round(n*1000)/1000;
 try{
  for(const item of cases){
   cam.x=item.x;cam.y=item.y;cameraZoom=item.zoom;nightValue=item.night;
   cache.clear();
   const baseline=render(false,true),cold=render(true,true),warm=render(true,true);
   let coldDiff=0,warmDiff=0;
   for(let i=0;i<baseline.pixels.length;i++){
    if(baseline.pixels[i]!==cold.pixels[i])coldDiff++;
    if(baseline.pixels[i]!==warm.pixels[i])warmDiff++;
   }
   const stats=cache.stats();
   if(stats.bytes>maxBytes)throw Error('memory limit exceeded '+item.name);
   if(coldDiff||warmDiff)throw Error('pixel mismatch '+item.name+' cold='+coldDiff+' warm='+warmDiff);
   results.push({name:item.name,coldDiff,warmDiff,baselineMs:round(baseline.ms),coldMs:round(cold.ms),warmMs:round(warm.ms),bytes:stats.bytes,hits:stats.hits,misses:stats.misses});
  }
  // Long traversal across a broad camera grid, intentionally churning the LRU.
  const walk=[];let maxObservedBytes=0,evictions=0,lastKeys='';
  cache.clear();
  for(let n=0;n<90;n++){
   cam.x=-100+n*57;cam.y=400+(n%13)*210;cameraZoom=n%3===0?.8:n%3===1?1:1.3;nightValue=n%2;
   render(true,false);
   const stats=cache.stats();maxObservedBytes=Math.max(maxObservedBytes,stats.bytes);
   if(stats.tiles>cache.maxTiles||stats.bytes>maxBytes)throw Error('LRU bound exceeded at step '+n);
   if(n%15===0)walk.push({step:n,tiles:stats.tiles,bytes:stats.bytes,hits:stats.hits,misses:stats.misses});
   const keys=[...cache.tiles.keys()].join('|');if(lastKeys&&keys!==lastKeys)evictions++;lastKeys=keys;
  }
  // Recheck pixel equivalence after eviction and revisiting previously cached areas.
  cam.x=1500;cam.y=1500;cameraZoom=1;nightValue=1;
  const after=render(false,true),cached=render(true,true);let revisitDiff=0;
  for(let i=0;i<after.pixels.length;i++)if(after.pixels[i]!==cached.pixels[i])revisitDiff++;
  if(revisitDiff)throw Error('pixel mismatch after churn '+revisitDiff);
  // Repeated draws, using median to reduce noise; order alternates to reduce drift.
  const perf=[];for(const item of [cases[0],cases[2],cases[7]]){
   cam.x=item.x;cam.y=item.y;cameraZoom=item.zoom;nightValue=item.night;cache.clear();render(true,false);
   const a=[],b=[];
   for(let i=0;i<12;i++){if(i%2){b.push(render(true,false).ms);a.push(render(false,false).ms)}
    else{a.push(render(false,false).ms);b.push(render(true,false).ms)}}
   const median=x=>{const v=[...x].sort((p,q)=>p-q);return (v[5]+v[6])/2};
   perf.push({name:item.name,uncachedMedianMs:round(median(a)),warmMedianMs:round(median(b)),samples:12});
  }
  return {results,walk,maxObservedBytes,evictions,revisitDiff,perf,limitBytes:maxBytes};
 }finally{nightStrength=oldNight;cam.x=orig.x;cam.y=orig.y;cameraZoom=orig.zoom;cache.enabled=orig.enabled;cache.clear()}
};
`;
async function run(){const server=await serve();let browser;try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const all=[];
 for(const vp of devices){const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/haigen.html?qa=cache-204-extended',async route=>{const response=await route.fetch(),html=await response.text(),marker='function frame(now){';assert(html.includes(marker));await route.fulfill({response,body:html.replace(marker,injection+'\n'+marker)})});
 await page.goto('http://127.0.0.1:'+port+'/haigen.html?qa=cache-204-extended',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady===true&&window.__cache204Extended,{timeout:30000});
 const result=await page.evaluate(()=>window.__cache204Extended());
 assert.equal(result.results.length,10);assert.equal(result.revisitDiff,0);
 assert(result.maxObservedBytes<=result.limitBytes);assert.equal(errors.length,0,'page errors: '+errors.join('; '));
 all.push({device:vp.name,...result});console.log('EXTENDED204 '+JSON.stringify({device:vp.name,pixelCases:result.results.length,maxBytes:result.maxObservedBytes,evictions:result.evictions,perf:result.perf}));
 await context.close();
 }
 fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({environment:'Headless Chrome mobile emulation, not physical iOS Safari',all},null,2));
 const lines=['# Job 204 extended validation','','**Environment:** headless Chrome with mobile viewport emulation, not real iOS Safari.','', 'All ten isolated ground-render scenarios per device compare original, cold and warm cache pixels. Night strength is overridden only in this isolated QA browser; production source and save data are untouched.','', '| Device | Pixel cases | Pixel differences | Max observed cache KiB | Typed-array limit KiB | Median baseline / warm cache (ms) |','|---|---:|---:|---:|---:|---|'];
 for(const r of all)lines.push('| '+r.device+' | '+r.results.length+' | '+r.results.reduce((n,v)=>n+v.coldDiff+v.warmDiff,0)+' | '+(r.maxObservedBytes/1024).toFixed(0)+' | '+(r.limitBytes/1024).toFixed(0)+' | '+r.perf.map(p=>p.name+': '+p.uncachedMedianMs+'/'+p.warmMedianMs).join('; ')+' |');
 lines.push('','The 90-step traversal exercises camera movement, zoom and alternating night strength. A revisit after traversal is pixel-compared to detect stale or incorrect cached cells.','', '**Limitations:** isolated ground pass only; no full-scene pixel equivalence; timing and memory are Chrome-only; typed-array bytes exclude JS object overhead; the short benchmark does not establish sustained iOS performance.','');
 fs.writeFileSync(path.join(out,'findings.md'),lines.join('\n'));
 }finally{if(browser)await browser.close();server.kill()}}
run().catch(e=>{console.error('EXTENDED 204 FAILED:',e);process.exitCode=1});
