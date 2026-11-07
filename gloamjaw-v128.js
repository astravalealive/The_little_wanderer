/* Gloamjaw Hollow · Haigen's World V128
   Original boss art and tactics. Save-compatible, isolated from Ember. */
(()=>{'use strict';
const P=window.__gloamPort;
if(!P){console.error('Gloamjaw: game port unavailable');return}
const {state,objects,woodlandDetails,ctx}=P;
const x=1495,y=2700,rx=300,ry=243,MAX=180;
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
const ell=(px,py,a,b,colour)=>{ctx.fillStyle=colour;ctx.beginPath();ctx.ellipse(px,py,a,b,0,0,Math.PI*2);ctx.fill()};
const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke()}};
function finish(){
 data.hp=0;data.defeated=true;combat.mode='dead';combat.spores=[];
 P.memory('Haigen defeated Gloamjaw, the hungry bloom hidden in the southern woodland clearing. The crossbow blueprint is unlocked.');
 P.notify('🌿 GLOAMJAW DEFEATED! Crossbow crafting unlocked.');P.save();
}
function damageBoss(dmg){
 if(data.defeated)return false;
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
 const screen=P.snapshot();if(Math.abs(x-screen.cameraX)>1100||Math.abs(y-screen.cameraY)>900)return;
 ctx.save();ell(x,y,rx+20,ry+16,'#38543b');ell(x,y,rx,ry,'#64724f');
 ell(x,y+15,246,182,'#4b5e43');ctx.lineCap='round';
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8;ctx.strokeStyle=i%2?'#324b37':'#84694d';ctx.lineWidth=5+i%4;
  ctx.beginPath();ctx.moveTo(x+Math.cos(a)*30,y+Math.sin(a)*22);
  ctx.quadraticCurveTo(x+Math.cos(a+.2)*145,y+Math.sin(a+.2)*104,
   x+Math.cos(a)*263,y+Math.sin(a)*189);ctx.stroke();
 }
 for(let i=0;i<16;i++){const a=i*2.399,r=.3+(i%5)*.15;ell(x+Math.cos(a)*r*279,y+Math.sin(a)*r*210,7+i%5*3,4+i%3,'#796b58')}
 ctx.fillStyle='#ead9ab';ctx.font='bold 18px Georgia,serif';ctx.textAlign='center';
 ctx.fillText('GLOAMJAW HOLLOW',x,y+215);ctx.restore();
}
function drawBoss(){
 const now=P.snapshot();
 if(Math.abs(x-now.cameraX)>1150||Math.abs(y-now.cameraY)>900)return;
 ctx.save();ctx.translate(x,y);ell(0,21,111,27,'#1e2f2677');
 if(data.defeated){ell(0,-15,75,26,'#53465a');ell(0,-19,43,10,'#191a28');ctx.restore();return}
 const sway=Math.sin(now.time*.0025)*8,angry=data.hp<90;
 for(let i=0;i<6;i++){
  const side=i%2?-1:1,r=Math.floor(i/2),wave=Math.sin(now.time*.003+i)*16;
  ctx.strokeStyle=r%2?'#5d704a':'#466245';ctx.lineWidth=19-r*3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(side*(23+r*8),-36);
  ctx.bezierCurveTo(side*(70+r*22),-113+wave,side*(137+r*16),-58-wave,side*(161+r*13),-7);ctx.stroke();
  for(let j=0;j<3;j++){const px=side*(78+r*14+j*24),py=-66+Math.sin(now.time*.003+i+j)*6;
   poly([[px,py],[px-side*10,py-16],[px+side*12,py-2]],'#a9aa70')}
 }
 ctx.lineWidth=37;ctx.strokeStyle='#405e43';ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(-23,-64,sway,-118);ctx.stroke();
 ctx.save();ctx.translate(sway,-122);
 for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);
  poly([[-17,-19],[-31,-68],[0,-98],[31,-68],[17,-19]],i%2?'#744a70':'#88516a','#302e36');ctx.restore()}
 ell(0,0,86,69,angry?'#ae5b72':'#89516e');ell(0,7,72,50,'#3a273b');ell(0,12,59,36,'#160f21');ell(0,29,34,11,'#ac5877');
 for(let i=0;i<9;i++){const px=-57+i*14,k=Math.sin((i+.5)*Math.PI/9);
  poly([[px-6,-18-15*k],[px+6,-18-15*k],[px,1-10*k]],'#f0dfbc','#8c7675');
  poly([[px-6,30+8*k],[px+6,30+8*k],[px,14+8*k]],'#e8d6b6','#8c7675')}
 ell(-49,-38,17,18,'#c3bd87');ell(49,-38,17,18,'#c3bd87');
 ell(-49,-40,8,10,'#2c2930');ell(49,-40,8,10,'#2c2930');ell(-52,-45,3,3,'#f6f2d8');ell(46,-45,3,3,'#f6f2d8');
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
 snapshot:()=>({build:128,hp:data.hp,defeated:data.defeated,discovered:data.discovered,position:{x,y},arrows:state.arrows,bow:state.tools.bow,crossbow:state.tools.crossbow,combat:combat.mode,shots:combat.arrows.length,spores:combat.spores.length})};
window.__gloamQA=window.__gloamAddon.snapshot;
})();