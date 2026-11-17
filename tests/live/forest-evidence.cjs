/* Forest visual evidence: isolated browser, fixed camera viewpoints, no game/source edits. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const out=path.join(root,'forest-visual-evidence');
fs.mkdirSync(out,{recursive:true});
const views=[{name:'woodland-centre',x:1500,y:1500},{name:'woodland-west',x:700,y:1400},{name:'woodland-edge',x:3300,y:1500}];
async function serve(){
 const child=spawn('python3',['-m','http.server','18765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 let ready=false;
 for(let i=0;i<50;i++){
  try{const code=await new Promise((resolve,reject)=>http.get('http://127.0.0.1:18765/haigen.html',r=>{r.resume();resolve(r.statusCode)}).on('error',reject));if(code===200){ready=true;break}}catch{}
  await new Promise(r=>setTimeout(r,200));
 }
 if(!ready){child.kill();throw Error('local server unavailable')}
 return child;
}
async function run(){
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1024,height:768},deviceScaleFactor:1,hasTouch:true,isMobile:true});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Inject a camera probe into the browser response only; repository source stays untouched.
  await page.route('**/haigen.html?qa=forest-evidence',async route=>{
   const response=await route.fetch();
   const html=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert(html.includes(marker),'camera hook insertion point changed');
   const patched=html.replace(marker,marker+';window.__forestQAView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();return {x:cam.x,y:cam.y}};');
   await route.fulfill({response,body:patched});
  });
  await page.goto('http://127.0.0.1:18765/haigen.html?qa=forest-evidence',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  for(const view of views){
   const result=await page.evaluate(({x,y})=>window.__forestQAView(x,y),view);
   assert.equal(result.x,view.x);assert.equal(result.y,view.y);
   await page.waitForTimeout(180);
   await page.locator('canvas#game').screenshot({path:path.join(out,view.name+'.png'),animations:'disabled'});
   console.log('CAPTURE '+view.name+' '+view.x+','+view.y);
  }
  assert.equal(errors.length,0,'browser errors: '+errors.join('; '));
  await context.close();
 }finally{if(browser)await browser.close();server.kill()}
}
run().catch(e=>{console.error('FOREST EVIDENCE FAILED:',e);process.exitCode=1});
