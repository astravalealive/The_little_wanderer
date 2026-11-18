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
 assert.ok(Number(ver.build)>=432,'Job 233 Heartland Readability requires GAME_BUILD >= 432');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/Job 233 Heartland Readability/);
 assert.match(html,/heartlandR\s*=\s*450/);
 assert.match(html,/cottage → Silent Pond/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/campProtectionRadius/);
 assert.match(html,/homesteadStyle/);
 assert.match(html,/drawHomesteadStyleLock/);
 assert.doesNotMatch(html,/GAME_BUILD\s*=\s*429\b/);

 const evidenceDir=path.join(root,'docs/visual-transition-plan/job233-heartland');
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

 async function capture(label,viewport,cam){
  const page=await browser.newPage({
   viewport,
   deviceScaleFactor:2,
   isMobile:true,
   hasTouch:true
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html**',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert.ok(body.includes(marker),'camera hook missing');
   body=body.replace(marker,marker+`;window.__heartlandQAView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();if(typeof state==="object"&&state){state.x=x;state.y=y+40}return {x:cam.x,y:cam.y,build:GAME_BUILD}};window.__heartlandStats=()=>{const c={x:1500,y:1500};const near=objects.filter(o=>["rock","bush","flower","mushroom"].includes(o.type)&&Math.hypot(o.x-c.x,o.y-c.y)<450);const onPath=near.filter(o=>roadDistance(o.x,o.y)<70);return {nearCount:near.length,onPathCount:onPath.length,build:GAME_BUILD,saveKey:"wandererV127PreviewSave"};};`);
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=heartland-233&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  const info=await page.evaluate(({x,y})=>window.__heartlandQAView(x,y),cam);
  assert.equal(info.build,Number(ver.build));
  await page.waitForTimeout(500);
  const props=await page.evaluate(()=>window.__heartlandStats());
  assert.equal(props.saveKey,'wandererV127PreviewSave');
  assert.ok(props.nearCount<220,'heartland clutter should be thinned, got '+props.nearCount);
  assert.ok(props.onPathCount<=props.nearCount,'path corridor count must be valid');
  await page.locator('canvas#game').screenshot({
   path:path.join(evidenceDir,'after',label+'.png'),
   animations:'disabled'
  });
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
  await page.close();
  return props;
 }

 const homestead=await capture('homestead-iphone',{width:390,height:844},{x:1530,y:1655});
 await capture('forest-edge-iphone',{width:390,height:844},{x:1180,y:1380});
 await capture('lake-approach-iphone',{width:390,height:844},{x:980,y:1680});
 await capture('homestead-ipad-landscape',{width:1024,height:768},{x:1530,y:1655});
 await capture('lake-approach-ipad-landscape',{width:1024,height:768},{x:980,y:1680});

 await browser.close();
 server.close();
 console.log('PASS Job 233 Heartland Readability: V'+homestead.build+' packing+captures ok near='+homestead.nearCount);
})().catch(e=>{console.error(e);process.exit(1)});
