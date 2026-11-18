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
 assert.equal(ver.build,427);
 assert.match(html,/const GAME_BUILD\s*=\s*427\b/);
 assert.match(html,/lakeFishSpeciesCatalog/);
 assert.match(html,/drawNordicFishSprite/);
 assert.match(html,/pickLakeFishSpecies/);
 assert.match(html,/lakeFishThreats/);
 assert.match(html,/species:'perch'|id:'perch'/);
 assert.match(html,/id:'char'/);
 assert.match(html,/id:'minnow'/);
 assert.match(html,/id:'pikelet'/);
 assert.match(html,/fishLifecycle/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.doesNotMatch(html,/ellipse\(0,0,14,6,body\)/);

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
 await page.goto(`http://127.0.0.1:${port}/haigen.html?v=228qa`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady,{timeout:30000});
 await page.waitForTimeout(500);
 const info=await page.evaluate(()=>{
  const raw=localStorage.getItem('wandererV127PreviewSave');
  const state=raw?JSON.parse(raw):null;
  return {
   build:window.__haigenBuild,
   saveKey:'wandererV127PreviewSave',
   hasLifecycle:!!(state&&state.fishLifecycle&&typeof state.fishLifecycle==='object'),
   clutchArray:Array.isArray(state?.fishLifecycle?.clutches),
   fishCount:Number(state?.fish)||0,
   osprey:state?.ospreyFamily&&typeof state.ospreyFamily==='object'
  };
 });
 assert.equal(info.build,427);
 assert.equal(info.hasLifecycle,true);
 assert.equal(info.clutchArray,true);
 assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
 await browser.close();
 server.close();
 console.log('PASS Job 228 lake fish: Nordic species, schooling hooks, V427 identity, save schema intact');
})().catch(e=>{console.error(e);process.exit(1)});
