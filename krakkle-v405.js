/* Krakkle V405: deterministic 4x4 transparent crab atlas + real-time beach encounter. */
(()=>{'use strict';
const p=window.__gloamPort;if(!p)return;
const {state,ctx}=p,TAU=Math.PI*2,HOME={x:2300,y:7750};
const atlas=document.createElement('canvas');atlas.width=atlas.height=512;
const ac=atlas.getContext('2d');ac.imageSmoothingEnabled=false;
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function crab(c,dir,frame){
 c.save();c.translate(64,70);const wig=Math.sin(frame*Math.PI/2)*5;
 if(dir===2)c.scale(-1,1);
 oval(c,0,39,49,9,'#273e3a70');
 for(let side of [-1,1]){
  for(let i=0;i<4;i++){
   const x=side*(30+i*7),y=2+i*9+wig*(i%2?1:-1)*.35;
   c.strokeStyle='#4a2622';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(side*29,5);c.lineTo(x+side*17,y+12);c.lineTo(x+side*25,y+21);c.stroke();
   c.strokeStyle='#bd5632';c.lineWidth=5;c.beginPath();c.moveTo(side*29,5);c.lineTo(x+side*17,y+12);c.stroke();
  }
 }
 oval(c,0,-1,44,32,'#512b28');oval(c,0,-8,42,30,'#bc4c2b');oval(c,0,-15,36,19,'#e67a39');
 for(let i=0;i<11;i++){const x=Math.sin(i*2.4)*34,y=Math.cos(i*1.9)*19-10;oval(c,x,y,3+i%3,2+i%2,i%3?'#e9c28a':'#627c53')}
 for(let i=0;i<6;i++){const x=-33+i*13; c.fillStyle='#f3b86a';c.beginPath();c.moveTo(x,-24);c.lineTo(x+5,-39-i%2*4);c.lineTo(x+11,-23);c.fill()}
 for(let side of [-1,1]){
  c.strokeStyle='#74352c';c.lineWidth=13;c.beginPath();c.moveTo(side*31,7);c.lineTo(side*49,-7+wig*.4);c.stroke();
  oval(c,side*51,-10+wig*.4,20,17,'#cf5a2d');oval(c,side*57,-14+wig*.4,13,9,'#f28c45');
  c.fillStyle='#542b29';c.beginPath();c.moveTo(side*51,-9);c.lineTo(side*75,-30+wig*.4);c.lineTo(side*70,-2);c.fill();
 }
 if(dir!==0){oval(c,-15,-5,6,7,'#241e25');oval(c,15,-5,6,7,'#241e25');oval(c,-14,-6,2,3,'#ffd083');oval(c,16,-6,2,3,'#ffd083')}
 else {oval(c,0,9,24,7,'#8e3e2c')}
 c.restore();
}
for(let d=0;d<4;d++)for(let f=0;f<4;f++){ac.save();ac.translate(f*128,d*128);crab(ac,d,f);ac.restore()}
const s={x:HOME.x,y:HOME.y,hp:320,maxHp:320,mode:'hidden',timer:0,attack:0,lastHit:-99999,heading:0,dir:1,frame:0,noticed:false,defeated:false};
function dist(){return Math.hypot(state.x-s.x,state.y-s.y)}
function strike(){
 const t=p.snapshot().time,eq=state.equipped;
 if(!['axe','pickaxe','bow','crossbow'].includes(eq)||!['fight','water'].includes(s.mode)||dist()>205)return false;
 if(t-s.lastHit<550)return true;
 if(!['bow','crossbow'].includes(eq)&&dist()>110)return false;
 if(['bow','crossbow'].includes(eq)){if(!state.arrows)return true;state.arrows--}
 s.lastHit=t;s.hp=Math.max(0,s.hp-(eq==='crossbow'?30:eq==='bow'?24:eq==='axe'?21:19));
 p.startHaigenAction('swing',320);p.soundEffect('swing');
 if(!s.hp){s.mode='defeated';s.defeated=true;p.memory('Haigen defeated Krakkle, the Buried King of Saltwick Beach.');p.notify('🦀 KRAKKLE DEFEATED! The ancient shore falls silent.');p.save()}
 return true;
}
function update(dt){
 const step=Math.min(50,Math.max(0,dt)),d=dist(),t=p.snapshot().time;
 if(s.defeated)return;
 if(s.mode==='hidden'){
  if(d<410&&!s.noticed){s.noticed=true;p.notify('🐚 Something enormous shifts beneath the sand...')}
  if(d<190){s.mode='emerge';s.timer=0;p.notify('💥 THE SAND ERUPTS! KRAKKLE, THE BURIED KING!')}
 }else if(s.mode==='emerge'){s.timer+=step;if(s.timer>1300){s.mode='fight';s.timer=0}}
 else if(s.mode==='fight'||s.mode==='water'){
  if(d>1100){s.x+=(HOME.x-s.x)*Math.min(1,step*.0005);s.y+=(HOME.y-s.y)*Math.min(1,step*.0005);return}
  s.timer+=step;s.attack+=step;
  const a=Math.atan2(state.y-s.y,state.x-s.x),speed=s.mode==='water'?.075:.048;
  const vx=Math.cos(a)*step*speed,vy=Math.sin(a)*step*speed;
  s.x=Math.max(HOME.x-520,Math.min(HOME.x+520,s.x+vx));
  s.y=Math.max(HOME.y-470,Math.min(HOME.y+480,s.y+vy));
  s.dir=Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?(Math.cos(a)<0?2:3):(Math.sin(a)<0?0:1);
  s.frame=Math.floor(t/170)%4;
  s.mode=s.y>HOME.y+140?'water':'fight';
  if(s.attack>2300){s.attack=0;if(d<165)p.takeDamage(13,'Krakkle crushing claw',false,{x:s.x,y:s.y});}
  if(s.hp<160&&s.timer>9000){s.mode='burrow';s.timer=0;p.notify('🦀 Krakkle vanishes beneath the sand!')}
 }else if(s.mode==='burrow'){
  s.timer+=step;
  if(s.timer>1600){s.x=Math.max(HOME.x-450,Math.min(HOME.x+450,state.x+160));s.y=Math.max(HOME.y-350,Math.min(HOME.y+450,state.y+120));s.mode='emerge';s.timer=500}
 }
}
function draw(){
 if(s.defeated)return;
 ctx.save();
 if(s.mode==='hidden'){oval(ctx,s.x,s.y,58,16,'#bd9562');oval(ctx,s.x+8,s.y-7,18,10,'#bc5832');ctx.restore();return}
 if(s.mode==='burrow'){oval(ctx,s.x,s.y,65,22,'#ac8155');ctx.restore();return}
 const rise=s.mode==='emerge'?Math.min(1,s.timer/1100):1;
 if(s.mode==='water'){oval(ctx,s.x,s.y+20,80,25,'#569eaf99');ctx.strokeStyle='#c0e9e7';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,s.y+20,79,24,0,0,TAU);ctx.stroke()}
 ctx.globalAlpha=.3+.7*rise;
 ctx.drawImage(atlas,s.frame*128,s.dir*128,128,128,s.x-88,s.y-140*rise,176,176);
 if(['fight','water'].includes(s.mode)){ctx.fillStyle='#271f25';ctx.fillRect(s.x-65,s.y-147,130,9);ctx.fillStyle='#d56d4c';ctx.fillRect(s.x-63,s.y-145,126*s.hp/s.maxHp,5)}
 ctx.restore();
}
window.__krakkle={update,draw,strike,atlas,snapshot:()=>({...s})};
})();