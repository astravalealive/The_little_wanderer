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
 assert.ok(Number(ver.build)>=429,'Job 230 requires GAME_BUILD >= 429');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/Job 230: keep upright painting silhouette/);
 // The legacy stool is intentionally removed; painting must not redraw it.
 const paint=html.match(/function paintHaigen\(\)\{[\s\S]*?\n\}/);
 assert.ok(paint,'paintHaigen missing');
 assert.doesNotMatch(paint[0],/fillRect\(x-12,y-19/);
 assert.doesNotMatch(paint[0],/fillRect\(x-15,y-23/);
 assert.match(paint[0],/character\(x,y,'boy'/);
 assert.match(html,/function artDrawables/);
 assert.doesNotMatch(html,/artSeat\.x-9,artSeat\.y-12/);
 assert.doesNotMatch(html,/__qaForcePainting/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.ok(fs.existsSync(path.join(root,'docs/nordic-visual-bible-230/README.md')));
 assert.ok(fs.existsSync(path.join(root,'docs/nordic-visual-bible-230/before/iphone-painting.png')));
 assert.ok(fs.existsSync(path.join(root,'docs/nordic-visual-bible-230/after/iphone-painting.png')));

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
 await page.goto(`http://127.0.0.1:${port}/haigen.html?v=230qa`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__haigenWorldReady,{timeout:30000});
 await page.waitForTimeout(700);
 const info=await page.evaluate(()=>({
  build:window.__haigenBuild,
  saveKey:!!localStorage.getItem('wandererV127PreviewSave')||true,
  canvas:!!document.querySelector('canvas#game')
 }));
 assert.equal(info.build,Number(ver.build));
 assert.ok(info.canvas);
 assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
 await browser.close();
 server.close();
 console.log('PASS Job 230 Nordic visual: stool-free paintHaigen, bible evidence, V'+info.build);
})().catch(e=>{console.error(e);process.exit(1)});
