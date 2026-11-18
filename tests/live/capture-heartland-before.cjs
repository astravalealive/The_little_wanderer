'use strict';
/** One-shot baseline captures against a provided haigen.html (usually main). */
const assert=require('node:assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright-core');

(async()=>{
 const root=path.join(__dirname,'../..');
 const htmlPath=process.argv[2]||path.join(root,'haigen.html');
 const outDir=process.argv[3]||path.join(root,'docs/visual-transition-plan/job233-heartland/before');
 fs.mkdirSync(outDir,{recursive:true});
 const html=fs.readFileSync(htmlPath,'utf8');
 const server=http.createServer((req,res)=>{
  let rel=decodeURIComponent((req.url||'/').split('?')[0]);
  if(rel==='/'||rel==='/haigen.html'){res.writeHead(200,{'Content-Type':'text/html'});res.end(html);return}
  const file=path.join(root,rel.replace(/^\//,''));
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return}
  res.writeHead(200);fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const shots=[
  ['homestead-iphone',{width:390,height:844},{x:1530,y:1655}],
  ['forest-edge-iphone',{width:390,height:844},{x:1180,y:1380}],
  ['lake-approach-iphone',{width:390,height:844},{x:980,y:1680}],
  ['homestead-ipad-landscape',{width:1024,height:768},{x:1530,y:1655}],
  ['lake-approach-ipad-landscape',{width:1024,height:768},{x:980,y:1680}]
 ];
 for(const [label,viewport,cam] of shots){
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.route('**/haigen.html**',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert.ok(body.includes(marker));
   body=body.replace(marker,marker+';window.__heartlandQAView=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();return {x:cam.x,y:cam.y}};');
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=before`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  await page.evaluate(({x,y})=>window.__heartlandQAView(x,y),cam);
  await page.waitForTimeout(450);
  await page.locator('canvas#game').screenshot({path:path.join(outDir,label+'.png'),animations:'disabled'});
  await page.close();
  console.log('BEFORE '+label);
 }
 await browser.close();server.close();
 console.log('PASS before captures → '+outDir);
})().catch(e=>{console.error(e);process.exit(1)});
