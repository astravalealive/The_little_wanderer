/* Read-only, browser-side profiling of the canonical game. No source or save changes. */
'use strict';
const {chromium}=require('playwright-core'),{spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'render-profile-evidence'),port=18766;
fs.mkdirSync(out,{recursive:true});
const views=[{name:'woodland-centre',x:1500,y:1500},{name:'woodland-edge',x:3300,y:1500},{name:'outside-woodland',x:4900,y:4200}];
const sizes=[{name:'iphone-emulated',width:390,height:844},{name:'ipad-emulated',width:1024,height:768}];
const injection=`
window.__renderProfile={samples:{},reset(){this.samples={}},snapshot(){return JSON.parse(JSON.stringify(this.samples))}};
for(const name of ['drawExpandedTerrain','rbDrawGround','drawWoodlandFloorV391','path','draw']){
 const original=eval(name);
 const wrapped=function(...args){const t=performance.now();try{return original.apply(this,args)}finally{
  const entry=window.__renderProfile.samples[name]||(window.__renderProfile.samples[name]={calls:0,totalMs:0,maxMs:0});
  const ms=performance.now()-t;entry.calls++;entry.totalMs+=ms;entry.maxMs=Math.max(entry.maxMs,ms);
 }};
 eval(name+'=wrapped');
}
window.__renderProfileSetView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now()};
`;
async function serve(){const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});for(let i=0;i<60;i++){try{const ok=await new Promise((res,rej)=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();res(r.statusCode===200)}).on('error',rej));if(ok)return child}catch{}await new Promise(r=>setTimeout(r,150))}child.kill();throw Error('server failed')}
const round=n=>Math.round(n*1000)/1000;
async function run(){const server=await serve();let browser;try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const results=[];
 for(const size of sizes){const context=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/haigen.html?qa=render-profile',async route=>{const response=await route.fetch(),html=await response.text(),marker='function frame(now){';assert(html.includes(marker));await route.fulfill({response,body:html.replace(marker,injection+'\n'+marker)})});
 await page.goto('http://127.0.0.1:'+port+'/haigen.html?qa=render-profile',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady===true&&window.__renderProfile,{timeout:30000});
 for(const view of views){
 await page.evaluate(({x,y})=>window.__renderProfileSetView(x,y),view);
 await page.waitForTimeout(400);
 await page.evaluate(()=>{const d=window.__haigenPerfDiag;Object.assign(d,{enabled:true,frames:0,updateMs:0,renderMs:0,frameMs:[],frameGapMs:[],lastFrame:0});window.__renderProfile.reset()});
 await page.waitForTimeout(1400);
 const sample=await page.evaluate(()=>{const d=window.__haigenPerfDiag;return {frames:d.frames,renderMs:d.renderMs,updateMs:d.updateMs,frameWorkMs:d.frameMs,frameGapMs:d.frameGapMs,sections:window.__renderProfile.snapshot()}});
 assert(sample.frames>=8,'insufficient frames');
 const sections=Object.fromEntries(Object.entries(sample.sections).map(([name,v])=>[name,{calls:v.calls,meanMs:round(v.totalMs/v.calls),maxMs:round(v.maxMs),totalMs:round(v.totalMs)}]));
 const record={device:size.name,view:view.name,frames:sample.frames,renderMeanMs:round(sample.renderMs/sample.frames),updateMeanMs:round(sample.updateMs/sample.frames),frameWorkMeanMs:round(sample.frameWorkMs.reduce((a,b)=>a+b,0)/Math.max(1,sample.frameWorkMs.length)),frameGapMeanMs:round(sample.frameGapMs.filter(x=>x>0).reduce((a,b)=>a+b,0)/Math.max(1,sample.frameGapMs.filter(x=>x>0).length)),sections};
 results.push(record);console.log('PROFILE '+JSON.stringify(record));
 }
 assert.equal(errors.length,0,'browser errors: '+errors.join('; '));await context.close();
 }
 fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({environment:'GitHub Actions headless Chrome, mobile viewport emulation; NOT real iOS Safari hardware',warmupMs:400,sampleMs:1400,results},null,2));
 const lines=['# Job 203 rendering profile','', '**Environment:** GitHub Actions headless Chrome, mobile viewport emulation. These are not real iPad/iPhone Safari measurements.','', 'Measurements are observational and noisy. Section timings are nested inside draw; do not sum section totals.','', '| Emulated viewport | Camera | Frames | Render ms/frame | Update ms/frame | Frame work ms | Frame gap ms | Ground ms/call | Floor ms/call | Paths ms/call | Expanded terrain ms/call |','|---|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
 for(const r of results)lines.push('| '+[r.device,r.view,r.frames,r.renderMeanMs,r.updateMeanMs,r.frameWorkMeanMs,r.frameGapMeanMs,r.sections.rbDrawGround?.meanMs??'n/a',r.sections.drawWoodlandFloorV391?.meanMs??'n/a',r.sections.path?.meanMs??'n/a',r.sections.drawExpandedTerrain?.meanMs??'n/a'].join(' | ')+' |');
 lines.push('','## Interpretation','', 'Compare like-for-like camera and viewport rows only. A high section mean identifies a candidate for deeper profiling, not a proven bottleneck on actual iOS devices.','', 'The painted trail image draw and soil glaze are currently measured together as path(); isolate them only in a future observational profile if needed.','', 'No gameplay, art, collisions, save data or deployed code was changed by this benchmark.');
 fs.writeFileSync(path.join(out,'findings.md'),lines.join('\n')+'\n');
 }finally{if(browser)await browser.close();server.kill()}}
run().catch(e=>{console.error('PROFILE FAILED:',e);process.exitCode=1});
