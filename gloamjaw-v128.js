/* Gloamjaw Hollow · Haigen's World V128
   Original boss art and tactics. Save-compatible, isolated from Ember. */
(()=>{'use strict';
const P=window.__gloamPort;
if(!P){console.error('Gloamjaw: game port unavailable');return}
const {state,objects,woodlandDetails,ctx}=P;
const x=930,y=2710,rx=300,ry=243,MAX=180;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),bossPos={x,y};
const arena=(px,py,pad=0)=>((px-x)/(rx+pad))**2+((py-y)/(ry+pad))**2<1;
for(const list of [objects,woodlandDetails])for(let i=list.length-1;i>=0;i--)if(arena(list[i].x,list[i].y,36))list.splice(i,1);
const data=state.gloamBoss=Object.assign({hp:MAX,defeated:false,discovered:false},state.gloamBoss||{});
data.hp=Math.min(MAX,Math.max(0,Number(data.hp)||0));
if(data.defeated)data.hp=0;else if(data.hp===0)data.hp=MAX;
state.arrows=Math.max(0,Math.floor(Number(state.arrows)||0));
state.tools.bow=Math.min(3,Math.max(0,Number(state.tools.bow)||0));
state.tools.crossbow=Math.min(3,Math.max(0,Number(state.tools.crossbow)||0));
P.toolSlots.push({id:'bow',name:'Bow',icon:'🏹'},{id:'crossbow',name:'Crossbow',icon:'⚙️'});
P.recipes.push(
 {kind:'bow',name:'🏹 Woodland bow',wood:4,stone:0,twigs:4,leaves:2,desc:'A lightweight ranged weapon. Equip and press Use Tool.'},
 {kind:'arrowPack',name:'🏹 Twelve arrows',wood:0,stone:2,twigs:4,desc:'Craft 12 shots for either ranged weapon.'},
 {kind:'bowUpgrade',name:'🏹 Reinforced bow',wood:5,stone:3,twigs:3,desc:'Improve an existing bow, up to level 3.'},
 {kind:'crossbow',name:'⚙️ Thornwood crossbow',wood:8,stone:5,twigs:4,desc:'A slower, stronger weapon. Unlock by defeating Gloamjaw.'},
 {kind:'crossbowUpgrade',name:'⚙️ Crossbow upgrade',wood:7,stone:6,twigs:3,desc:'Improve an existing crossbow, up to level 3.'}
);
P.craftCategories.find(c=>c.id==='tools').kinds.push('bow','arrowPack','bowUpgrade','crossbow','crossbowUpgrade');
const icon=(cross)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><path d="M'+(cross?'7 16L29 16M15 4Q29 16 15 28':'11 3Q28 16 11 29')+'" fill="none" stroke="#c69c5f" stroke-width="3"/><path d="'+(cross?'M15 4L15 28M4 16H30':'M11 3V29M4 16H27')+'" stroke="#eee2b6" stroke-width="1.5" fill="none"/><path d="M27 12L31 16L27 20" fill="#b6c8c4"/></svg>';
const previousIcon=window.__v127ToolIcon;
window.__v127ToolIcon=id=>id==='bow'?icon(false):id==='crossbow'?icon(true):previousIcon?previousIcon(id):id;
P.renderHotbar();
const style=document.createElement('style');
style.textContent='#gloamBossHud{display:none;position:fixed;z-index:27;top:calc(env(safe-area-inset-top,0px) + 114px);left:50%;transform:translateX(-50%);width:min(520px,83vw);background:#221a2def;color:#f5dec8;border:2px solid #af7c91;border-radius:12px;padding:8px 11px;font:700 13px Georgia,serif;pointer-events:none;text-shadow:0 1px 2px #000;box-shadow:0 5px 18px #0008}#gloamBossHud .title-line{display:flex;justify-content:space-between;gap:7px}#gloamBossHud .track{background:#211b28;border:2px solid #a9848c;border-radius:7px;overflow:hidden;height:15px;margin-top:6px}#gloamBossFill{height:100%;background:linear-gradient(90deg,#783653,#c65b7e,#e3a1a3);width:100%;transition:width .15s}@media(max-width:600px){#gloamBossHud{top:calc(env(safe-area-inset-top,0px) + 86px);font-size:10px;width:79vw;padding:5px 8px}}';
document.head.append(style);
style.textContent+='#gloamAmmo{position:fixed;z-index:23;right:calc(env(safe-area-inset-right,0px) + 7px);bottom:calc(env(safe-area-inset-bottom,0px) + 25px);padding:2px 7px;background:#251d29e8;border:1px solid #a4875c;border-radius:6px;font:700 11px Georgia,serif;color:#efd7ab;pointer-events:none;display:none}';
const bar=document.createElement('div');bar.id='gloamBossHud';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','Gloamjaw boss health');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(MAX));
bar.innerHTML='<div class="title-line"><span>GLOAMJAW · HUNGRY BLOOM</span><span id="gloamBossValue">180 / 180</span></div><div class="track"><div id="gloamBossFill"></div></div>';document.body.append(bar);const ammo=document.createElement('div');ammo.id='gloamAmmo';ammo.setAttribute('aria-live','off');document.body.append(ammo);
const combat={mode:'idle',timer:1350,turn:0,attack:'',aim:{x,y},angle:0,hit:false,arrows:[],spores:[],lastShot:-1e6,lastMelee:-1e6};

// Illustrated 16-bit sprite atlas. Each pose is rasterized once at 192px to
// match Haigen's crisp animation. This affects artwork only, not encounter logic.
// V133. Approved 28-pose original Gloamjaw atlas: four columns and seven rows.
// If the approved PNG is absent, the existing illustrated fallback remains.
const GLOAM_ART_CELL=128;
let gloamIllustratedAtlas=null,gloamArtLoaded=false,gloamArtError='';
const gloamArtImage=new Image();
gloamArtImage.decoding='async';
gloamArtImage.onload=()=>{
 if(gloamArtImage.naturalWidth!==512||gloamArtImage.naturalHeight!==896){
  gloamArtError='Unexpected approved atlas dimensions';return;
 }
 gloamIllustratedAtlas=gloamArtImage;gloamArtLoaded=true;
};
gloamArtImage.onerror=()=>{gloamArtError='Approved atlas not uploaded yet'};
gloamArtImage.src='./assets/gloamjaw-approved-v133.png?v=133';
function gloamFacing(){
 const dx=state.x-x,dy=state.y-y;
 if(Math.abs(dx)>Math.abs(dy)*.94)return dx<0?1:2;
 return dy < -70?3:0;
}
function gloamPose(){
 const t=P.snapshot().time,side=gloamFacing(),phase=Math.floor(t/320);
 if(data.defeated)return 27;
 if(t-lastGloamHitAt<220)return phase%2?25:24;
 if(combat.mode==='warning')return {vine:side===1?12:13,bite:18,spores:20,roots:22}[combat.attack]??8;
 if(combat.mode==='strike')return {vine:side===1?14:15,bite:19,spores:21,roots:23}[combat.attack]??9;
 if(combat.mode==='recover')return combat.attack==='bite'?17:9;
 if(data.hp<MAX*.5)return phase%3===0?11:phase%3===1?20:8;
 if(side===3)return phase%4===0?7:3;
 if(side===1)return phase%2?4:1;
 if(side===2)return phase%2?5:2;
 return phase%5===0?8:phase%5===1?9:0;
}

const ell=(px,py,a,b,colour)=>{ctx.fillStyle=colour;ctx.beginPath();ctx.ellipse(px,py,a,b,0,0,Math.PI*2);ctx.fill()};
const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke()}};
function finish(){
 data.hp=0;data.defeated=true;combat.mode='dead';combat.spores=[];
 P.memory('Haigen defeated Gloamjaw, the hungry bloom hidden in the southern woodland clearing. The crossbow blueprint is unlocked.');
 P.notify('🌿 GLOAMJAW DEFEATED! Crossbow crafting unlocked.');P.save();
}
let lastGloamHitAt=-1e9;
function damageBoss(dmg){
 if(data.defeated)return false;
 lastGloamHitAt=P.snapshot().time;
 data.hp=Math.max(0,data.hp-dmg);
 if(!data.hp)finish();return true;
}
function craftLocked(r){
 if(!['bow','arrowPack','bowUpgrade','crossbow','crossbowUpgrade'].includes(r.kind))return false;
 const invalid=(message)=>{P.notify(message);return true};
 if(r.kind==='bow'&&state.tools.bow)return invalid('🏹 You already have a bow. Upgrade it instead.');
 if(r.kind==='bowUpgrade'&&(!state.tools.bow||state.tools.bow>=3))return invalid('🏹 Craft a bow first; maximum level 3.');
 if(r.kind==='crossbow'&&!data.defeated)return invalid('🔒 Defeat Gloamjaw to unlock the crossbow.');
 if(r.kind==='crossbow'&&state.tools.crossbow)return invalid('⚙️ You already have a crossbow. Upgrade it.');
 if(r.kind==='crossbowUpgrade'&&(!state.tools.crossbow||state.tools.crossbow>=3))return invalid('⚙️ Craft a crossbow first; maximum level 3.');
 return false;
}
function crafted(r){
 if(r.kind==='arrowPack'){state.arrows+=12;P.notify('🏹 12 arrows made. Carrying '+state.arrows+'.');return true}
 if(!['bow','bowUpgrade','crossbow','crossbowUpgrade'].includes(r.kind))return false;
 const id=r.kind.toLowerCase().startsWith('crossbow')?'crossbow':'bow';
 state.tools[id]=Math.min(3,state.tools[id]+1);P.equipTool(id);
 P.notify((id==='bow'?'🏹 Bow':'⚙️ Crossbow')+' level '+state.tools[id]+' ready!');return true;
}
function fire(){
 const kind=state.equipped,cross=kind==='crossbow',level=state.tools[kind]||0,t=P.snapshot().time;
 if(!level)return;
 if(!state.arrows){P.notify('🏹 Out of arrows! Craft twelve from twigs and stone.');return}
 if(t-combat.lastShot<(cross?1200-level*100:615-level*75))return;
 combat.lastShot=t;
 let target=null;
 if(!data.defeated&&dist(state,bossPos)<680)target={x,y:y-60};
 if(!target){
  const animal=[...P.beasts,...P.regionalWildlife].filter(a=>P.animalAlive(a)&&dist(state,a)<385).sort((a,b)=>dist(state,a)-dist(state,b))[0];
  if(animal)target={x:animal.x,y:animal.y-18};
 }
 if(!target){const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},dir=dirs[P.snapshot().dir]||dirs.down;
  target={x:state.x+dir[0]*690,y:state.y-36+dir[1]*690}}
 const px=state.x,py=state.y-36,d=Math.max(1,Math.hypot(target.x-px,target.y-py)),speed=cross?650:535;
 combat.arrows.push({x:px,y:py,vx:(target.x-px)/d*speed,vy:(target.y-py)/d*speed,life:1600,
  damage:cross?18+5*(level-1):10+4*(level-1)});
 state.arrows--;P.startHaigenAction('swing',220);P.soundEffect('swing');P.save();
}
function useTool(){
 if(state.equipped==='bow'||state.equipped==='crossbow'){fire();return true}
 const t=P.snapshot().time;
 if(!data.defeated&&dist(state,bossPos)<138&&['axe','pickaxe'].includes(state.equipped)&&t-combat.lastMelee>580){
  combat.lastMelee=t;damageBoss(state.equipped==='axe'?4:3);P.soundEffect('hit');return true;
 }
 return false;
}
function update(dt){
 const now=P.snapshot(),r=dist(state,bossPos);
 for(const a of combat.arrows){
  a.x+=a.vx*dt/1000;a.y+=a.vy*dt/1000;a.life-=dt;
  if(!data.defeated&&Math.hypot(a.x-x,a.y-(y-60))<77){damageBoss(a.damage);a.life=0;continue}
  for(const animal of [...P.beasts,...P.regionalWildlife]){
   if(P.animalAlive(animal)&&Math.hypot(a.x-animal.x,a.y-(animal.y-18))<30){P.hurtAnimal(animal,Math.max(1,Math.round(a.damage/4)));a.life=0;break}
  }
 }
 combat.arrows=combat.arrows.filter(a=>a.life>0);
 for(const sp of combat.spores){
  sp.x+=sp.vx*dt/1000;sp.y+=sp.vy*dt/1000;sp.life-=dt;
  if(Math.hypot(sp.x-state.x,sp.y-(state.y-34))<25){P.takeDamage(9,'Gloamjaw spore',true,bossPos);sp.life=0}
 }
 combat.spores=combat.spores.filter(a=>a.life>0);
 ammo.style.display=['bow','crossbow'].includes(state.equipped)?'block':'none';
 if(ammo.style.display==='block')ammo.textContent='ARROWS '+state.arrows+' · LV '+state.tools[state.equipped];
 bar.style.display=!data.defeated&&r<530?'block':'none';
 if(bar.style.display==='block'){
  bar.setAttribute('aria-valuenow',String(Math.ceil(data.hp)));
  document.getElementById('gloamBossFill').style.width=data.hp/MAX*100+'%';
  document.getElementById('gloamBossValue').textContent=Math.ceil(data.hp)+' / '+MAX;
 }
 if(data.defeated||now.collapsed||r>500){
  if(!data.defeated&&combat.mode!=='idle'){combat.mode='idle';combat.timer=1300;combat.spores=[]}
  return;
 }
 if(r<415&&!data.discovered){data.discovered=true;
  P.memory('Haigen found Gloamjaw Hollow, a secluded clearing deep south of camp. An enormous hungry flower grows at its centre.');P.save()}
 if(r>368||state.resting)return;
 combat.timer-=dt;
 if(combat.mode==='idle'||combat.mode==='recover'){
  if(combat.timer>0)return;
  combat.attack=['vine','spores','roots','bite'][combat.turn++%4];
  if(combat.attack==='bite'&&r>165)combat.attack='spores';
  combat.mode='warning';combat.timer=combat.attack==='roots'?1020:combat.attack==='bite'?660:850;
  combat.aim={x:state.x,y:state.y};combat.angle=Math.atan2(state.y-y,state.x-x);
  combat.hit=false;return;
 }
 if(combat.mode==='warning'&&combat.timer<=0){
  combat.mode='strike';combat.timer=700;
  if(combat.attack==='spores'){
   const n=data.hp<MAX/2?5:3,base=Math.atan2(state.y-34-(y-90),state.x-x);
   for(let i=0;i<n;i++){const angle=base+(i-(n-1)/2)*.2;
    combat.spores.push({x,y:y-90,vx:Math.cos(angle)*230,vy:Math.sin(angle)*230,life:2600})}
  }
 }
 if(combat.mode==='strike'){
  if(!combat.hit){
   if(combat.attack==='bite'&&r<125)combat.hit=P.takeDamage(19,'Gloamjaw bite',false,bossPos);
   if(combat.attack==='roots'&&Math.hypot(state.x-combat.aim.x,state.y-combat.aim.y)<93)
    combat.hit=P.takeDamage(14,'Gloamjaw root burst',false,bossPos);
   if(combat.attack==='vine'){
    const dx=state.x-x,dy=state.y-y,forward=dx*Math.cos(combat.angle)+dy*Math.sin(combat.angle);
    const side=Math.abs(-dx*Math.sin(combat.angle)+dy*Math.cos(combat.angle));
    if(forward>75&&forward<320&&side<60)combat.hit=P.takeDamage(13,'Gloamjaw vine',false,bossPos);
   }
  }
  if(combat.timer<=0){combat.mode='recover';combat.timer=data.hp<90?1250:1900}
 }
}
function drawGround(){
 const now=P.snapshot();
 if(Math.abs(x-now.cameraX)>1200||Math.abs(y-now.cameraY)>920)return;
 ctx.save();
 const halo=ctx.createRadialGradient(x,y,80,x,y,rx+50);
 halo.addColorStop(0,'#403a3a');halo.addColorStop(.4,'#4a5040');halo.addColorStop(.78,'#536246');
 halo.addColorStop(1,'#243b30');
 ell(x,y,rx+27,ry+22,'#293e31');ell(x,y,rx+13,ry+8,'#43593d');
 ctx.save();ctx.translate(x,y);ctx.scale(1,.81);ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
 ell(x,y+18,213,137,'#393d34');
 // Deep root-scars and hand-placed fungus form a readable arena without a road.
 ctx.lineCap='round';ctx.lineJoin='round';
 for(let i=0;i<21;i++){
  const a=i*2.399,r=.19+(i%6)*.12;
  const xx=x+Math.cos(a)*r*rx,yy=y+Math.sin(a)*r*ry;
  ctx.strokeStyle=i%3?'#273b32':'#80745a';ctx.lineWidth=5+i%4;
  ctx.beginPath();ctx.moveTo(x+Math.cos(a)*44,y+Math.sin(a)*30);
  ctx.quadraticCurveTo(x+Math.cos(a+.28)*145,y+Math.sin(a+.28)*88,xx,yy);ctx.stroke();
 }
 for(let i=0;i<26;i++){
  const a=i*2.399,rad=.3+(i%6)*.12,px=x+Math.cos(a)*rx*rad,py=y+Math.sin(a)*ry*rad;
  ell(px,py,3+(i%5)*2,2+(i%3),'#97846d');
  if(i%4===0){
   ell(px,py-10,11,6,'#83687b');ell(px,py-12,8,3,'#c6b2ad');
   ctx.strokeStyle='#ddd0b4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py-5);ctx.lineTo(px,py+5);ctx.stroke();
  }
 }
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9,px=x+Math.cos(a)*(rx-16),py=y+Math.sin(a)*(ry-24);
  ell(px,py+4,13,7,'#2e3934');
  ctx.strokeStyle='#66634b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-4,py-19-(i%3)*6);ctx.stroke();
  ell(px-4,py-23-(i%3)*6,10,6,i%2?'#6c536b':'#726c63');
 }
 ctx.fillStyle='#dec6a3';ctx.textAlign='center';ctx.font='bold 17px Georgia,serif';
 ctx.shadowColor='#202524';ctx.shadowBlur=5;ctx.fillText('GLOAMJAW HOLLOW',x,y+ry-19);
 ctx.restore();
}
function drawBoss(){
 const now=P.snapshot();
 if(Math.abs(x-now.cameraX)>1150||Math.abs(y-now.cameraY)>900)return;
 if(gloamArtLoaded&&gloamIllustratedAtlas){
  const frame=gloamPose(),size=GLOAM_ART_CELL,t=now.time;
  const warning=combat.mode==='warning',striking=combat.mode==='strike';
  const recoil=striking?Math.sin((700-combat.timer)/700*Math.PI)*.06:0;
  const breath=Math.sin(t*.0031)*.012,sway=Math.sin(t*.0016)*.016;
  const flash=t-lastGloamHitAt<210;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.translate(Math.round(x),Math.round(y+24));
  ctx.rotate(sway+(striking&&combat.attack==='vine'?Math.sin(t*.023)*.03:0));
  ctx.scale(1+breath+recoil,1-breath-(warning?Math.sin(t*.018)*.02:0));
  if(flash)ctx.globalAlpha=Math.floor(t/70)%2===0?.57:1;
  if(warning&&combat.attack==='spores'){ctx.shadowColor='#d4d78e';ctx.shadowBlur=14+Math.sin(t*.017)*6}
  ctx.drawImage(gloamIllustratedAtlas,(frame%4)*size,Math.floor(frame/4)*size,size,size,-181,-336,362,362);
  ctx.restore();return;
 }
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 const tick=now.time,breath=Math.sin(tick*.0028),sway=Math.sin(tick*.0018)*7,
  furious=data.hp<MAX*.5,biting=combat.attack==='bite'&&['warning','strike'].includes(combat.mode),
  mouthStretch=biting?(combat.mode==='strike'?1.46:1.2):1+breath*.045,
  sporing=combat.attack==='spores'&&['warning','strike'].includes(combat.mode);
 ell(2,21,119,31,'#192a2595');
 // Heavy, entwined lower roots with bone-coloured thorn growth.
 ctx.lineCap='round';ctx.lineJoin='round';
 for(let i=0;i<9;i++){
  const a=Math.PI*(i/8),side=i%2?-1:1,reach=68+(i%4)*17;
  ctx.strokeStyle='#253d34';ctx.lineWidth=19-i%3*3;ctx.beginPath();
  ctx.moveTo((i-4)*9,-6);ctx.bezierCurveTo(side*30,26,Math.cos(a)*reach,18+Math.sin(a)*17,
   Math.cos(a)*(118+i%3*14),18+Math.sin(a)*11);ctx.stroke();
  ctx.strokeStyle='#66744c';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo((i-4)*9,-9);ctx.quadraticCurveTo(Math.cos(a)*reach,8,
   Math.cos(a)*(118+i%3*14),18+Math.sin(a)*11);ctx.stroke();
 }
 // Ribbed root-heart and jointed living stalk; layered shading creates volume.
 const bulb=ctx.createLinearGradient(-72,-65,83,13);
 bulb.addColorStop(0,'#27392d');bulb.addColorStop(.35,'#556c42');bulb.addColorStop(.7,'#6a6b46');bulb.addColorStop(1,'#263b33');
 ell(0,-22,72,63,bulb);ell(-20,-37,25,40,'#88905950');
 ctx.strokeStyle='#24372f';ctx.lineWidth=47;ctx.beginPath();ctx.moveTo(2,-8);
 ctx.bezierCurveTo(30,-51,-33,-92,sway,-136);ctx.stroke();
 ctx.strokeStyle='#4d764c';ctx.lineWidth=31;ctx.beginPath();ctx.moveTo(-7,-16);
 ctx.bezierCurveTo(16,-64,-28,-97,sway-5,-139);ctx.stroke();
 ctx.strokeStyle='#9aae6d';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-19,-17);
 ctx.bezierCurveTo(8,-67,-39,-98,sway-16,-140);ctx.stroke();
 // Breathing spore pods, textured stalk scales, and small serrated leaves.
 for(let i=0;i<11;i++){
  const px=Math.sin(i*1.91)*32,py=-12-i*9;
  ell(px,py,7+(i%3)*2,6,'#233c34');
  ell(px-2,py-2,4+(i%3),3,i%3?'#9ba86c':'#b29885');
 }
 for(let i=0;i<8;i++){
  const side=i%2?-1:1,yy=-30-(i%4)*26,xx=side*(25+(i%3)*9);
  poly([[xx,yy],[xx+side*31,yy-33],[xx+side*23,yy-4],[xx+side*11,yy+7]],i%3?'#536e4a':'#77905d','#304c36');
 }
 // Animated vine arms. They remain visually separate from their attack tell.
 for(let i=0;i<8;i++){
  const side=i%2?-1:1,row=Math.floor(i/2),ripple=Math.sin(tick*.0025+i*1.7)*16;
  const wind=combat.attack==='vine'&&combat.mode==='strike'?side*30:0;
  const startX=side*(25+row*9),tipX=side*(120+row*18)+wind,tipY=-16-row*14+ripple*.18;
  ctx.strokeStyle='#213f34';ctx.lineWidth=24-row*3;ctx.beginPath();ctx.moveTo(startX,-45);
  ctx.bezierCurveTo(side*(66+row*10),-130+ripple,side*(139+row*6),-88-ripple,tipX,tipY);ctx.stroke();
  ctx.strokeStyle=row%2?'#72905d':'#8ca167';ctx.lineWidth=7-row*.8;ctx.beginPath();
  ctx.moveTo(startX-3*side,-51);ctx.bezierCurveTo(side*(60+row*11),-126+ripple,
  side*(133+row*8),-92-ripple,tipX-side*2,tipY-5);ctx.stroke();
  // Thorn clusters and leaf spikes track the winding arm.
  for(let j=0;j<3;j++){
   const tx=side*(84+row*10+j*15)+wind*(j/4),ty=-86-row*9+ripple*.5+j*10;
   poly([[tx,ty],[tx+side*15,ty-20],[tx+side*10,ty+10]],j%2?'#a4b37c':'#4a6b4e','#2a4539');
   poly([[tx-side*8,ty+6],[tx-side*14,ty-1],[tx+side*3,ty]],'#d0ba83');
  }
 }
 // Shield petals behind the central bloom, each with its own rim and vein.
 ctx.save();ctx.translate(sway,-149);
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6+Math.PI/12;
  ctx.save();ctx.rotate(a);ctx.translate(0,-14);
  const rim=ctx.createLinearGradient(-30,-105,28,-17);
  rim.addColorStop(0,i%2?'#352d40':'#403246');
  rim.addColorStop(.54,i%2?'#87566d':'#704b78');
  rim.addColorStop(1,'#bc8a91');
  ctx.beginPath();ctx.moveTo(-26,-9);ctx.bezierCurveTo(-47,-54,-15,-106,0,-113);
  ctx.bezierCurveTo(22,-99,46,-49,26,-9);ctx.closePath();
  ctx.fillStyle=rim;ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#352a3e';ctx.stroke();
  ctx.strokeStyle='#d6a5a1';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(0,-100);ctx.quadraticCurveTo(-5,-53,0,-16);ctx.stroke();
  poly([[0,-101],[-8,-90],[0,-110],[8,-90]],'#dec1ae');
  ctx.restore();
 }
 // Outer pitcher head, hard rim, dark recessed mouth and bioluminescent throat.
 const head=ctx.createRadialGradient(-28,-38,12,8,10,116);
 head.addColorStop(0,furious?'#d47b87':'#c1828b');
 head.addColorStop(.35,furious?'#a4536d':'#98657c');
 head.addColorStop(.77,'#5d405d');head.addColorStop(1,'#2b2e39');
 ell(0,2,111,88,head);
 ell(0,9,96,74,'#342b42');
 ell(0,12,88,66,'#92616f');
 ell(0,13,77,56,'#352439');
 ctx.save();ctx.translate(0,12);ctx.scale(1,mouthStretch);
 const throat=ctx.createRadialGradient(5,19,5,0,0,84);
 throat.addColorStop(0,'#8d3d59');throat.addColorStop(.25,'#50213f');throat.addColorStop(.69,'#220f28');throat.addColorStop(1,'#110e22');
 ell(0,0,77,49,throat);
 ell(3,24,39,11,'#a85f7a');ell(3,27,25,5,'#d08b9b');
 ell(0,-25,49,10,'#111325');
 for(let i=0;i<10;i++){
  const px=-62+i*14,t=Math.sin((i+.5)*Math.PI/10);
  poly([[px-7,-33*t-5],[px+7,-33*t-5],[px,6-14*t]],i%2?'#efdbba':'#fbebcb','#8f7980');
  poly([[px-7,35*t+7],[px+7,35*t+7],[px,-6+14*t]],i%2?'#e4d0b3':'#f1ddbe','#8f7980');
 }
 for(let i=0;i<5;i++){const px=-28+i*15,py=-7+Math.sin(tick*.004+i)*4;
  ell(px,py,2+i%2,3,'#e6b6a966')}
 ctx.restore();
 // Armoured side cheeks and recessed light-catching eyes.
 for(const side of [-1,1]){
  ctx.save();ctx.scale(side,1);
  const cheek=ctx.createLinearGradient(65,-55,113,-4);
  cheek.addColorStop(0,'#3c4f45');cheek.addColorStop(.55,'#729271');cheek.addColorStop(1,'#283f3e');
  ctx.beginPath();ctx.moveTo(70,-48);ctx.quadraticCurveTo(113,-79,119,-35);
  ctx.quadraticCurveTo(110,7,85,24);ctx.quadraticCurveTo(111,-18,70,-48);
  ctx.fillStyle=cheek;ctx.fill();ctx.strokeStyle='#2b373a';ctx.lineWidth=3;ctx.stroke();
  ell(93,-51,19,20,'#2a383a');ell(95,-51,13,15,sporing?'#f2cf94':'#d5bc75');
  ell(98,-50,6,9,'#272d35');ell(92,-58,3,4,'#fff0c8');
  ctx.restore();
 }
 // Embossed mouth highlights, translucent sap and twitching antennae.
 ctx.strokeStyle='#edc4b0';ctx.lineWidth=4;ctx.beginPath();
 ctx.ellipse(0,12,91,65,0,Math.PI*.2,Math.PI*.83);ctx.stroke();
 ctx.strokeStyle='#304b3d';ctx.lineWidth=6;
 for(let i=-1;i<=1;i++){
  ctx.beginPath();ctx.moveTo(i*32,-58);
  ctx.quadraticCurveTo(i*46+Math.sin(tick*.003+i)*10,-115,i*58,-138);ctx.stroke();
  ell(i*58,-139,9,12,sporing?'#eadba6':'#a97c86');
  ell(i*58-3,-144,3,4,'#f6e4bf');
 }
 ctx.restore();ctx.restore();
}
function drawEffects(){
 ctx.save();const a=combat;
 if(a.mode==='warning'&&!data.defeated){
  ctx.strokeStyle='#ef9eae';ctx.lineWidth=5;ctx.beginPath();
  if(a.attack==='roots')ctx.arc(a.aim.x,a.aim.y,93,0,Math.PI*2);
  if(a.attack==='bite')ctx.arc(x,y,125,0,Math.PI*2);
  if(a.attack==='vine'){ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a.angle)*320,y+Math.sin(a.angle)*320)}
  ctx.stroke();
  if(a.attack==='spores')for(let i=-1;i<=1;i++)ell(x+i*27,y-135,13,13,'#d3cd92');
 }
 if(a.mode==='strike'&&a.attack==='roots')for(let i=0;i<9;i++){
  const t=i*Math.PI/4.5,px=a.aim.x+Math.cos(t)*85,py=a.aim.y+Math.sin(t)*85;
  ctx.strokeStyle='#57734b';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(t)*10,py-32);ctx.stroke();
 }
 if(a.mode==='strike'&&a.attack==='vine'){
  ctx.strokeStyle='#9daf77';ctx.lineWidth=19;ctx.beginPath();ctx.moveTo(x,y-35);
  ctx.quadraticCurveTo(x+Math.cos(a.angle+1)*160,y+Math.sin(a.angle+1)*160,
   x+Math.cos(a.angle)*321,y+Math.sin(a.angle)*321);ctx.stroke();
 }
 for(const sp of a.spores){ell(sp.x,sp.y,13,13,'#c0ca81');ell(sp.x-3,sp.y-4,4,4,'#e9efae')}
 for(const arrow of a.arrows){
  ctx.save();ctx.translate(arrow.x,arrow.y);ctx.rotate(Math.atan2(arrow.vy,arrow.vx));
  ctx.strokeStyle='#e1c48d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(7,0);ctx.stroke();
  poly([[12,0],[4,-5],[4,5]],'#bbc7c0');ctx.restore();
 }
 if(['bow','crossbow'].includes(state.equipped)){
  ctx.save();ctx.translate(state.x+19,state.y-42);
  ctx.strokeStyle='#a77d4e';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-20);
  ctx.quadraticCurveTo(state.equipped==='bow'?22:34,0,0,21);ctx.stroke();
  ctx.strokeStyle='#eaddaf';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,21);ctx.stroke();
  if(state.equipped==='crossbow'){ctx.strokeStyle='#986f48';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(22,0);ctx.stroke()}
  ctx.restore();
 }
 ctx.restore();
}
window.__gloamAddon={y:y+10,arena,update,drawGround,drawBoss,drawEffects,craftLocked,crafted,useTool,
 snapshot:()=>({build:130,hp:data.hp,defeated:data.defeated,discovered:data.discovered,position:{x,y},arrows:state.arrows,bow:state.tools.bow,crossbow:state.tools.crossbow,combat:combat.mode,shots:combat.arrows.length,spores:combat.spores.length,artReady:gloamArtLoaded,artError:gloamArtError,artPose:gloamPose()})};
window.__gloamQA=window.__gloamAddon.snapshot;
})();