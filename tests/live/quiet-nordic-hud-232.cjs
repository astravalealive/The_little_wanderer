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
 assert.ok(Number(ver.build)>=431,'Job 232 correction requires GAME_BUILD >= 431');
 assert.match(html,new RegExp('const GAME_BUILD\\s*=\\s*'+Number(ver.build)+'\\b'));
 assert.match(html,/quietHudObstacleBoxes/);
 assert.match(html,/haigen-toast-live/);
 assert.match(html,/wandererV127PreviewSave/);
 assert.match(css,/Job 232: Quiet Nordic HUD/);
 assert.match(css,/iPad \/ wide landscape/);
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
 const qaHook=`;window.__hudQA=(opts)=>{state.x=opts.x??state.x;state.y=opts.y??state.y;state.story=state.story||{};state.story.stage=opts.stage??1;state.story.oldStreamQuestRetired=false;if(Number.isFinite(opts.x)){cam.x=opts.x;cam.y=opts.y-(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming()?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0);}cameraDetached=false;look.x=0;look.y=0;if(opts.autonomy===false){state.autonomy=false;autoBubble="";autoBubbleTimer=0;}else{state.autonomy=true;autoBubble=opts.speech||"";autoBubbleTimer=opts.ms||16000;}if(opts.toast)notify(opts.toast);const q=document.getElementById("v127Quest");if(q){q.style.display="";q.dataset.collapsed=opts.questCollapsed?"true":"false";const t=document.getElementById("v127QuestToggle");if(t)t.textContent=opts.questCollapsed?"+":"−";const list=document.getElementById("v127QuestList");if(list)list.innerHTML='<li><span class="v127-checkbox"></span><span>Listen near the Silent Pond</span></li><li><span class="v127-checkbox"></span><span>Find what disturbs the water</span></li>';}return {w:W,h:H,x:state.x,y:state.y,equip:state.equipped,portrait:typeof presentationPortraitFraming==="function"&&presentationPortraitFraming()};};`;

 async function openPage(vp){
  const page=await browser.newPage({viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/haigen.html?qa=quiet-hud-232*',async route=>{
   const response=await route.fetch();
   let body=await response.text();
   const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
   assert(body.includes(marker),'camera hook missing');
   body=body.replace(marker,marker+qaHook);
   await route.fulfill({response,body});
  });
  await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=quiet-hud-232-${vp.width}x${vp.height}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__haigenWorldReady&&window.__v127UIReady,{timeout:30000});
  await page.waitForTimeout(550);
  return {page,errors};
 }

 function assertNoHudCollisions(metrics,label){
  for(const key of ['speechToast','speechQuest','speechMini','toastQuest','toastMini','questMini','toastPeriod','speechJoy','speechHotbar']){
   assert.equal(metrics[key],false,label+' '+key);
  }
  assert.ok(metrics.questUnderMini,label+' quest under minimap');
  assert.ok(metrics.toastBelowPeriod,label+' toast below day chip');
 }

 async function measureHud(page){
  return page.evaluate(()=>{
   const box=el=>{if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return null;const b=el.getBoundingClientRect();if(b.width<4||b.height<4)return null;return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,w:b.width,h:b.height};};
   const overlaps=(a,b)=>!!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
   const speech=box(document.getElementById('haigenSpeech'));
   const toastEl=document.getElementById('toast');
   const toast=toastEl&&toastEl.classList.contains('show')?box(toastEl):null;
   const quest=box(document.getElementById('v127Quest'));
   const mini=box(document.querySelector('.v127-mini'));
   const period=box(document.querySelector('.v127-period'));
   const joy=box(document.getElementById('joy'));
   const hotbar=box(document.querySelector('.hotbar'));
   const pack=box(document.querySelector('.v127-utility[data-action="packBtn"]'));
   const gear=box(document.getElementById('v127Gear'));
   const interact=box(document.getElementById('interactBtn'));
   const use=box(document.getElementById('useBtn'));
   const touchOk=b=>b&&b.w>=30&&b.h>=30&&b.left>=-2&&b.top>=-2&&b.right<=innerWidth+2&&b.bottom<=innerHeight+2;
   return {
    build:window.__haigenBuild,toastLive:document.body.classList.contains('haigen-toast-live'),
    speech,toast,quest,mini,period,joy,hotbar,pack,gear,interact,use,
    speechToast:overlaps(speech,toast),speechQuest:overlaps(speech,quest),speechMini:overlaps(speech,mini),
    toastQuest:overlaps(toast,quest),toastMini:overlaps(toast,mini),questMini:overlaps(quest,mini),
    toastPeriod:overlaps(toast,period),speechJoy:overlaps(speech,joy),speechHotbar:overlaps(speech,hotbar),
    questUnderMini:!quest||!mini||quest.top+0.5>=mini.bottom-3,
    toastBelowPeriod:!toast||!period||toast.top+0.5>=period.bottom-1,
    speechAboveControls:!speech||speech.bottom<innerHeight-110,
    touches:{joy:touchOk(joy),hotbar:touchOk(hotbar),pack:touchOk(pack),gear:touchOk(gear),interact:touchOk(interact),use:touchOk(use)}
   };
  });
 }

 async function runViewport(vp,label){
  const {page,errors}=await openPage(vp);
  await page.evaluate(()=>window.__hudQA({
   x:1530,y:1655,stage:1,questCollapsed:false,
   speech:'The homestead feels peaceful today, and the woodland path still needs clearing before dusk.',
   toast:'A raven has brought a note from Haigen!'
  }));
  await page.waitForTimeout(700);
  const metrics=await measureHud(page);
  assert.equal(metrics.build,Number(ver.build));
  assert.equal(metrics.toastLive,true);
  assert.ok(metrics.speech,'speech visible');
  assert.ok(metrics.toast,'toast visible');
  assert.ok(metrics.mini,'minimap visible');
  assert.ok(metrics.quest,'quest guidance visible');
  assertNoHudCollisions(metrics,label);
  assert.ok(metrics.speechAboveControls,label+' speech above controls');
  assert.ok(metrics.touches.joy&&metrics.touches.hotbar&&metrics.touches.pack&&metrics.touches.gear,label+' touch geometry');

  // Long toast + long speech + collapsed quest.
  await page.evaluate(()=>window.__hudQA({
   x:1530,y:1655,stage:1,questCollapsed:true,
   speech:'Haigen watches the morning mist lift from the kitchen garden while Dylan rearranges paint jars on the cart and friends talk about tomorrow.',
   toast:'First task: clear 7 brush piles at camp with X Collect before the raven returns with another note.'
  }));
  await page.waitForTimeout(700);
  const long=await measureHud(page);
  assert.equal(long.speechToast,false,label+' long speechToast');
  assert.equal(long.speechMini,false,label+' long speechMini');
  assert.equal(long.toastMini,false,label+' long toastMini');
  assert.equal(long.toastPeriod,false,label+' long toastPeriod');
  assert.ok(long.speechAboveControls,label+' long speech above controls');

  // Real touch usability: joystick moves Haigen, hotbar selects, pack opens, settings opens.
  await page.evaluate(()=>window.__hudQA({x:1600,y:1700,autonomy:false,questCollapsed:true}));
  await page.waitForTimeout(120);
  const before=await page.evaluate(()=>window.__hudQA({autonomy:false}));
  const joyBox=await page.locator('#joy').boundingBox();
  const utilBox=await page.locator('.v127-utilities').boundingBox();
  assert.ok(joyBox&&joyBox.width>=30&&joyBox.height>=30,label+' joystick box');
  assert.ok(utilBox,label+' utility cluster present');
  assert.ok(utilBox.y+utilBox.height<=joyBox.y+2,label+' utilities stay above joystick');
  // Drag the upper stick so the gesture stays on #joy / #stick.
  const cx=joyBox.x+joyBox.width/2,cy=joyBox.y+joyBox.height*0.35;
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+48,y:cy,id:1}]});
  await page.waitForTimeout(550);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const afterMove=await page.evaluate(()=>window.__hudQA({autonomy:false}));
  assert.ok(Math.hypot(afterMove.x-before.x,afterMove.y-before.y)>0.35,label+' joystick moved Haigen');

  await page.locator('.hotbar .slot').first().tap();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('.hotbar .slot.selected').getAttribute('data-equip'),'hands',label+' hotbar select');

  await page.locator('.v127-utility[data-action="packBtn"]').tap();
  await page.waitForTimeout(220);
  assert.equal(await page.locator('#overlay').evaluate(e=>e.classList.contains('open')),true,label+' pack opens');
  await page.locator('#closeBtn').tap();
  await page.waitForTimeout(120);

  await page.locator('#v127Gear').tap();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#v127Settings').evaluate(e=>e.classList.contains('open')),true,label+' settings opens');
  assert.equal(await page.locator('#haigenSpeech').evaluate(e=>getComputedStyle(e).visibility),'hidden',label+' speech muted in menu');
  await page.locator('#v127CloseSettings').tap();
  await cdp.detach().catch(()=>{});

  assert.ok(!errors.length,label+' page errors '+JSON.stringify(errors));
  await page.close();
  console.log('PASS quiet HUD '+label+' '+vp.width+'x'+vp.height);
 }

 await runViewport({width:390,height:844},'iphone');
 await runViewport({width:768,height:1024},'ipad-portrait');
 await runViewport({width:1024,height:768},'ipad-landscape');
 await browser.close();
 server.close();
 console.log('PASS Job 232 Quiet Nordic HUD correction: lanes + touch + landscape, V'+ver.build);
})().catch(e=>{console.error(e);process.exit(1)});
