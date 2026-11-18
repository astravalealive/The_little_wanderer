/* Job 232: speech, toast, quest guidance and minimap stay apart and off Haigen. */
'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../..');
const port=18774;
const LONG='The stone whispered: He who would still the forest has awakened, and the old waterway remembers every root we moved aside.';
const SHORT='The homestead feels peaceful today.';
const QUEST=[
 '<li><span class="v127-checkbox"></span><span>Investigate the strange tracks on the pond’s eastern bank.</span></li>',
 '<li><span class="v127-checkbox"></span><span>Find the source of the blockage and restore the stream.</span></li>',
 '<li><span class="v127-checkbox"></span><span>Gather wood and stone, then ask Bristleback to heave the roots aside.</span></li>'
].join('');
function serve(){
 return new Promise((resolve,reject)=>{
  const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  child.once('error',reject);
  let tries=0;
  const ping=()=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();if(r.statusCode===200)resolve(child);else{child.kill();reject(new Error('bad status'))}}).on('error',e=>{
   if(++tries>40){child.kill();reject(e)}else setTimeout(ping,150);
  });
  setTimeout(ping,200);
 });
}
function hook(html){
 const marker='function worldZoom(){return baseCameraScale()*cameraZoom}';
 assert(html.includes(marker),'camera hook missing');
 return html.replace(marker,marker+`;window.__hudQA=(o)=>{state.x=o.x;state.y=o.y;const lift=(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming())?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0;cam.x=o.x;cam.y=o.y-lift;cameraDetached=false;look.x=0;look.y=0;state.autonomy=!!o.speech;autoBubble=o.speech||"";autoBubbleTimer=o.speech?12000:0;lastVisibleSpeech="";quietSpeechHeight=0;if(o.toast)notify(o.toast);else{const t=document.getElementById("toast");if(t){t.classList.remove("show");t.textContent="";}}state.story.oldStreamQuestRetired=false;state.story.stage=2;const q=document.getElementById("v127Quest");if(q){q.style.display="block";q.dataset.collapsed=o.collapsed?"true":"false";}const list=document.getElementById("v127QuestList");if(list)list.innerHTML=o.quest||"";const tog=document.getElementById("v127QuestToggle");if(tog)tog.textContent=o.collapsed?"+":"−";return true;};`);
}
async function overlaps(page){
 return page.evaluate(()=>{
  const box=el=>{
   if(!el)return null;
   const s=getComputedStyle(el);
   if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return null;
   const r=el.getBoundingClientRect();
   if(r.width<2||r.height<2)return null;
   return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};
  };
  const area=(a,b)=>{
   if(!a||!b)return 0;
   const x=Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l));
   const y=Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
   return Math.round(x*y);
  };
  const snap=window.__gloamPort.snapshot();
  const zoom=snap.worldZoom;
  const px=(snap.x-snap.cameraX)*zoom+snap.width/2;
  const py=(snap.y-snap.cameraY)*zoom+snap.height/2;
  const crown=(72*1.67-7)*zoom;
  const hero={l:px-40*zoom,t:py-crown,r:px+40*zoom,b:py+4,w:80*zoom,h:crown+4};
  const speech=box(document.getElementById('haigenSpeech'));
  const toast=box(document.getElementById('toast'));
  const quest=box(document.getElementById('v127Quest'));
  const mini=box(document.querySelector('.v127-mini'));
  const joy=box(document.getElementById('joy'));
  const hotbar=box(document.querySelector('.hotbar'));
  const interact=box(document.getElementById('interactBtn'));
  const gear=box(document.getElementById('v127Gear'));
  const pack=box(document.querySelector('.v127-utility[data-action="packBtn"]'));
  const map=box(document.querySelector('.v127-utility[data-action="mapBtn"]'));
  return {
   zoom,speech,toast,quest,mini,heroTop:hero.t,
   pairs:{
    speechHero:area(speech,hero),speechToast:area(speech,toast),speechQuest:area(speech,quest),speechMini:area(speech,mini),
    toastQuest:area(toast,quest),toastMini:area(toast,mini),questMini:area(quest,mini),
    speechJoy:area(speech,joy),speechHotbar:area(speech,hotbar),speechInteract:area(speech,interact)
   },
   controls:[joy,hotbar,interact,gear,pack,map].map(b=>b&&b.w>=30&&b.h>=30)
  };
 });
}
async function run(){
 const version=JSON.parse(fs.readFileSync(path.join(root,'haigen-version.json'),'utf8'));
 assert.ok(Number(version.build)>=430,'Job 232 requires V430');
 const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
 assert.match(source,/quietHudBoxesNow/);
 assert.match(source,new RegExp('const GAME_BUILD='+Number(version.build)+'\\b'));
 assert.match(fs.readFileSync(path.join(root,'v127-ornate-ui.css'),'utf8'),/Job 232: Quiet Nordic HUD/);
 const server=await serve();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const views=[
   {name:'iphone',width:390,height:844},
   {name:'ipad-portrait',width:768,height:1024},
   {name:'ipad-landscape',width:1024,height:768}
  ];
  for(const vp of views){
   const context=await browser.newContext({viewport:vp,isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/haigen.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:hook(await response.text())});
   });
   await page.goto('http://127.0.0.1:'+port+'/haigen.html?qa=quiet-hud-232',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
   await page.waitForTimeout(700);
   for(const state of [
    {label:'short',speech:SHORT,toast:'First task: clear 7 brush piles at camp with X Collect.',collapsed:true},
    {label:'long',speech:LONG,toast:LONG,collapsed:false}
   ]){
    await page.evaluate(({state,QUEST})=>window.__hudQA({x:1530,y:1655,speech:state.speech,toast:state.toast,quest:QUEST,collapsed:state.collapsed}),{state,QUEST});
    await page.waitForTimeout(450);
    await page.evaluate(({state,QUEST})=>window.__hudQA({x:1530,y:1655,speech:state.speech,toast:state.toast,quest:QUEST,collapsed:state.collapsed}),{state,QUEST});
    await page.waitForTimeout(300);
    const measured=await overlaps(page);
    const bad=Object.entries(measured.pairs).filter(([,n])=>n>0);
    assert.equal(bad.length,0,vp.name+' '+state.label+' overlap '+JSON.stringify(bad)+' zoom '+measured.zoom);
    assert.ok(measured.controls.every(Boolean),vp.name+' touch targets');
    console.log('PASS',vp.name,state.label,'zoom',measured.zoom.toFixed(3));
   }
   await page.locator('#v127Gear').tap();
   await page.waitForTimeout(150);
   const muted=await page.evaluate(()=>({
    speech:getComputedStyle(document.getElementById('haigenSpeech')).visibility,
    quest:getComputedStyle(document.getElementById('v127Quest')).visibility,
    settings:document.getElementById('v127Settings').classList.contains('open')
   }));
   assert.equal(muted.settings,true,vp.name+' settings open');
   assert.equal(muted.speech,'hidden',vp.name+' speech hidden while menu open');
   assert.equal(muted.quest,'hidden',vp.name+' quest hidden while menu open');
   await page.locator('#v127CloseSettings').tap();
   assert.equal(errors.length,0,vp.name+' errors '+errors.join('; '));
   await context.close();
  }
  console.log('PASS Job 232 quiet Nordic HUD');
 }finally{if(browser)await browser.close();server.kill();}
}
run().catch(e=>{console.error('QUIET HUD FAILED:',e);process.exitCode=1});
