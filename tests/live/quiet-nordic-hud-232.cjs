'use strict';
const assert=require('node:assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright-core');

(async()=>{
 const root=path.join(__dirname,'../..');
 const html=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
 const css=fs.readFileSync(path.join(root,'v127-ornate-ui.css'),'utf8');
 const ver=JSON.parse(fs.readFileSync(path.join(root,'haigen-version.json'),'utf8'));
 assert.ok(Number(ver.build)>=430,'Job 232 requires GAME_BUILD >= 430');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/quietHudObstacleBoxes/);
 assert.match(html,/haigen-toast-live/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(css,/Job 232: Quiet Nordic HUD/);
 assert.match(css,/quiet mobile presentation/);
 assert.ok(fs.existsSync(path.join(root,'docs/quiet-nordic-hud-232/README.md')));
 assert.ok(fs.existsSync(path.join(root,'docs/quiet-nordic-hud-232/before/iphone-overlap.png')));
 assert.ok(fs.existsSync(path.join(root,'docs/quiet-nordic-hud-232/after/iphone-overlap.png')));

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

 async function runViewport(vp){
  const page=await browser.newPage({viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html?qa=quiet-hud-232*',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert(body.includes(marker),'camera hook missing');
   body=body.replace(marker,marker+`;window.__hudQA=(opts)=>{state.x=opts.x;state.y=opts.y;state.story=state.story||{};state.story.stage=opts.stage??1;state.story.oldStreamQuestRetired=false;cam.x=opts.x;cam.y=opts.y-(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming()?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0);cameraDetached=false;look.x=0;look.y=0;state.autonomy=true;autoBubble=opts.speech||"";autoBubbleTimer=opts.ms||16000;if(opts.toast)notify(opts.toast);const q=document.getElementById("v127Quest");if(q){q.style.display="";q.dataset.collapsed=opts.questCollapsed?"true":"false";const t=document.getElementById("v127QuestToggle");if(t)t.textContent=opts.questCollapsed?"+":"−";const list=document.getElementById("v127QuestList");if(list&&!list.children.length)list.innerHTML='<li><span class="v127-checkbox"></span><span>Listen near the Silent Pond</span></li>';}return true;};`);
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=quiet-hud-232-${vp.width}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady&&window.__v127UIReady,{timeout:30000});
  await page.waitForTimeout(600);
  await page.evaluate(()=>window.__hudQA({
   x:1530,y:1655,stage:1,questCollapsed:false,
   speech:'The homestead feels peaceful today, and the woodland path still needs clearing before dusk.',
   toast:'A raven has brought a note from Haigen!'
  }));
  await page.waitForTimeout(700);
  const metrics=await page.evaluate(()=>{
   const box=el=>{if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return null;const b=el.getBoundingClientRect();if(b.width<4||b.height<4)return null;return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,w:b.width,h:b.height};};
   const speech=box(document.getElementById('haigenSpeech'));
   const toastEl=document.getElementById('toast');
   const toast=toastEl&&toastEl.classList.contains('show')?box(toastEl):null;
   const quest=box(document.getElementById('v127Quest'));
   const mini=box(document.querySelector('.v127-mini'));
   const joy=box(document.getElementById('joy'));
   const hotbar=box(document.querySelector('.hotbar'));
   const pack=box(document.querySelector('.v127-utility[data-action="packBtn"]'));
   const gear=box(document.getElementById('v127Gear'));
   const overlaps=(a,b)=>!!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
   return {
    build:window.__haigenBuild,toastLive:document.body.classList.contains('haigen-toast-live'),
    speech,toast,quest,mini,
    speechToast:overlaps(speech,toast),speechQuest:overlaps(speech,quest),speechMini:overlaps(speech,mini),
    toastQuest:overlaps(toast,quest),toastMini:overlaps(toast,mini),questMini:overlaps(quest,mini),
    speechJoy:overlaps(speech,joy),speechHotbar:overlaps(speech,hotbar),
    controls:[joy,hotbar,pack,gear].every(Boolean)
   };
  });
  assert.equal(metrics.build,Number(ver.build));
  assert.equal(metrics.toastLive,true);
  assert.ok(metrics.speech,'speech visible');
  assert.ok(metrics.toast,'toast visible');
  assert.ok(metrics.mini,'minimap visible');
  assert.ok(metrics.quest,'quest guidance visible for overlap case');
  assert.equal(metrics.speechToast,false,'speech must not cover toast');
  assert.equal(metrics.speechQuest,false,'speech must not cover quest');
  assert.equal(metrics.speechMini,false,'speech must not cover minimap');
  assert.equal(metrics.toastQuest,false,'toast must not cover quest');
  assert.equal(metrics.toastMini,false,'toast must not cover minimap');
  assert.equal(metrics.questMini,false,'quest must not cover minimap');
  assert.equal(metrics.speechJoy,false,'speech must not cover joystick');
  assert.equal(metrics.speechHotbar,false,'speech must not cover hotbar');
  assert.ok(metrics.controls,'joystick/hotbar/pack/settings reachable');
  assert.ok(!errors.length,'page errors '+JSON.stringify(errors));

  // Long toast + long speech + collapsed quest.
  await page.evaluate(()=>window.__hudQA({
   x:1530,y:1655,stage:1,questCollapsed:true,
   speech:'Haigen watches the morning mist lift from the kitchen garden while Dylan rearranges paint jars on the cart.',
   toast:'First task: clear 7 brush piles at camp with X Collect before the raven returns with another note.'
  }));
  await page.waitForTimeout(700);
  const long=await page.evaluate(()=>{
   const box=el=>{if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return null;const b=el.getBoundingClientRect();if(b.width<4||b.height<4)return null;return {left:b.left,top:b.top,right:b.right,bottom:b.bottom};};
   const speech=box(document.getElementById('haigenSpeech'));
   const toast=document.getElementById('toast')?.classList.contains('show')?box(document.getElementById('toast')):null;
   const mini=box(document.querySelector('.v127-mini'));
   const overlaps=(a,b)=>!!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
   return {speechToast:overlaps(speech,toast),speechMini:overlaps(speech,mini),toastMini:overlaps(toast,mini),speechBottom:speech?.bottom,h:window.innerHeight};
  });
  assert.equal(long.speechToast,false);
  assert.equal(long.speechMini,false);
  assert.equal(long.toastMini,false);
  assert.ok(long.speechBottom<long.h-120,'speech stays above bottom controls');

  // Menu still suppresses speech.
  await page.locator('#v127Gear').tap();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#haigenSpeech').evaluate(e=>getComputedStyle(e).visibility),'hidden');
  await page.locator('#v127CloseSettings').tap();
  await page.close();
  console.log('PASS quiet HUD '+vp.width+'x'+vp.height);
 }

 await runViewport({width:390,height:844});
 await runViewport({width:768,height:1024});
 await browser.close();
 server.close();
 console.log('PASS Job 232 Quiet Nordic HUD: lanes + obstacle dodge, V'+ver.build);
})().catch(e=>{console.error(e);process.exit(1)});
