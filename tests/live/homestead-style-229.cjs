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
 assert.equal(ver.build,428);
 assert.match(html,/const GAME_BUILD\s*=\s*428\b/);
 assert.match(html,/drawHomesteadStyleLock/);
 assert.match(html,/nearHomestead/);
 assert.match(html,/nordicContactShadow/);
 assert.match(html,/homesteadStyle/);
 assert.match(html,/haigen-reference-walk-atlas|drawApprovedHaigen/);
 assert.match(html,/drawApprovedDylan/);
 assert.match(html,/drawApprovedSkolli/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/campProtectionRadius/);

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
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}/haigen.html?v=229qa`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady,{timeout:30000});
 await page.waitForTimeout(700);
 const info=await page.evaluate(()=>{
  const raw=localStorage.getItem('wandererV127PreviewSave');
  const state=raw?JSON.parse(raw):null;
  return {
   build:window.__haigenBuild,
   x:state?.x,y:state?.y,
   dylan:window.__v125DylanStatus?.()?.loaded,
   skolli:window.__v126SkolliStatus?.()?.loaded
  };
 });
 assert.equal(info.build,428);
 assert.ok(info.dylan,'Dylan atlas must remain loaded');
 assert.ok(info.skolli,'Skölli atlas must remain loaded');
 assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
 await page.screenshot({path:path.join(root,'tests/live/homestead-style-229-evidence.png')}).catch(()=>{});
 await browser.close();
 server.close();
 console.log('PASS Job 229 homestead style: V428 identity, approved companions, save key intact');
})().catch(e=>{console.error(e);process.exit(1)});
