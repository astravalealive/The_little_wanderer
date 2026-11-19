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
 assert.ok(Number(ver.build)>=434,'Job 236 requires GAME_BUILD >= 434');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/Job 236 World Readability/);
 assert.match(html,/no floating system-ui plot titles/);
 assert.match(html,/nordicContactShadow\(artCart\.x/);
 assert.match(html,/nordicContactShadow\(h\.x,h\.y\+11/);
 assert.doesNotMatch(html,/fillText\('Build your shelter'/);
 assert.doesNotMatch(html,/p\.name\+' · Build'/);
 assert.doesNotMatch(html,/Kitchen Garden · Lv/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/homesteadStyle/);

 const evidenceDir=path.join(root,'docs/job236-world-readability');
 fs.mkdirSync(path.join(evidenceDir,'after'),{recursive:true});
 assert.ok(fs.existsSync(path.join(evidenceDir,'before/homestead-iphone.png')));

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
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html**',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert.ok(body.includes(marker),'camera hook missing');
   body=body.replace(marker,marker+`;window.__job236QAView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();if(typeof state==="object"&&state){state.x=x;state.y=y+40};return {x:cam.x,y:cam.y,build:GAME_BUILD}};`);
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=job236&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  const info=await page.evaluate(({x,y})=>window.__job236QAView(x,y),cam);
  assert.equal(info.build,Number(ver.build));
  await page.waitForTimeout(500);
  await page.locator('canvas#game').screenshot({
   path:path.join(evidenceDir,'after',label+'.png'),
   animations:'disabled'
  });
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
  await page.close();
 }

 await capture('homestead-iphone',{width:390,height:844},{x:1530,y:1655});
 await capture('plots-iphone',{width:390,height:844},{x:1625,y:1200});
 await capture('homestead-ipad-landscape',{width:1024,height:768},{x:1530,y:1655});

 await browser.close();
 server.close();
 console.log('PASS Job 236 World Readability V'+ver.build+' evidence+contracts');
})().catch(e=>{console.error(e);process.exit(1)});
