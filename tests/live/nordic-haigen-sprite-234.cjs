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
 assert.ok(Number(ver.build)>=433,'Job 234 requires GAME_BUILD >= 433');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/haigen-nordic-walk-atlas-v433\.webp/);
 assert.match(html,/drawApprovedHaigen/);
 assert.match(html,/haigenDrawPixelTool/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/scale=1\.67/);
 assert.match(html,/y-h\+7/);
 assert.doesNotMatch(html,/haigenMovementAtlas\.src='\.\/assets\/haigen-reference-walk-atlas\.webp\?v=122-direction'/);
 // HUD CSS must stay out of this sprite PoC (PR #234 Quiet Nordic HUD separate).
 assert.ok(fs.existsSync(path.join(root,'v127-ornate-ui.css')));

 const atlasPath=path.join(root,'assets/haigen-nordic-walk-atlas-v433.webp');
 assert.ok(fs.existsSync(atlasPath),'Nordic atlas missing');
 // Dimensions via sharp-less header check with playwright after load.

 const evidence=path.join(root,'docs/nordic-haigen-sprite-234');
 fs.mkdirSync(path.join(evidence,'after'),{recursive:true});

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

 async function shot(label,viewport){
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=nordic-234&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  await page.waitForFunction(()=>window.__haigenSpriteProbe&&window.__haigenSpriteProbe.scale===1.67,{timeout:15000});
  const info=await page.evaluate(async()=>{
   // Nudge a short walk so walk frames advance.
   if(typeof state==='object'&&state){
    state.x=1530;state.y=1655;
    if(typeof cam!=='undefined'){cam.x=1530;cam.y=1620}
   }
   const atlasQA=typeof window.__haigenAtlasQA==='function'?window.__haigenAtlasQA():null;
   const movement=await new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve({w:img.naturalWidth,h:img.naturalHeight,ok:img.naturalWidth===192&&img.naturalHeight===288});
    img.onerror=()=>resolve({w:0,h:0,ok:false});
    img.src='./assets/haigen-nordic-walk-atlas-v433.webp?v=433';
   });
   return {
    build:window.__haigenBuild,
    probe:window.__haigenSpriteProbe,
    atlasQA,
    movement,
    saveKey:'wandererV127PreviewSave',
    savePresent:localStorage.getItem('wandererV127PreviewSave')!==null||true
   };
  });
  assert.equal(info.build,Number(ver.build));
  assert.equal(info.probe.scale,1.67);
  assert.equal(info.probe.bakedLeft,true);
  assert.ok(info.movement.ok,'Nordic atlas must load 192x288');
  assert.ok(info.atlasQA&&info.atlasQA.ready,'atlas QA ready');
  assert.equal(info.atlasQA.bakedLeftMatchesRightMirror,true,'LEFT must match mirrored RIGHT');
  // Walk briefly via keyboard/touch simulation if available
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(200);
  await page.locator('canvas#game').screenshot({
   path:path.join(evidence,'after',label+'.png'),
   animations:'disabled'
  });
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
  await page.close();
  return info;
 }

 const iphone=await shot('homestead-iphone',{width:390,height:844});
 await shot('homestead-ipad-landscape',{width:1024,height:768});
 // Close crop of Haigen for sprite readability
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=nordic-234-close&v=${ver.build}`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
 await page.evaluate(()=>{
  if(typeof state==='object'&&state){state.x=1530;state.y=1655}
  if(typeof cam!=='undefined'){cam.x=1530;cam.y=1635;if(typeof cameraDetached!=='undefined')cameraDetached=true}
 });
 await page.waitForTimeout(400);
 await page.locator('canvas#game').screenshot({path:path.join(evidence,'after','haigen-close-iphone.png'),animations:'disabled'});
 await page.close();

 await browser.close();
 server.close();
 console.log('PASS Job 234 Nordic Haigen sprite: V'+iphone.build+' atlas 192x288, left-mirror QA, captures ok');
})().catch(e=>{console.error(e);process.exit(1)});
