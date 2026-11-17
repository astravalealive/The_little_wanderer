/* Read-only browser checks for canonical haigen.html. Never tests a preview or production URL. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../..');
const port=8765;
const url='http://127.0.0.1:'+port+'/haigen.html?qa=live-regression';
function serve(){
 return new Promise((resolve,reject)=>{
  const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  child.once('error',reject);
  let tries=0;
  const ping=()=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();resolve(child)}).on('error',e=>{
   if(++tries>35){child.kill();reject(e)}else setTimeout(ping,150);
  });
  setTimeout(ping,200);
 });
}
async function run(){
 assert(fs.existsSync(path.join(root,'haigen.html')),'canonical game missing');
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  for(const vp of [{name:'iphone',width:390,height:844,isMobile:true,hasTouch:true},{name:'ipad',width:1024,height:768,isMobile:true,hasTouch:true}]){
   const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:2});
   const page=await context.newPage(),errors=[],failedAssets=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&/\.(png|webp|svg|jpg|jpeg)(\?|$)/i.test(r.url()))failedAssets.push(r.url()+' '+r.status())});
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:25000});
   await page.waitForTimeout(750);
   const initial=await page.evaluate(()=>({
    canvas:!!document.querySelector('canvas#game')?.getContext('2d'),
    errorVisible:getComputedStyle(document.getElementById('worldError')).display!=='none',
    joystick:!!document.getElementById('joy'),
    menu:!!document.querySelector('.mobile-menu'),
    assetReport:typeof window.__haigenAssetReport==='function'
   }));
   assert(initial.canvas&&initial.joystick,'missing live-game canvas/controls');
   assert(!initial.errorVisible,'startup error visible');
   // Touch interface: tap only a non-destructive menu control.
   const menu=page.locator('.mobile-menu > summary');
   if(await menu.count()){
    await menu.tap();
    assert(await page.locator('.mobile-menu').evaluate(e=>e.open),'mobile menu did not open');
    await menu.tap();
   }
   // The joystick is touched briefly without moving the character.
   const joy=page.locator('#joy');const box=await joy.boundingBox();
   if(box){await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2)}
   assert.equal(errors.length,0,'uncaught JavaScript errors: '+errors.join('; '));
   assert.equal(failedAssets.length,0,'HTTP asset errors: '+failedAssets.join('; '));
   if(initial.assetReport){
    const report=await page.evaluate(()=>window.__haigenAssetReport());
    if(Array.isArray(report))assert.equal(report.length,0,'asset report contains failures');
    else if(report&&Array.isArray(report.failed))assert.equal(report.failed.length,0,'asset report contains failures');
   }
   // Save compatibility: isolated browser profile, synthetic QA-only storage key.
   // Do not overwrite unknown production save keys or fabricate save schemas.
   const key='__haigen_regression_sentinel__';
   await page.evaluate(k=>localStorage.setItem(k,'qa-preserved'),key);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:25000});
   assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'qa-preserved','storage lost after reload');
   assert.equal(await page.locator('#worldError').evaluate(e=>getComputedStyle(e).display),'none','reload startup failed');
   // Observational only: check the running game remains error-free after reload.
   await page.waitForTimeout(500);
   assert.equal(errors.length,0,'JavaScript error after reload: '+errors.join('; '));
   console.log('PASS '+vp.name+' startup, mobile controls, assets, isolated storage, reload');
   await context.close();
  }
 }finally{if(browser)await browser.close();server.kill()}
}
run().catch(e=>{console.error('LIVE REGRESSION FAILED:',e);process.exitCode=1});
