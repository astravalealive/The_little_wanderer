/* Browser round-trip: legacy V127 loads, dual-writes canonical key, mutations persist, fallbacks untouched. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../..');
const port=8776;
const url='http://127.0.0.1:'+port+'/haigen.html?qa=save-round-trip';

function serve(){
 return new Promise((resolve,reject)=>{
  const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  child.once('error',reject);
  let tries=0;
  const ping=()=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{
   r.resume();
   if(r.statusCode===200)resolve(child);
   else{child.kill();reject(new Error('Local game server did not return HTTP 200'))}
  }).on('error',e=>{
   if(++tries>40){child.kill();reject(e)}else setTimeout(ping,150);
  });
  setTimeout(ping,200);
 });
}

async function ready(page){
 await page.waitForFunction(()=>window.__haigenWorldReady===true&&typeof window.__haigenSaveQA==='function',{timeout:25000});
}

async function run(){
 assert(fs.existsSync(path.join(root,'haigen.html')),'canonical game missing');
 const server=await serve();
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext();
  // Seed before any haigen.html script runs so boot cannot overwrite the fixture.
  await context.addInitScript(()=>{
   if(sessionStorage.getItem('__haigenSaveRoundTripSeeded')==='1')return;
   localStorage.clear();
   const legacy={
    x:1510,y:1490,wood:17,stone:9,campTier:2,raftBuilt:true,skiffLashing:false,
    memories:['QA legacy seed'],discoveries:['Sunpetal'],friends:{heri:40,skolli:20},
    quests:{collect:true,home:true,friend:false},tools:{axe:1,torch:0,shovel:0,pickaxe:0,net:0},
    structures:[{kind:'shelter',x:1530,y:1480}],removed:[],herbs:{},fallen:[],treeHits:{}
   };
   localStorage.setItem('wandererV127PreviewSave',JSON.stringify(legacy));
   localStorage.setItem('wandererTestSave',JSON.stringify({marker:'fallback-must-remain',wood:999}));
   localStorage.setItem('wandererV121PreviewSave',JSON.stringify({marker:'v121-must-remain',wood:888}));
   sessionStorage.setItem('__haigenSaveRoundTripSeeded','1');
  });

  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));

  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await ready(page);
  const afterLoad=await page.evaluate(()=>{
   const qa=window.__haigenSaveQA();
   qa.flush();
   return {keys:qa.keys,state:qa.state(),storage:qa.storage()};
  });
  assert.equal(afterLoad.keys.live,'haigenWorldSave');
  assert.equal(afterLoad.keys.legacyLive,'wandererV127PreviewSave');
  assert.equal(afterLoad.state.wood,17);
  assert.equal(afterLoad.state.saveVersion,1);
  assert.ok(afterLoad.storage.live,'canonical live key must be dual-written after flush');
  assert.ok(afterLoad.storage.legacyLive,'legacy live key must remain populated');
  assert.equal(JSON.parse(afterLoad.storage.live).wood,17);
  assert.equal(JSON.parse(afterLoad.storage.legacyLive).wood,17);
  assert.equal(JSON.parse(afterLoad.storage.live).saveVersion,1);
  assert.equal(JSON.parse(afterLoad.storage.fallbacks.wandererTestSave).marker,'fallback-must-remain');
  assert.equal(JSON.parse(afterLoad.storage.fallbacks.wandererV121PreviewSave).marker,'v121-must-remain');

  await page.evaluate(()=>window.__haigenSaveQA().mutate({wood:42,stone:11}));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await ready(page);
  const afterReload=await page.evaluate(()=>{
   const qa=window.__haigenSaveQA();
   return {state:qa.state(),storage:qa.storage(),keys:qa.keys};
  });
  assert.equal(afterReload.state.wood,42);
  assert.equal(afterReload.state.stone,11);
  assert.equal(afterReload.state.saveVersion,1);
  assert.equal(JSON.parse(afterReload.storage.live).wood,42);
  assert.equal(JSON.parse(afterReload.storage.legacyLive).wood,42);
  assert.equal(JSON.parse(afterReload.storage.fallbacks.wandererTestSave).wood,999);
  assert.equal(JSON.parse(afterReload.storage.fallbacks.wandererV121PreviewSave).wood,888);

  assert.equal(errors.length,0,'uncaught JavaScript errors: '+errors.join('; '));
  await context.close();

  // Fresh profile: when both live keys diverge, canonical must win.
  // Use a new context so pagehide autosave from the prior page cannot rewrite the fixture.
  const preferContext=await browser.newContext();
  await preferContext.addInitScript(()=>{
   localStorage.clear();
   const base={
    x:1510,y:1490,stone:9,campTier:2,raftBuilt:true,skiffLashing:false,saveVersion:1,
    memories:['QA prefer live'],discoveries:[],friends:{heri:40,skolli:20},
    quests:{collect:true,home:true,friend:false},tools:{axe:1,torch:0,shovel:0,pickaxe:0,net:0},
    structures:[],removed:[],herbs:{},fallen:[],treeHits:{}
   };
   localStorage.setItem('haigenWorldSave',JSON.stringify({...base,wood:70}));
   localStorage.setItem('wandererV127PreviewSave',JSON.stringify({...base,wood:1}));
  });
  const preferPage=await preferContext.newPage();
  const preferErrors=[];
  preferPage.on('pageerror',e=>preferErrors.push(e.message));
  await preferPage.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await ready(preferPage);
  const preferLive=await preferPage.evaluate(()=>window.__haigenSaveQA().state());
  assert.equal(preferLive.wood,70,'canonical haigenWorldSave must win dual-read');
  assert.equal(preferErrors.length,0,'uncaught JavaScript errors: '+preferErrors.join('; '));
  await preferContext.close();

  console.log('PASS save-round-trip: legacy load, dual-write, mutate/reload, fallbacks preserved');
 }finally{
  if(browser)await browser.close();
  server.kill();
 }
}
run().catch(e=>{console.error('SAVE ROUND-TRIP FAILED:',e);process.exitCode=1});
