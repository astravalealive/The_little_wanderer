/* Capture homestead / lake / island mobile screenshots for presentation review.
   Uses an isolated temporary QA save key. Never touches production saves. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const label=process.argv[2]==='after'?'after':'before';
const out=path.join(root,'docs','mobile-presentation-v426',label);
fs.mkdirSync(out,{recursive:true});
const port=18767;
const views=[
 {name:'homestead',x:1530,y:1655,speech:true},
 {name:'great-lake-shore',x:850,y:1500,speech:false},
 {name:'lake-island',x:-540,y:1010,speech:false}
];
async function serve(){
 const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 for(let i=0;i<60;i++){
  try{
   const ok=await new Promise((res,rej)=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();res(r.statusCode===200)}).on('error',rej));
   if(ok)return child;
  }catch{}
  await new Promise(r=>setTimeout(r,150));
 }
 child.kill();throw Error('local server unavailable');
}
async function run(){
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({
   viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html?qa=mobile-presentation-capture',async route=>{
   const response=await route.fetch();
   let html=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert(html.includes(marker),'camera hook missing');
   html=html.replace(marker,marker+';window.__mobileQAView=(x,y,opts)=>{state.x=x;state.y=y;autoBubble="";autoBubbleTimer=0;const lift=(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming())?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0;cam.x=x;cam.y=y-lift;cameraDetached=false;look.x=0;look.y=0;if(opts&&opts.speech){state.autonomy=true;autoBubble=opts.speech;autoBubbleTimer=8000;}else{state.autonomy=false;}return {x:state.x,y:state.y,zoom:worldZoom()};};');
   await route.fulfill({response,body:html});
  });
  await page.goto('http://127.0.0.1:'+port+'/haigen.html?qa=mobile-presentation-capture',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  await page.waitForTimeout(900);
  for(const view of views){
   await page.evaluate(({x,y,speech})=>window.__mobileQAView(x,y,speech?{speech:'The homestead feels peaceful today.'}:null),view);
   await page.waitForTimeout(400);
   await page.screenshot({path:path.join(out,view.name+'-iphone.png'),fullPage:false,animations:'disabled'});
   console.log('CAPTURE '+label+' '+view.name);
  }
  assert.equal(errors.length,0,'browser errors: '+errors.join('; '));
  await context.close();
 }finally{if(browser)await browser.close();server.kill()}
}
run().catch(e=>{console.error('CAPTURE FAILED:',e);process.exitCode=1});
