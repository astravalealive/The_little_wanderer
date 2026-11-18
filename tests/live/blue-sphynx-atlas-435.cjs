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
 assert.ok(Number(ver.build)>=435,'Job Blue requires GAME_BUILD >= 435');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/blue-sphynx-atlas-v435\.webp/);
 assert.match(html,/drawApprovedBlue/);
 assert.match(html,/kind:'sphynx'/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/window\.__blueQAPlace/);
 assert.match(html,/if\(fox\)\{/);
 assert.ok(fs.existsSync(path.join(root,'assets/blue-sphynx-atlas-v435.webp')));
 assert.ok(fs.existsSync(path.join(root,'docs/blue-sphynx-atlas/atlas-preview-4x.png')));
 assert.ok(fs.existsSync(path.join(root,'.github/scripts/build_blue_sphynx_atlas.py')));

 const evidence=path.join(root,'docs/blue-sphynx-atlas');
 fs.mkdirSync(path.join(evidence,'after'),{recursive:true});
 fs.mkdirSync(path.join(evidence,'before'),{recursive:true});

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

 async function openPage(viewport){
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=blue-435&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  await page.waitForFunction(()=>window.__v435BlueReady===true,{timeout:15000});
  return {page,errors};
 }

 // Before: homestead without Blue on screen (parked far away)
 {
  const {page,errors}=await openPage({width:390,height:844});
  await page.evaluate(()=>{
   const info=window.__blueQAPlace({dir:'down',moving:false});
   const list=window.__haigenCompanions;
   const blue=list.find(c=>c.kind==='sphynx');
   if(blue){blue.x=info.blue?-9999:-9999;blue.y=-9999}
   // __blueQAPlace returns after place; re-hide Blue
   list.find(c=>c.kind==='sphynx').x=-9999;
   list.find(c=>c.kind==='sphynx').y=-9999;
  });
  await page.waitForTimeout(250);
  await page.locator('canvas#game').screenshot({
   path:path.join(evidence,'before','homestead-iphone.png'),
   animations:'disabled'
  });
  assert.ok(!errors.length,'before page errors '+JSON.stringify(errors));
  await page.close();
 }

 async function shot(label,viewport,opts){
  const {page,errors}=await openPage(viewport);
  const info=await page.evaluate(async(o)=>{
   const placed=window.__blueQAPlace(o);
   const atlas=await new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve({w:img.naturalWidth,h:img.naturalHeight,ok:img.naturalWidth===384&&img.naturalHeight===320});
    img.onerror=()=>resolve({w:0,h:0,ok:false});
    img.src='./assets/blue-sphynx-atlas-v435.webp?v=435';
   });
   return {...placed,atlas,build:window.__haigenBuild,blueReady:!!window.__v435BlueReady};
  },opts||{dir:'down',moving:true});
  assert.equal(info.build,Number(ver.build));
  assert.equal(info.blueReady,true);
  assert.ok(info.atlas.ok,'Blue atlas must load 384x320');
  assert.deepEqual(info.kinds,['rabbit','fox','sphynx']);
  assert.ok(info.friends&&('blue' in info.friends),'friends.blue must exist for save safety');
  if(opts&&opts.dir==='right'){
   await page.keyboard.down('ArrowRight');
   await page.waitForTimeout(700);
   await page.keyboard.up('ArrowRight');
  }else{
   await page.waitForTimeout(400);
  }
  await page.locator('canvas#game').screenshot({
   path:path.join(evidence,'after',label+'.png'),
   animations:'disabled'
  });
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));
  await page.close();
  return info;
 }

 await shot('homestead-iphone',{width:390,height:844},{dir:'down',moving:true});
 await shot('homestead-iphone-walk-right',{width:390,height:844},{dir:'right',moving:true});
 await shot('homestead-ipad-landscape',{width:1024,height:768},{dir:'down',moving:true});

 const {page,errors}=await openPage({width:390,height:844});
 await page.evaluate(()=>window.__blueQAPlace({dir:'down',moving:false,close:true}));
 await page.waitForTimeout(300);
 await page.locator('canvas#game').screenshot({
  path:path.join(evidence,'after','blue-close-iphone.png'),
  animations:'disabled'
 });
 assert.ok(!errors.length,'close page errors '+JSON.stringify(errors));
 await page.close();

 await browser.close();
 server.close();
 // Copy evidence into artifacts when that path exists (Cloud Agent); skip on CI runners.
 const artifactDir='/opt/cursor/artifacts';
 if(fs.existsSync(path.dirname(artifactDir))){
  fs.mkdirSync(artifactDir,{recursive:true});
  for(const f of ['homestead-iphone.png','homestead-iphone-walk-right.png','homestead-ipad-landscape.png','blue-close-iphone.png']){
   const src=path.join(evidence,'after',f);
   if(fs.existsSync(src))fs.copyFileSync(src,path.join(artifactDir,'blue-'+f));
  }
  fs.copyFileSync(path.join(evidence,'atlas-preview-4x.png'),path.join(artifactDir,'blue_atlas_preview_4x.png'));
 }
 console.log('PASS blue-sphynx-atlas-435');
})().catch(err=>{console.error(err);process.exit(1)});
