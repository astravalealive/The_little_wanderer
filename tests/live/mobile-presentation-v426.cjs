/* V426 mobile presentation regression: quieter HUD, speech, framing, coords, controls. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../..');
const out=path.join(root,'tests','live','mobile-presentation-evidence');
fs.mkdirSync(out,{recursive:true});
const port=18768;
const url='http://127.0.0.1:'+port+'/haigen.html?qa=mobile-presentation-v426';
function serve(){
 return new Promise((resolve,reject)=>{
  const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  child.once('error',reject);
  let tries=0;
  const ping=()=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();if(r.statusCode===200)resolve(child);else{child.kill();reject(new Error('bad status'))}}).on('error',e=>{
   if(++tries>40){child.kill();reject(e)}else setTimeout(ping,150);
  });
  setTimeout(ping,200);
 });
}
async function openPage(browser,vp){
 const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const page=await context.newPage();
 const errors=[],failedAssets=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&/\.(png|webp|svg|jpg|jpeg|css|js)(\?|$)/i.test(r.url()))failedAssets.push(r.url()+' '+r.status())});
 await page.route('**/haigen.html?qa=mobile-presentation-v426*',async route=>{
  const response=await route.fetch();
  let html=await response.text();
  const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
  assert(html.includes(marker),'camera hook missing');
  html=html.replace(marker,marker+';window.__mobileQAView=(x,y,opts)=>{state.x=x;state.y=y;cam.x=x;cam.y=y-(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming()?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0);cameraDetached=false;look.x=0;look.y=0;autoBubbleTimer=0;autoBubble="";if(opts&&opts.speech){state.autonomy=true;autoBubble=opts.speech;autoBubbleTimer=9000;}else{state.autonomy=false;}return {x:state.x,y:state.y,camY:cam.y,zoom:worldZoom(),speechVisible:!!(opts&&opts.speech)};};window.__mobileQAFraming=()=>({portrait:typeof presentationPortraitFraming==="function"&&presentationPortraitFraming(),zoom:worldZoom(),base:baseCameraScale(),w:W,h:H});');
  await route.fulfill({response,body:html});
 });
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
 await page.waitForTimeout(700);
 return {context,page,errors,failedAssets};
}
async function run(){
 assert(fs.existsSync(path.join(root,'haigen.html')));
 const version=JSON.parse(fs.readFileSync(path.join(root,'haigen-version.json'),'utf8'));
 assert.ok(Number(version.build)>=426,'haigen-version.json must be at least V426 for this suite');
 const expectedBuild=Number(version.build);
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  for(const vp of [{name:'iphone',width:390,height:844},{name:'ipad',width:1024,height:768},{name:'ipad-portrait',width:768,height:1024}]){
   const {context,page,errors,failedAssets}=await openPage(browser,vp);
   // Coordinates hidden in normal play.
   const coords=await page.evaluate(()=>{
    const el=document.getElementById('coordinateReadout');
    const style=el?getComputedStyle(el):null;
    return {exists:!!el,display:style?.display,hidden:!!el?.hidden,api:window.__haigenCoordsVisible?.()};
   });
   assert.equal(coords.api,false,'coords API should default off');
   assert.equal(coords.display,'none','coordinate readout must be hidden in normal play');

   // Opt-in diagnostics restores coordinates.
   await page.evaluate(()=>window.__haigenSetCoordsVisible(true));
   const coordsOn=await page.evaluate(()=>{
    const el=document.getElementById('coordinateReadout');
    return {display:getComputedStyle(el).display,api:window.__haigenCoordsVisible(),diag:document.body.classList.contains('haigen-diagnostics')};
   });
   assert.equal(coordsOn.api,true);
   assert.equal(coordsOn.diag,true);
   assert.notEqual(coordsOn.display,'none','coordinate readout visible after opt-in');
   await page.evaluate(()=>window.__haigenSetCoordsVisible(false));

   // Speech anchors near Haigen without covering his screen centre.
   await page.evaluate(()=>window.__mobileQAView(1530,1655,{speech:'The homestead feels peaceful today.'}));
   await page.waitForTimeout(250);
   const speech=await page.evaluate(()=>{
    const el=document.getElementById('haigenSpeech');
    const r=el.getBoundingClientRect();
    const zoom=window.__gloamPort?.snapshot?.().worldZoom||1;
    const snap=window.__gloamPort.snapshot();
    const px=(snap.x-snap.cameraX)*snap.worldZoom+snap.width/2;
    const py=(snap.y-snap.cameraY)*snap.worldZoom+snap.height/2;
    return {
     visible:getComputedStyle(el).visibility!=='hidden'&&el.textContent.includes('homestead'),
     left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
     px,py,coversPlayer:r.left<px&&r.right>px&&r.top<py&&r.bottom>py+10
    };
   });
   assert(speech.visible,'speech bubble should show for autonomy dialogue');
   assert(!speech.coversPlayer,'speech must not cover Haigen\'s body centre');
   assert(speech.top>70,'speech stays below the top HUD band');
   assert(speech.bottom<vp.height-120,'speech stays above bottom controls');

   // Toast and speech both respect adventure menu.
   await page.locator('#v127Gear').tap();
   await page.waitForTimeout(120);
   assert(await page.locator('#v127Settings').evaluate(e=>e.classList.contains('open')),'adventure menu opens');
   const muted=await page.evaluate(()=>{
    const speech=getComputedStyle(document.getElementById('haigenSpeech')).visibility;
    return {speech,settings:document.getElementById('v127Settings').classList.contains('open')};
   });
   assert.equal(muted.speech,'hidden','speech suppressed while menu open');
   await page.locator('#v127CloseSettings').tap();

   // Touch targets remain reachable.
   for(const sel of ['#joy','#interactBtn','#useBtn','.hotbar','.v127-utility[data-action="packBtn"]','#v127Gear','.v127-mini']){
    const box=await page.locator(sel).first().boundingBox();
    assert(box&&box.width>=30&&box.height>=30,sel+' missing touch target');
   }
   // Minimap zoom still works.
   await page.locator('#v127ZoomIn').tap();
   await page.locator('#v127ZoomOut').tap();

   // Portrait framing boost on phones only.
   if(vp.name==='iphone'){
    const framing=await page.evaluate(()=>window.__mobileQAFraming());
    assert.equal(framing.portrait,true,'iphone should use portrait framing');
    assert(framing.base>0.5,'portrait base scale present');
   }

   await page.screenshot({path:path.join(out,vp.name+'-homestead.png'),animations:'disabled'});
   assert.equal(errors.length,0,'JS errors on '+vp.name+': '+errors.join('; '));
   assert.equal(failedAssets.length,0,'asset errors on '+vp.name+': '+failedAssets.join('; '));
   console.log('PASS '+vp.name+' mobile presentation');
   await context.close();
  }

  // Static contract checks for presentation hooks.
  const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
  assert.match(source,/presentationPortraitFraming/);
  assert.match(source,/__haigenSetCoordsVisible/);
  assert.match(source,/viewport-fit=cover/);
  assert.match(source,new RegExp('const GAME_BUILD='+expectedBuild+'\\b'));
  const css=fs.readFileSync(path.join(root,'v127-ornate-ui.css'),'utf8');
  assert.match(css,/quiet mobile presentation/);
  const ui=fs.readFileSync(path.join(root,'v127-ornate-ui.js'),'utf8');
  assert.match(ui,/v127ToggleCoords/);
  console.log('PASS static presentation contracts');
 }finally{if(browser)await browser.close();server.kill()}
}
run().catch(e=>{console.error('MOBILE PRESENTATION FAILED:',e);process.exitCode=1});
