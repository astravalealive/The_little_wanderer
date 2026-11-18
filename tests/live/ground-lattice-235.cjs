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
 assert.ok(Number(ver.build)>=434,'Job 235 requires GAME_BUILD >= 434');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/islandResolution=256/);
 assert.match(html,/const cell=8/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/Job 235/);

 const evidence=path.join(root,'docs/ground-lattice-235');
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

 async function shot(label,viewport,cam){
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html**',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert.ok(body.includes(marker));
   body=body.replace(marker,marker+';window.__groundQAView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();return {x:cam.x,y:cam.y,build:GAME_BUILD,res:islandResolution,cell:8}};');
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=ground-235&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  const info=await page.evaluate(({x,y})=>window.__groundQAView(x,y),cam);
  assert.equal(info.build,Number(ver.build));
  assert.equal(info.res,256);
  await page.waitForTimeout(600);
  await page.locator('canvas#game').screenshot({path:path.join(evidence,'after',label+'.png'),animations:'disabled'});
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
  await page.close();
  return info;
 }

 const a=await shot('homestead-iphone',{width:390,height:844},{x:1530,y:1655});
 await shot('homestead-ipad-landscape',{width:1024,height:768},{x:1530,y:1655});
 await shot('forest-edge-iphone',{width:390,height:844},{x:1180,y:1380});
 await browser.close();server.close();
 console.log('PASS Job 235 ground lattice: V'+a.build+' res=256 cell=8 captures ok');
})().catch(e=>{console.error(e);process.exit(1)});
