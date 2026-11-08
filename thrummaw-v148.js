/* V148 Thrummaw: original desert ambush boss. */
(()=>{'use strict';
const p=window.__gloamPort;if(!p)return;
const {state,ctx}=p,X=8560,Y=1680,TAU=Math.PI*2;
const s={hp:240,phase:'buried',alert:0,charge:0,turn:0,player:0,enemy:0,defend:false,cool:0,lock:false,shake:0,fx:[],wait:true};
let last=0;const rocks=[[-220,-90],[-20,205],[235,75],[140,-235],[-310,180]].map(([x,y],i)=>({x:X+x,y:Y+y,r:36+i%3*9}));
const safeRock=()=>rocks.some(r=>Math.hypot(state.x-r.x,state.y-r.y)<r.r+18);
const distance=()=>Math.hypot(state.x-X,state.y-Y),now=()=>p.snapshot().time;
const hud=document.createElement('div');hud.id='thrummawHud';
hud.style.cssText='display:none;position:fixed;z-index:39;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(95vw,540px);box-sizing:border-box;padding:12px;background:#28202aef;color:#ffe5ae;border:2px solid #b9925b;border-radius:12px;font:13px Georgia,serif;box-shadow:0 4px 25px #000a';
hud.innerHTML='<div style="display:flex;justify-content:space-between"><b>THRUMMAW · THE SAND BELOW</b><button id="thrumMode">WAIT</button></div><div id="thrumMsg" style="margin:8px 0">Something stirs beneath the dunes.</div><div style="background:#15141a;height:11px;border:1px solid #c19b64;border-radius:5px;overflow:hidden"><div id="thrumHp" style="background:#b46d58;height:100%;width:100%"></div></div><div style="display:flex;justify-content:space-between;margin:6px 0"><span id="thrumHealth">240 / 240</span><span id="thrumReady">Preparing...</span></div><div id="thrumActions" style="display:flex;gap:5px;flex-wrap:wrap"></div>';
document.body.append(hud);
const actions=['Attack','Tool','Heal','Defend','Distract','Retreat'],bar=document.getElementById('thrumActions');
for(const action of actions){const b=document.createElement('button');b.textContent=action;b.dataset.action=action.toLowerCase();b.style.cssText='border:1px solid #b9925b;border-radius:6px;background:#544052;color:#ffe6b7;padding:9px;min-height:39px;font:600 13px Georgia,serif';bar.append(b);b.addEventListener('click',()=>act(b.dataset.action))}
document.getElementById('thrumMode').onclick=()=>{s.wait=!s.wait;document.getElementById('thrumMode').textContent=s.wait?'WAIT':'ACTIVE'};
function message(t){document.getElementById('thrumMsg').textContent=t}
function emerge(){s.phase='rising';s.charge=0;s.shake=now();p.notify('🏜️ The dunes erupt! THRUMMAW rises from beneath the sand!')}
function begin(){s.phase='battle';s.player=0;s.enemy=0;hud.style.display='block';message('The ground is alive. Wait for your turn!');p.memory('Thrummaw erupted from the Sunscorched Dunes after tracking Haigen by vibration.')}
function end(){hud.style.display='none';s.player=0;s.enemy=0}
function act(a){
 if(s.phase!=='battle')return;
 if(a==='retreat'){s.phase='retreat';s.lock=true;end();p.notify('Haigen escapes the shifting sands.');return}
 if(s.player<2200)return;
 if(a==='heal'){if(!state.potions){message('No healing salves left.');return}state.potions--;state.health=Math.min(100,state.health+38);message('Haigen uses a healing salve.');p.save()}
 else if(a==='defend'){s.defend=true;message('Haigen braces for impact.')}
 else if(a==='distract'){s.enemy=Math.max(0,s.enemy-1700);message('Haigen throws a stone. Thrummaw follows the vibration!');if(state.stone>0)state.stone--}
 else {const eq=state.equipped,tool=a==='tool';if(tool&&!['axe','pickaxe','bow','crossbow'].includes(eq)){message('Equip a weapon before using Tool.');return}
 let dmg=tool?22:13;if(eq==='axe')dmg+=4;if(eq==='pickaxe')dmg+=3;
 if(['bow','crossbow'].includes(eq)){if(!state.arrows){message('No arrows!');return}state.arrows--;dmg+=eq==='crossbow'?13:7}
 if(s.phase==='battle'){s.hp=Math.max(0,s.hp-dmg);p.startHaigenAction('swing',320);p.soundEffect('swing');message('Haigen strikes the exposed jaw for '+dmg+' damage.');p.save();}
 if(s.hp<=0){s.phase='defeated';end();p.memory('Haigen defeated Thrummaw, the enormous predator beneath the desert sands.');p.notify('🏆 THRUMMAW DEFEATED! The dunes fall silent.');p.save();return}}
 s.player=0;
}
function update(dt){
 const t=now(),d=distance(),step=Math.min(50,Math.max(0,dt));
 if(s.phase==='defeated')return;
 if(s.lock&&d>540)s.lock=false;
 if(s.phase==='retreat'){if(!s.lock)s.phase='buried';return}
 if(s.phase==='buried'){
  if(d<560){s.alert=Math.min(100,s.alert+step*(safeRock()?.001:state.resting?.002:.016));if(d<260&&!safeRock())s.alert+=step*.055}
  else s.alert=Math.max(0,s.alert-step*.013);
  if(s.alert>=100&&!s.lock)emerge();
 }else if(s.phase==='rising'){if(t-s.shake>1550)begin()}
 else if(s.phase==='battle'){
  if(d>660||p.snapshot().collapsed){s.phase='retreat';s.lock=true;end();return}
  s.player=Math.min(2200,s.player+step);
  if(!(s.wait&&s.player>=2200&&!state.autonomy))s.enemy+=step;
  if(s.enemy>=3900){s.enemy=0;const hits=[['a crushing jaw strike',22],['a spray of sand',11],['a whipping sensory tendril',16],['a subterranean shockwave',18]],h=hits[s.turn++%hits.length],damage=s.defend?Math.ceil(h[1]*.35):h[1];s.defend=false;if(safeRock()){message('Thrummaw slams into the stone refuge! Haigen is safe.');}else p.takeDamage(damage,'Thrummaw '+h[0],false,{x:X,y:Y});if(!safeRock())message('Thrummaw attacks with '+h[0]+'! '+damage+' damage.')}
  if(state.autonomy&&s.player>=2200)act(state.health<45&&state.potions?'heal':'attack');
  document.getElementById('thrumHealth').textContent=Math.ceil(s.hp)+' / 240';
  document.getElementById('thrumHp').style.width=s.hp/240*100+'%';
  document.getElementById('thrumReady').textContent=s.player>=2200?'HAIGEN READY':'ATB '+Math.round(s.player/22)+'%';
  for(const b of bar.children)b.disabled=s.player<2200&&b.dataset.action!=='retreat';
 }
}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
function ground(){
 if(s.phase==='defeated')return;
 const t=now(),d=distance(),pulse=Math.sin(t*.009)*3;
 ctx.save();
 for(let i=0;i<13;i++){const a=i*2.4,r=65+(i%4)*38;ellipse(X+Math.cos(a)*r,Y+Math.sin(a)*r*.6,9+i%3*3,3,'#c1a26c')}
 for(const r of rocks){ellipse(r.x,r.y+8,r.r+8,13,'#a78960');ellipse(r.x,r.y,r.r,r.r*.52,'#6f6860');ellipse(r.x-8,r.y-8,r.r*.63,r.r*.28,'#aaa18b')}
 if(s.phase==='buried'&&s.alert>12){for(let k=0;k<3;k++){ctx.strokeStyle='rgba(124,84,45,'+(s.alert/180)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X,Y,35+k*24+pulse,15+k*10,0,0,TAU);ctx.stroke()}}
 if(s.phase==='rising'){const q=Math.min(1,(t-s.shake)/1550);for(let k=0;k<4;k++){ctx.strokeStyle='rgba(120,77,43,'+(1-q)*.7+')';ctx.lineWidth=3+k;ctx.beginPath();ctx.ellipse(X,Y,30+q*170+k*12,12+q*75+k*7,0,0,TAU);ctx.stroke()}}
 ctx.restore();
}
function creature(){
 if(!['rising','battle'].includes(s.phase))return;
 const t=now(),rise=s.phase==='rising'?Math.min(1,(t-s.shake)/1550):1,bob=Math.sin(t*.002)*3;
 ctx.save();ctx.translate(X,Y+35-rise*75+bob);ctx.scale(.35+.65*rise,.35+.65*rise);
 ellipse(0,48,112,25,'#92734c');ellipse(0,15,85,80,'#56433d');ellipse(0,-6,74,72,'#80634c');
 for(let i=0;i<7;i++){const a=(i-3)*.35;ctx.save();ctx.rotate(a);ellipse(0,-44-i%2*7,15,35,i%2?'#9d805f':'#b99a72');ctx.restore()}
 ellipse(0,0,58,43,'#342a2c');ellipse(0,9,45,28,'#b67a6b');ellipse(0,16,29,17,'#261c24');
 for(let i=0;i<7;i++){const x=-42+i*14;ctx.fillStyle='#f0d9ac';ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x+6,0);ctx.lineTo(x+11,-20);ctx.fill()}
 for(let i=0;i<3;i++){const x=(i-1)*26+Math.sin(t*.004+i)*6;ctx.strokeStyle='#9b736d';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,9);ctx.quadraticCurveTo(x*1.7,52+Math.sin(t*.004+i)*10,x*2,76);ctx.stroke();ellipse(x*2,76,8,10,'#c28b83')}
 ellipse(-51,-43,8,7,'#d7a24c');ellipse(51,-43,8,7,'#d7a24c');ellipse(-51,-43,3,3,'#21151a');ellipse(51,-43,3,3,'#21151a');
 ctx.restore();
}
window.__thrummaw={update,ground,creature,y:Y,snapshot:()=>({...s,rocks})};
})();
