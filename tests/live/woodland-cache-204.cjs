'use strict';
const {chromium}=require('playwright-core'),{spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),port=18767,out=path.join(root,'woodland-cache-204-evidence');
fs.mkdirSync(out,{recursive:true});
async function serve(){const p=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});for(let i=0;i<60;i++){try{const ok=await new Promise((resolve,reject)=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();resolve(r.statusCode===200)}).on('error',reject));if(ok)return p}catch{}await new Promise(r=>setTimeout(r,150))}p.kill();throw Error('server failed')}
async function run(){const server=await serve();let browser;try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const rows=[];
 for(const vp of [{name:'iphone-emulated',width:390,height:844},{name:'ipad-emulated',width:1024,height:768}]){
 const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/haigen.html?qa=cache-204',async route=>{const response=await route.fetch(),html=await response.text(),marker='function frame(now){';assert(html.includes(marker));await route.fulfill({response,body:html.replace(marker,'window.__cache204Probe=async(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;const cache=window.__woodlandCache204;const z=worldZoom();const render=(enabled)=>{cache.enabled=enabled;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.translate(cv.width/2,cv.height/2);ctx.scale(z,z);ctx.translate(-cam.x,-cam.y);const t=performance.now();rbDrawGround();const elapsed=performance.now()-t;ctx.restore();return {elapsed,pixels:ctx.getImageData(0,0,cv.width,cv.height).data.slice()}};cache.clear();const original=render(false);const cold=render(true);const warm=render(true);let differing=0,maxDelta=0;for(let i=0;i<original.pixels.length;i++){const delta=Math.abs(original.pixels[i]-warm.pixels[i]);if(delta){differing++;maxDelta=Math.max(maxDelta,delta)}}return {differing,maxDelta,baselineMs:original.elapsed,coldMs:cold.elapsed,warmMs:warm.elapsed,cache:cache.stats(),pixels:original.pixels.length}};\n'+marker)})});
 await page.goto('http://127.0.0.1:'+port+'/haigen.html?qa=cache-204',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__haigenWorldReady&&window.__cache204Probe,{timeout:30000});
 for(const view of [{name:'centre',x:1500,y:1500},{name:'edge',x:3300,y:1500},{name:'outside',x:4900,y:4200}]){
 const result=await page.evaluate(v=>window.__cache204Probe(v.x,v.y),view);
 assert.equal(result.differing,0,'cache changed rendered pixels: '+vp.name+' '+view.name);
 assert(result.cache.bytes<=64*64*64*8,'cache exceeds memory cap');
 rows.push({device:vp.name,view:view.name,...result});console.log('CACHE204 '+JSON.stringify(rows[rows.length-1]));
 }
 assert.equal(errors.length,0,'browser errors: '+errors.join('; '));await context.close();
 }
 fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({environment:'headless Chrome with mobile emulation; NOT physical iOS Safari',rows},null,2));
 const lines=['# Job 204 cache prototype measurements','','Opt-in via `?woodlandCache204=1`; default rendering remains unchanged. Cache stores deterministic Float64 alpha values, not resampled textures.','', '**Environment:** headless Chrome mobile viewport emulation, not physical iOS Safari. Short single-draw timings are noisy.','', '| Device | View | Differing pixel channels | Uncached ms | Cold-cache ms | Warm-cache ms | Cache KiB |','|---|---|---:|---:|---:|---:|---:|'];
 for(const r of rows)lines.push('| '+[r.device,r.view,r.differing,r.baselineMs.toFixed(2),r.coldMs.toFixed(2),r.warmMs.toFixed(2),(r.cache.bytes/1024).toFixed(0)].join(' | ')+' |');
 lines.push('','## Limitations','', 'Pixel comparison uses a synchronous isolated woodland ground render at the same camera coordinates; it does not prove whole-scene equivalence or iOS GPU performance.','', 'The cache is limited to 64 tiles × 64 × 64 Float64 values = 2 MiB of typed-array payload, excluding JavaScript object overhead.','', 'A final performance decision requires longer repeat samples and real iPad Safari testing.','');
 fs.writeFileSync(path.join(out,'findings.md'),lines.join('\n'));
 }finally{if(browser)await browser.close();server.kill()}}
run().catch(e=>{console.error('CACHE 204 FAILED:',e);process.exitCode=1});
