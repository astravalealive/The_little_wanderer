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
 assert.ok(Number(ver.build)>=436,'Living companions requires GAME_BUILD >= 436');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/travelCompanion/);
 assert.match(html,/companionDialog/);
 assert.match(html,/inviteCompanion/);
 assert.match(html,/livingCampRoutine/);
 assert.match(html,/isTravelingCompanion/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(html,/blue-sphynx-atlas-v435\.webp/);
 assert.match(html,/Come with me/);

 const evidence=path.join(root,'docs/living-companions-436');
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

 async function open(viewport){
  const page=await browser.newPage({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=living-436&v=${ver.build}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
  await page.waitForFunction(()=>typeof window.__livingCompanionsStatus==='function',{timeout:10000});
  return {page,errors};
 }

 const {page,errors}=await open({width:390,height:844});
 const info=await page.evaluate(()=>{
  // Invite Blue, send Dylan/Skölli home, open dialog path via API
  const list=window.__haigenCompanions;
  const blue=list.find(c=>c.kind==='sphynx');
  const dylan=list.find(c=>c.kind==='rabbit');
  window.inviteCompanion(blue);
  const afterInvite=window.__livingCompanionsStatus();
  window.sendCompanionHome(blue,true);
  window.travelAlone();
  window.inviteCompanion(dylan);
  const afterDylan=window.__livingCompanionsStatus();
  // inviteCompanion/save already persisted travelCompanion
  const raw=localStorage.getItem('wandererV127PreviewSave');
  const saved=raw?JSON.parse(raw):null;
  // Dialog smoke
  window.companionDialog(blue);
  const dialogOpen=document.getElementById('overlay').classList.contains('open');
  const hasCome=!!document.getElementById('compCome');
  document.getElementById('compCancel')?.click();
  return {
   build:window.__haigenBuild,
   afterInvite,
   afterDylan,
   savedTravel:saved&&saved.travelCompanion,
   savedTrust:saved&&saved.companionTrust,
   savedCamp:saved&&saved.campHome,
   dialogOpen,hasCome,
   saveKey:'wandererV127PreviewSave'
  };
 });
 assert.equal(info.build,Number(ver.build));
 assert.equal(info.afterInvite.travel,'blue');
 assert.equal(info.afterDylan.travel,'dylan');
 assert.equal(info.savedTravel,'dylan');
 assert.ok(info.savedTrust&&'blue' in info.savedTrust);
 assert.ok(info.savedCamp&&info.savedCamp.dylan);
 assert.equal(info.dialogOpen,true);
 assert.equal(info.hasCome,true);
 assert.ok(!errors.length,'page errors '+JSON.stringify(errors));

 await page.evaluate(()=>window.__livingQAScene({who:'dylan'}));
 await page.waitForTimeout(400);
 await page.locator('canvas#game').screenshot({path:path.join(evidence,'after','travel-dylan-iphone.png'),animations:'disabled'});

 await page.evaluate(()=>window.__livingQAScene({who:'blue',dialog:true}));
 await page.waitForTimeout(200);
 await page.screenshot({path:path.join(evidence,'after','invite-dialog-iphone.png')});
 await page.evaluate(()=>document.getElementById('compCancel')?.click());

 await page.close();

 const pad=await open({width:1024,height:768});
 await pad.page.evaluate(()=>window.__livingQAScene({who:'blue',dir:'right',moving:true,ipad:true}));
 await pad.page.waitForTimeout(500);
 await pad.page.locator('canvas#game').screenshot({path:path.join(evidence,'after','travel-blue-ipad-landscape.png'),animations:'disabled'});
 assert.ok(!pad.errors.length,'ipad errors '+JSON.stringify(pad.errors));
 await pad.page.close();

 await browser.close();
 server.close();
 const artifactDir='/opt/cursor/artifacts';
 if(fs.existsSync(path.dirname(artifactDir))){
  fs.mkdirSync(artifactDir,{recursive:true});
  for(const f of fs.readdirSync(path.join(evidence,'after'))){
   fs.copyFileSync(path.join(evidence,'after',f),path.join(artifactDir,'living-'+f));
  }
 }
 console.log('PASS living-companions-436');
})().catch(err=>{console.error(err);process.exit(1)});
