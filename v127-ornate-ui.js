
/* V127 illustrated and responsive gameplay HUD. Purely presentational. */
(()=>{'use strict';
const $=id=>document.getElementById(id),engine=window.__v127Bridge;
if(!engine){console.error('V127: game bridge not ready');return}
document.body.classList.add('v127-rpg');
const svg=(content)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">'+content+'</svg>';
const icons={
 heart:svg('<path d="M16 29L3 16Q-2 6 7 4Q12 2 16 8Q23-1 29 5Q35 15 16 29Z" fill="#d0443e" stroke="#301f20" stroke-width="2"/><path d="M7 10Q10 5 14 11" fill="none" stroke="#f8ae8f" stroke-width="2"/>'),
 sun:svg('<circle cx="16" cy="16" r="9" fill="#f6bd4f" stroke="#89512c" stroke-width="2"/><path d="M16 1v5M16 26v5M1 16h5M26 16h5M6 6l4 4M22 22l4 4M26 6l-4 4M6 26l4-4" stroke="#f6c566" stroke-width="3"/>'),
 book:svg('<path d="M16 8Q10 3 4 6V28Q12 24 16 29Q20 24 28 28V6Q22 3 16 8Z" fill="#e2b777" stroke="#382a20" stroke-width="2"/><path d="M16 8v20M7 12h6M7 17h6M19 12h6M19 17h6" stroke="#6a4d39" stroke-width="1.5"/>'),
 pack:svg('<path d="M8 10Q6 4 16 4Q26 4 24 10L27 28H5Z" fill="#9b6137" stroke="#312319" stroke-width="2"/><rect x="10" y="16" width="12" height="10" fill="#b88b52" stroke="#4a3525" stroke-width="2"/><rect x="14" y="18" width="4" height="5" fill="#e3c88c"/><path d="M11 8h10" stroke="#e4b978" stroke-width="2"/>'),
 paw:svg('<g fill="#e7bd83" stroke="#4e352a" stroke-width="1.3"><ellipse cx="16" cy="22" rx="10" ry="7"/><ellipse cx="5" cy="12" rx="3" ry="4"/><ellipse cx="12" cy="7" rx="3" ry="4"/><ellipse cx="20" cy="7" rx="3" ry="4"/><ellipse cx="27" cy="12" rx="3" ry="4"/></g>'),
 map:svg('<path d="M3 6L12 3L21 7L29 3V25L20 29L12 25L3 29Z" fill="#d8bf8e" stroke="#3d2c1d" stroke-width="1.8"/><path d="M12 4v21M21 7v21" stroke="#836544" stroke-width="1.6"/><circle cx="21" cy="16" r="3" fill="#ba5949"/>'),
 gear:svg('<path d="M13 2h6l1 5 4 2 4-2 3 6-4 3v4l3 3-3 6-5-2-3 3h-6l-1-5-4-2-4 2-3-6 4-3v-4l-4-3 3-6 5 2z" fill="#cbaa75" stroke="#33261f" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="#534334" stroke="#e8cd93" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#171c1c"/>'),
 hands:svg('<path d="M8 29L6 18Q5 15 9 15L10 6Q10 3 13 5L14 13L16 2Q18 0 20 3L20 13L23 5Q26 3 27 6L26 19Q24 27 19 29Z" fill="#d7a17c" stroke="#634533" stroke-width="2"/>'),
 axe:svg('<path d="M18 5L21 7L9 30L6 28Z" fill="#95643d" stroke="#3b291e" stroke-width="2"/><path d="M18 6Q27 2 30 6L27 13L30 18Q21 19 17 14Z" fill="#abb9b7" stroke="#465358" stroke-width="2"/>'),
 pickaxe:svg('<path d="M18 8L21 9L12 29L9 28Z" fill="#997048"/><path d="M3 6Q17 1 30 10L28 14Q19 9 13 12L5 15Z" fill="#b3bdbe" stroke="#465358" stroke-width="2"/>'),
 shovel:svg('<path d="M18 10L20 11L13 29L10 28Z" fill="#996640"/><path d="M10 2H23L26 10L19 18L11 13Z" fill="#a6b2b3" stroke="#405059" stroke-width="2"/>'),
 rod:svg('<path d="M8 29Q17 5 27 3" stroke="#b88953" stroke-width="3" fill="none"/><path d="M27 3Q30 16 26 24" stroke="#d8d6b8" stroke-width="1" fill="none"/><circle cx="12" cy="22" r="5" fill="#aab4b1" stroke="#4c565a" stroke-width="2"/><circle cx="26" cy="27" r="3" fill="#c64c3d"/>'),
 net:svg('<path d="M15 18L19 19L8 31L6 28Z" fill="#997047"/><ellipse cx="20" cy="11" rx="9" ry="9" fill="#b7d1a577" stroke="#d0bb83" stroke-width="3"/><path d="M12 11h16M20 2v18M13 6l14 10M27 6l-14 10" stroke="#efe1bd" stroke-width=".8"/>'),
 torch:svg('<path d="M15 14h5L19 30h-5Z" fill="#ae8052"/><path d="M17 2Q26 8 21 17Q16 22 11 16Q9 11 17 2Z" fill="#e47d33"/><path d="M18 7Q22 12 18 17Q14 18 15 13Z" fill="#ffe27b"/>'),
 berries:svg('<circle cx="10" cy="20" r="6" fill="#c7464e" stroke="#5c242b" stroke-width="1.7"/><circle cx="21" cy="20" r="6" fill="#b93643" stroke="#5c242b" stroke-width="1.7"/><circle cx="16" cy="12" r="6" fill="#cf4651" stroke="#5c242b" stroke-width="1.7"/><path d="M16 7Q21 1 26 5L19 11Z" fill="#709f55"/>'),
 mushroom:svg('<path d="M13 15H20V29H13Z" fill="#e5cf9e" stroke="#4e392a" stroke-width="1.5"/><path d="M3 16Q4 3 16 3Q28 3 29 16Z" fill="#b94b3b" stroke="#4c3029" stroke-width="2"/><circle cx="10" cy="10" r="3" fill="#f5dba6"/><circle cx="23" cy="11" r="3" fill="#f5dba6"/>')

};
const imageCache=new Map();
window.__v127ToolIcon=function(id){
 if(id==='hands')return icons.hands;
 try{
  if(['axe','pickaxe','shovel','torch','rod','net'].includes(id)){
   if(!imageCache.has(id))imageCache.set(id,engine.toolCanvas(id).toDataURL('image/png'));
   return '<img class="rpg-item-art" src="'+imageCache.get(id)+'" alt="" draggable="false">';
  }
 }catch(e){}
 return icons[id]||icons.axe;
};
const el=document.createElement('div');el.id='v127Root';
el.innerHTML=[
 '<div class="v127-head"><div class="v127-portrait"><canvas width="68" height="68" id="v127Portrait"></canvas></div>',
 '<div class="v127-portrait-name">Haigen</div><div><div class="v127-heart-row" id="v127Hearts">',
 Array.from({length:7},(_,i)=>'<span class="v127-heart" data-heart="'+i+'">'+icons.heart+'</span>').join(''),
 '</div><div class="v127-life"><div class="v127-life-fill" id="v127HpFill"></div></div></div></div>',
 '<div class="v127-period v127-framed">',icons.sun,'<span id="v127Day">Day 1 · Morning</span></div>',
 '<div class="v127-companions"><div class="v127-companion v127-framed"><i class="v127-companion-mark"></i><span>Skölli · <em>Fox</em></span></div><div class="v127-companion v127-framed"><i class="v127-companion-mark"></i><span>Dylan · <em>Rabbit</em></span></div></div>',
 '<section class="v127-quest v127-framed" id="v127Quest"><button type="button" class="v127-quest-toggle" aria-label="Toggle quest objectives" id="v127QuestToggle">−</button><h3>The Silent Pond</h3><ul id="v127QuestList"></ul></section>',
 '<div class="v127-mini" aria-label="Local area minimap"><span class="v127-north">N</span><canvas width="112" height="112" id="v127MiniCanvas"></canvas><span class="v127-mini-marker"></span><div class="v127-map-control"><button type="button" id="v127ZoomIn">+</button><button type="button" id="v127ZoomOut">−</button></div></div>',
 '<nav class="v127-utilities" aria-label="Adventure tools">',
 '<button class="v127-utility" data-action="journalBtn" aria-label="Journal">',icons.book,'</button>',
 '<button class="v127-utility" data-action="packBtn" aria-label="Backpack">',icons.pack,'</button>',
 '<button class="v127-utility" data-action="mapBtn" aria-label="Map">',icons.map,'</button></nav>',
 '<button class="v127-gear" id="v127Gear" type="button" aria-label="Settings">',icons.gear,'</button>',
 '<aside class="v127-settings v127-framed" id="v127Settings" aria-label="Adventure menu"><h3>Adventure Menu</h3>',
 '<div class="v127-settings-grid">',
 '<button data-action="modeBtn">🎮 Take control</button>',
 '<button data-action="storyBtn">📜 Quest</button>',
 '<button data-action="craftBtn">🔨 Craft & Build</button>',
 '<button data-action="eatBtn">🍎 Eat</button>',
 '<button data-action="healBtn">🌿 Heal</button>',
 '<button data-action="restBtn">💤 Rest</button>',
 '<button data-action="cookBtn">🍲 Cook</button>',
 '<button data-action="mailBtn">✉️ Notes</button>',
 '<button data-action="callBtn">🦊 Friends</button>',
 '<button data-action="styleBtn">🎨 Appearance</button>',
 '</div>',
 '<details class="v127-advanced"><summary>⚙️ Extra settings</summary>',
 '<button data-action="helpBtn">Controls & Help</button>',
 '<button data-action="artBtn">World appearance</button>',
 '<button data-action="devKitBtn">🧰 Developer testing</button>',
 '</details>',
 '<button id="v127CloseSettings">Close menu</button></aside>'
].join('');
document.body.appendChild(el);
// V217: portrait acts as a camera locator, not a teleport.
const haigenPortrait=el.querySelector('.v127-portrait');
haigenPortrait.setAttribute('role','button');
haigenPortrait.setAttribute('tabindex','0');
haigenPortrait.setAttribute('aria-label','Find Haigen on the map');
haigenPortrait.style.cursor='pointer';
haigenPortrait.style.pointerEvents='auto';
const focusHaigen=()=>window.__v127Bridge?.focusHaigen?.();
haigenPortrait.addEventListener('click',focusHaigen);
haigenPortrait.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focusHaigen()}});
// Keep the iPad landscape readable, while allowing the full objective panel
// to open from its large + target. Desktop keeps the quest visible.
if(window.innerWidth<=1100){
 $('v127Quest').dataset.collapsed='true';
 $('v127QuestToggle').textContent='+';
}
el.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
 const existing=$(button.dataset.action);if(existing)existing.click();
 $('v127Settings').classList.remove('open');
}));
$('v127Gear').onclick=()=>$('v127Settings').classList.toggle('open');
$('v127CloseSettings').onclick=()=>$('v127Settings').classList.remove('open');
$('v127QuestToggle').onclick=()=>{
 const quest=$('v127Quest'),collapsed=quest.dataset.collapsed!=='true';
 quest.dataset.collapsed=String(collapsed);
 $('v127QuestToggle').textContent=collapsed?'+':'−';
};
// Extra food counters live in the Backpack, not on the tool hotbar.
const toast=$('toast');
if(toast&&typeof MutationObserver!=='undefined'){
 const clean=()=>{
  const raw=toast.textContent||'';
  const plain=raw.replace(/\p{Extended_Pictographic}\uFE0F?/gu,'').replace(/\s{2,}/g,' ').trim();
  if(plain!==raw)toast.textContent=plain;
 };
 new MutationObserver(clean).observe(toast,{childList:true,subtree:true,characterData:true});
}
let radius=550,lastMini=0,lastDraw=0,lastStage=-1,lastHP=-1,lastDay='';
$('v127ZoomIn').onclick=()=>{radius=Math.max(200,radius*.72);lastMini=0};
$('v127ZoomOut').onclick=()=>{radius=Math.min(1500,radius*1.38);lastMini=0};
const questSteps=[['Investigate the pond',2],['Find the source of the blockage',4],['Restore the stream flow',6]];
function portrait(){
 const canvas=$('v127Portrait'),g=canvas.getContext('2d'),art=engine.portrait();
 g.clearRect(0,0,68,68);
 if(art&&art.naturalWidth>=48&&art.naturalHeight>=72){
  g.imageSmoothingEnabled=false;g.drawImage(art,0,0,48,51,-1,-10,71,86);
  return true;
 }
 g.fillStyle='#937a58';g.fillRect(0,0,68,68);g.fillStyle='#29251f';g.font='bold 33px Georgia';g.fillText('H',23,45);
 return false;
}
function minimap(state,now){
 if(now<lastMini)return;lastMini=now+1300;
 const cv=$('v127MiniCanvas'),g=cv.getContext('2d'),cells=28,unit=cv.width/cells;
 for(let row=0;row<cells;row++)for(let col=0;col<cells;col++){
  const wx=state.x+(col+.5-cells/2)*2*radius/cells;
  const wy=state.y+(row+.5-cells/2)*2*radius/cells;
  let rgb=[75,115,75];
  try{rgb=engine.terrain(wx,wy)}catch(e){}
  g.fillStyle=Array.isArray(rgb)?'rgb('+rgb.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(n)))).join(',')+')':'#5e8863';
  g.fillRect(col*unit,row*unit,Math.ceil(unit),Math.ceil(unit));
 }
 const hx=56+(1500-state.x)/radius*56,hy=56+(1500-state.y)/radius*56;
 if(hx>0&&hy>0&&hx<112&&hy<112){g.fillStyle='#211c18';g.fillRect(hx-4,hy-4,8,8);g.fillStyle='#ffdb8e';g.fillRect(hx-3,hy-3,6,6)}
 const discovered=window.__gloamQA?.();
 if(discovered?.discovered){const bx=56+(discovered.position.x-state.x)/radius*56,by=56+(discovered.position.y-state.y)/radius*56;
  if(bx>3&&bx<109&&by>3&&by<109){g.beginPath();g.arc(bx,by,4,0,Math.PI*2);g.fillStyle=discovered.defeated?'#667b62':'#ab5484';g.fill();g.strokeStyle='#f4deb6';g.lineWidth=1;g.stroke();}}
 g.beginPath();g.moveTo(56,45);g.lineTo(48,64);g.lineTo(56,60);g.lineTo(64,64);g.closePath();g.fillStyle='#fff4da';g.fill();g.strokeStyle='#21211d';g.lineWidth=1.5;g.stroke();
}
function tick(){
 const now=performance.now();
 if(now-lastDraw>180){lastDraw=now;
  try{
   const state=engine.snapshot(),hp=Math.min(100,Math.max(0,Number(state.health)||0));
   if(Math.ceil(hp)!==lastHP){
    lastHP=Math.ceil(hp);
    const hearts=[...el.querySelectorAll('.v127-heart')];
    hearts.forEach((h,i)=>{h.style.filter=i<Math.ceil(hp*hearts.length/100)?'drop-shadow(0 1px 1px #000a)':'grayscale(1) brightness(.35)'});
    $('v127HpFill').style.width=hp+'%';
   }
   const day='Day '+state.day+' · '+state.phase;
   if(day!==lastDay){$('v127Day').textContent=day;lastDay=day}
   if(state.stage!==lastStage){
    lastStage=state.stage;
    $('v127QuestList').innerHTML=questSteps.map(([title,step])=>'<li><span class="v127-checkbox">'+(state.stage>=step?'✓':'')+'</span><span>'+title+'</span></li>').join('');
   }
   minimap(state,now);
   if(!window.__v127PortraitReady)window.__v127PortraitReady=portrait();
   window.__v127UIReady=true;
   window.__v127UISnapshot={version:128,health:hp,stage:state.stage,miniRadius:radius};
  }catch(e){window.__v127UIError=String(e)}
 }
 requestAnimationFrame(tick);
}
engine.refreshTools();
requestAnimationFrame(tick);
})();
