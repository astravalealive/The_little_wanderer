/* Controlled outdoor depth screenshots, isolated browser and temporary in-memory positions. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const out=path.join(root,'depth-visual-evidence');
fs.mkdirSync(out,{recursive:true});
async function serve(){
 const child=spawn('python3',['-m','http.server','18789','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 for(let i=0;i<70;i++){try{const ok=await new Promise((resolve,reject)=>http.get('http://127.0.0.1:18789/haigen.html',r=>{r.resume();resolve(r.statusCode===200)}).on('error',reject));if(ok)return child}catch{}await new Promise(r=>setTimeout(r,180))}
 child.kill();throw Error('server unavailable');
}
async function run(){
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  for(const device of [{name:'forest',width:1024,height:768},{name:'iphone',width:390,height:844},{name:'ipad',width:1024,height:768}]){
   const context=await browser.newContext({viewport:{width:device.width,height:device.height},hasTouch:true,isMobile:device.name!=='forest',deviceScaleFactor:1});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/haigen.html?qa=depth-269',async route=>{
    const response=await route.fetch();let html=await response.text();
    const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
    assert(html.includes(marker),'QA injection anchor changed');
    const hook=`;window.__depthQA=(kind,obstacle,front)=>{const base=obstacle==='stump'?{x:trollStumpHome.x,y:trollStumpHome.y+24}:objects.find(o=>o.type===obstacle&&o.x>400&&o.x<2600&&o.y>400&&o.y<2500);if(!base)throw Error('Missing obstacle '+obstacle);const x=base.x,y=base.y+(front?75:-75);state.autonomy=false;state.x=x;state.y=y;cam.x=base.x;cam.y=base.y;cameraDetached=true;cameraLastPanAt=performance.now();woodlandDeer.forEach((d,i)=>{d.x=i?100000:x;d.y=i?100000:y;d.homeX=d.x;d.homeY=d.y;d.targetX=d.x;d.targetY=d.y;d.walking=false;d.pause=99999999});companions.forEach((c,i)=>{c.x=kind==='companions'&&i===0?x:100000;c.y=kind==='companions'&&i===0?y:100000;c.target=null});caveTrolls.forEach((t,i)=>{if(kind==='troll'&&i===0){t.room='woods';t.x=x;t.y=y;t.walking=false;t.dir='down'}else if(t.room==='woods'){t.room='habitat'}});if(kind==='deer'||kind==='companions'||kind==='troll') {state.x=100000;state.y=100000;}if(kind==='haigen'){woodlandDeer[0].x=100000;woodlandDeer[0].y=100000;}return {x,y,baseX:base.x,baseY:base.y,kind,obstacle,front}};`;
    html=html.replace(marker,marker+hook);
    await route.fulfill({response,body:html});
   });
   await page.goto('http://127.0.0.1:18789/haigen.html?qa=depth-269',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
   for(const obstacle of ['rock','tree','stump'])for(const kind of ['deer','haigen','companions','troll'])for(const front of [false,true]){
    const result=await page.evaluate(({kind,obstacle,front})=>window.__depthQA(kind,obstacle,front),{kind,obstacle,front});
    assert(Number.isFinite(result.y));
    await page.waitForTimeout(150);
    const name=`${device.name}-${kind}-${obstacle}-${front?'front':'behind'}.png`;
    await page.locator('canvas#game').screenshot({path:path.join(out,name),animations:'disabled'});
    console.log('CAPTURE',name);
   }
   assert.equal(errors.length,0,'browser errors: '+errors.join('; '));
   await context.close();
  }
 }finally{if(browser)await browser.close();server.kill()}
}
run().catch(e=>{console.error('DEPTH VISUAL EVIDENCE FAILED:',e);process.exitCode=1});
