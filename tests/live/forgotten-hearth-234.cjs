'use strict';
const assert=require('node:assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright-core');

(async()=>{
 const root=path.join(__dirname,'../..');
 const html=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
 const ver=JSON.parse(fs.readFileSync(path.join(root,'haigen-version.json'),'utf8'));
 assert.equal(Number(ver.build),433,'Job 234 Forgotten Hearth requires build 433');
 assert.match(html,/const GAME_BUILD\s*=\s*433\b/);
 assert.match(html,/Job 234 Forgotten Hearth/);
 assert.match(html,/forgottenHearthEnabled/);
 assert.match(html,/forgottenHearthFlagOn/);
 assert.match(html,/drawForgottenHearthGround/);
 assert.match(html,/updateForgottenHearthGate/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/worldLayout:3000/);
 assert.doesNotMatch(html,/worldLayout:3001/);
 assert.doesNotMatch(html,/worldLayout!==3001/);
 // Flag must default OFF in source (no hardcoded true assignment).
 assert.match(html,/const forgottenHearthEnabled=forgottenHearthFlagOn\(\)/);

 const evidenceDir=path.join(root,'docs/visual-transition-plan/job234-forgotten-hearth');
 fs.mkdirSync(path.join(evidenceDir,'before'),{recursive:true});
 fs.mkdirSync(path.join(evidenceDir,'after'),{recursive:true});

 const server=http.createServer((req,res)=>{
  let rel=decodeURIComponent((req.url||'/').split('?')[0]);
  if(rel==='/')rel='/haigen.html';
  const file=path.join(root,rel.replace(/^\//,''));
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return}
  res.writeHead(200);fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});

 const qaHook=`function worldZoom(){return baseCameraScale()*cameraZoom}`;
 const qaInject=qaHook+`;
window.__hearthQAView=(x,y,night)=>{
 cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();
 if(typeof state==="object"&&state){
  state.autonomy=false;
  state.x=x;state.y=y+36;
  if(night){state.daytime=Math.floor(state.daytime/180)*180+130}
  else{state.daytime=Math.floor(state.daytime/180)*180+20}
 }
 for(const c of companions||[]){c.x=state.x+(c.kind==='fox'?42:-48);c.y=state.y+28;c.mode='called';c.t=8000;c.target={x:state.x,y:state.y}}
 if(typeof draw==='function')draw();
 const place=inForgottenHearth(state.x,state.y)?forgottenHearth.name:(expandedRegion(state.x,state.y)?.name||'Haigen\u2019s Woodlands');
 return {x:cam.x,y:cam.y,build:GAME_BUILD,flag:!!window.__forgottenHearthEnabled,region:place,inside:inForgottenHearth(state.x,state.y)};
};
window.__hearthCrossGate=async()=>{
 const H=forgottenHearth;
 const outside={x:H.gate.x,y:H.gate.y+55};
 const inside={x:H.cabin.x,y:H.cabin.y+110};
 const place=(p)=>{state.x=p.x;state.y=p.y;cam.x=p.x;cam.y=p.y;for(const c of companions){c.x=p.x+(c.kind==='fox'?36:-40);c.y=p.y+24;c.mode='called';c.t=8000;c.target={x:p.x,y:p.y}}};
 place(outside);hearthGateWasInside=false;hearthGateCooldown=0;hearthGateFade=0;
 updateForgottenHearthGate(16);
 place(inside);updateForgottenHearthGate(16);
 const afterIn={
  inside:inForgottenHearth(state.x,state.y),
  fade:hearthGateFade,
  companions:companions.map(c=>({kind:c.kind,x:c.x,y:c.y,in:inForgottenHearth(c.x,c.y)}))
 };
 place(outside);updateForgottenHearthGate(16);
 const afterOut={
  inside:inForgottenHearth(state.x,state.y),
  fade:hearthGateFade,
  companions:companions.map(c=>({kind:c.kind,x:c.x,y:c.y,in:inForgottenHearth(c.x,c.y)}))
 };
 return {afterIn,afterOut,flag:forgottenHearthEnabled,saveKey:'wandererV127PreviewSave',worldLayout:state.worldLayout};
};
window.__hearthPerfSample=(ms)=>{
 const t0=performance.now();let frames=0;const start=performance.now();
 while(performance.now()-start<ms){draw();frames++}
 const elapsed=performance.now()-t0;
 return {frames,elapsed,msPerFrame:elapsed/Math.max(1,frames),build:GAME_BUILD};
};
window.__hearthSaveProbe=()=>{
 const data=JSON.parse(JSON.stringify(state));
 try{localStorage.setItem('wandererV127PreviewSave',JSON.stringify(data))}catch(e){}
 const loaded=JSON.parse(localStorage.getItem('wandererV127PreviewSave'));
 return {
  worldLayout:loaded.worldLayout,
  hasHearthKey:Object.keys(loaded).some(k=>/hearth/i.test(k)),
  x:loaded.x,y:loaded.y
 };
};
`;

 async function openPage(hearthOn){
  const page=await browser.newPage({
   viewport:{width:390,height:844},
   deviceScaleFactor:2,
   isMobile:true,
   hasTouch:true
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html**',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   assert.ok(body.includes(qaHook),'camera hook missing');
   body=body.replace(qaHook,qaInject);
   await route.fulfill({response,body,headers:{...response.headers(),'content-type':'text/html'}});
  });
  const q=hearthOn?'hearth=1&':'';
  await page.goto(`http://127.0.0.1:${port}/haigen.html?${q}qa=hearth-234&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:45000});
  await page.waitForTimeout(300);
  return {page,errors};
 }

 async function capture(page,dir,label,viewport,cam,night){
  await page.setViewportSize(viewport);
  await page.waitForTimeout(80);
  const info=await page.evaluate(({x,y,night})=>window.__hearthQAView(x,y,night),{...cam,night:!!night});
  await page.waitForTimeout(450);
  await page.locator('canvas#game').screenshot({
   path:path.join(evidenceDir,dir,label+'.png'),
   animations:'disabled'
  });
  return info;
 }

 // --- BEFORE (flag off) ---
 {
  const {page,errors}=await openPage(false);
  const flag=await page.evaluate(()=>!!window.__forgottenHearthEnabled);
  assert.equal(flag,false,'flag must default OFF without ?hearth=1');
  await capture(page,'before','gate-approach-iphone',{width:390,height:844},{x:1180,y:1160});
  await capture(page,'before','hearth-centre-iphone',{width:390,height:844},{x:1200,y:940});
  await capture(page,'before','gate-approach-ipad-landscape',{width:1024,height:768},{x:1180,y:1160});
  await capture(page,'before','hearth-centre-ipad-landscape',{width:1024,height:768},{x:1200,y:940});
  assert.ok(!errors.length,'before page errors '+JSON.stringify(errors));
  await page.close();
 }

 // --- AFTER (flag on) ---
 {
  const {page,errors}=await openPage(true);
  const flag=await page.evaluate(()=>!!window.__forgottenHearthEnabled);
  assert.equal(flag,true,'?hearth=1 must enable Forgotten Hearth');

  const cross=await page.evaluate(()=>window.__hearthCrossGate());
  assert.equal(cross.worldLayout,3000,'no worldLayout bump');
  assert.equal(cross.saveKey,'wandererV127PreviewSave');
  assert.equal(cross.afterIn.inside,true,'enter Hearth');
  assert.ok(cross.afterIn.fade>0,'fade on enter');
  assert.equal(cross.afterOut.inside,false,'exit Hearth');
  assert.ok(cross.afterOut.fade>0,'fade on exit');
  assert.equal(cross.afterIn.companions.length,2,'Dylan + Skölli present');
  assert.ok(cross.afterIn.companions.every(c=>c.in),'companions inside after enter');
  assert.ok(cross.afterOut.companions.every(c=>!c.in),'companions outside after exit');

  await capture(page,'after','gate-approach-iphone',{width:390,height:844},{x:1180,y:1160});
  const centre=await capture(page,'after','hearth-centre-iphone',{width:390,height:844},{x:1200,y:940});
  assert.equal(centre.inside,true,'camera centre must be inside Forgotten Hearth AABB');
  assert.match(String(centre.region),/Forgotten Hearth/);
  await capture(page,'after','hearth-night-iphone',{width:390,height:844},{x:1200,y:940},true);
  await capture(page,'after','gate-approach-ipad-landscape',{width:1024,height:768},{x:1180,y:1160});
  await capture(page,'after','hearth-centre-ipad-landscape',{width:1024,height:768},{x:1200,y:940});

  // Perf: Hearth centre should not exceed woodland centre by >25% on same runner.
  await page.evaluate(()=>window.__hearthQAView(1500,1500,false));
  await page.waitForTimeout(200);
  const wood=await page.evaluate(()=>window.__hearthPerfSample(700));
  await page.evaluate(()=>window.__hearthQAView(220,240,false));
  await page.waitForTimeout(200);
  const hearth=await page.evaluate(()=>window.__hearthPerfSample(700));
  assert.ok(hearth.msPerFrame<=wood.msPerFrame*1.25,
   'Hearth render '+hearth.msPerFrame.toFixed(2)+'ms exceeds woodland '+wood.msPerFrame.toFixed(2)+'ms by >25%');

  // Save regression: state snapshot must not invent hearth schema keys or bump worldLayout.
  const saveProbe=await page.evaluate(()=>window.__hearthSaveProbe());
  assert.equal(saveProbe.worldLayout,3000);
  assert.equal(saveProbe.hasHearthKey,false,'must not write hearth-specific save keys');

  assert.ok(!errors.length,'after page errors '+JSON.stringify(errors));
  await page.close();
  console.log('PASS Job 234 Forgotten Hearth: V'+ver.build+
   ' gate+companions+perf wood='+wood.msPerFrame.toFixed(1)+
   'ms hearth='+hearth.msPerFrame.toFixed(1)+'ms');
 }

 await browser.close();
 server.close();
})().catch(e=>{console.error(e);process.exit(1)});
