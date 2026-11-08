/* Haigen's World V147 · Gloamjaw hidden bloom and boss-only ATB prototype.
   Additive adapter. Preserves approved Gloamjaw atlas, attack FX, saves and normal wildlife. */
(()=>{'use strict';
const boss=window.__gloamAddon,port=window.__gloamPort;
if(!boss||!port){console.warn('V147: Gloamjaw bridge unavailable');return}
const {state,ctx}=port,data=state.gloamBoss;
const X=930,Y=2710,MAX=180,TAU=Math.PI*2;
const old={update:boss.update,ground:boss.drawGround,draw:boss.drawBoss,effects:boss.drawEffects,tool:boss.useTool,revive:boss.revive,snapshot:boss.snapshot};
if(typeof data.awakened!=='boolean')data.awakened=!!data.defeated;
const f={risingAt:0,rising:false,seenFlower:false,player:0,enemy:0,turn:0,active:false,
       defended:false,retreatLock:false,message:'',messageUntil:0,wait:true};
const $=id=>document.getElementById(id),distance=()=>Math.hypot(state.x-X,state.y-Y);
const time=()=>port.snapshot().time,notify=msg=>port.notify(msg);
const styles=document.createElement('style');
styles.textContent=`
#v147ATB{display:none;position:fixed;z-index:38;left:50%;transform:translateX(-50%);
 bottom:calc(9px + env(safe-area-inset-bottom,0px));width:min(580px,96vw);padding:11px;
 border:2px solid #ad956b;border-radius:12px;background:#211c28f2;color:#f6e5c2;
 box-shadow:0 4px 24px #000b;font:13px Georgia,serif}
#v147ATB .atbTop{display:flex;align-items:center;justify-content:space-between;gap:9px}
#v147ATB .atbGauges{display:grid;grid-template-columns:70px 1fr;gap:5px 9px;align-items:center;margin:8px 0}
#v147ATB .atbTrack{height:11px;border:1px solid #8f806b;border-radius:6px;overflow:hidden;background:#14161d}
#v147ATB .atbFill{height:100%;width:0;background:linear-gradient(90deg,#658687,#d4c183)}
#v147ATB #v147EnemyFill{background:linear-gradient(90deg,#773d51,#d17483)}
#v147ATB .atbCommands{display:flex;gap:5px;flex-wrap:wrap}
#v147ATB .atbCommands button,#v147ATB #v147Wait{background:#504156;color:#f7e8c9;
 border:1px solid #ad956b;border-radius:6px;padding:9px 11px;font:600 13px Georgia,serif;min-height:39px;touch-action:manipulation}
#v147ATB .atbCommands button:disabled{opacity:.43}
#v147ATB #v147Log{min-height:19px;color:#e2caa3;margin-top:5px}
@media(max-width:500px){#v147ATB{font-size:11px;padding:8px}
#v147ATB .atbCommands button{padding:7px;font-size:12px}}
`;document.head.append(styles);
const panel=document.createElement('section');panel.id='v147ATB';panel.setAttribute('aria-label','Gloamjaw tactical boss battle');
panel.innerHTML='<div class="atbTop"><strong>⚔️ GLOAMJAW · THE HUNGRY BLOOM</strong><button id="v147Wait" type="button">WAIT mode</button></div>'+
 '<div class="atbGauges"><span>HAIGEN</span><div class="atbTrack"><div class="atbFill" id="v147PlayerFill"></div></div>'+
 '<span>GLOAMJAW</span><div class="atbTrack"><div class="atbFill" id="v147EnemyFill"></div></div></div>'+
 '<div class="atbCommands"><button data-act="attack">Attack</button><button data-act="tool">Tool</button><button data-act="item">Heal</button>'+
 '<button data-act="defend">Defend</button><button data-act="flee">Retreat</button></div><div id="v147Log">A strange flower has become something dreadful.</div>';
document.body.append(panel);
const buttons=[...panel.querySelectorAll('[data-act]')];
function log(message){f.message=message;f.messageUntil=time()+2500;$('v147Log').textContent=message}
function showUI(v){panel.style.display=v?'block':'none';if(!v){const oldHud=$('gloamBossHud');if(oldHud)oldHud.style.display='none';}}
function setCharge(){
 $('v147PlayerFill').style.width=Math.min(100,f.player/2150*100)+'%';
 $('v147EnemyFill').style.width=Math.min(100,f.enemy/3450*100)+'%';
 for(const b of buttons)b.disabled=!f.active||(f.player<2150&&b.dataset.act!=='flee');
}
function drawFlower(now){
 const t=now.time,sw=Math.sin(t*.0027)*2,px=X,py=Y,dy=f.rising?Math.min(26,(t-f.risingAt)/55):0;
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#263b31';ctx.beginPath();ctx.ellipse(px,py+5,31,11,0,0,TAU);ctx.fill();
 ctx.fillStyle='#5b6d45';ctx.beginPath();ctx.ellipse(px+5,py+1,14,5,-.2,0,TAU);ctx.fill();
 ctx.strokeStyle='#394e33';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();
 ctx.moveTo(px,py);ctx.quadraticCurveTo(px-4+sw,py-18,px+sw,py-39-dy);ctx.stroke();
 ctx.fillStyle='#71875a';ctx.beginPath();ctx.ellipse(px-12,py-20,16,6,-.4,0,TAU);ctx.fill();
 ctx.beginPath();ctx.ellipse(px+11,py-14,14,5,.35,0,TAU);ctx.fill();
 ctx.translate(px+sw,py-42-dy);
 ctx.shadowColor='#d9b3da';ctx.shadowBlur=9;
 for(let i=0;i<7;i++){ctx.save();ctx.rotate(i*TAU/7);ctx.fillStyle=i%2?'#ae759b':'#c29db4';
  ctx.strokeStyle='#503e58';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-9,6,11,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}
 ctx.shadowBlur=0;ctx.fillStyle='#f0d5ab';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();
 ctx.fillStyle='#81576d';ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function flowerGround(){
 // The original clearing remains intact; hide the conspicuous arena label
 // and arena decorations while the boss is disguised.
 const t=time();ctx.save();
 for(let i=0;i<16;i++){const a=i*2.399,rad=35+(i%4)*22,px=X+Math.cos(a)*rad,py=Y+Math.sin(a)*rad*.64;
  ctx.fillStyle=i%3?'#476146':'#66554c';ctx.fillRect(px,py,3+i%3,2);}
 if(f.rising){const p=Math.min(1,(t-f.risingAt)/1550);
  for(let k=0;k<3;k++){ctx.strokeStyle='rgba(146,116,98,'+(.38-p*.28)+')';ctx.lineWidth=2+k*2;
   ctx.beginPath();ctx.ellipse(X,Y,26+p*55+k*12,14+p*32+k*8,0,0,TAU);ctx.stroke();}
  for(let i=0;i<12;i++){const a=i*2.399,spread=(15+110*p)*(i%4+2)/5;
   ctx.fillStyle=i%2?'#6e604a':'#a18d6e';ctx.fillRect(X+Math.cos(a)*spread,Y+Math.sin(a)*spread*.6,4+i%3*2,3);}
 }
 ctx.restore();
}
function awaken(){
 f.rising=true;f.risingAt=time();
 notify('🌿 The flower twists. The earth begins to split!');
}
function startBattle(){
 if(data.defeated||f.active||f.retreatLock)return;
 f.active=true;f.player=0;f.enemy=0;f.turn=0;f.defended=false;
 showUI(true);log('Gloamjaw has emerged! Choose your action when Haigen is ready.');
 notify('⚔️ Gloamjaw! Boss battle begins. Normal wildlife remains real-time.');
}
function endBattle(){f.active=false;showUI(false);f.player=0;f.enemy=0;}
function bossDamage(amount){
 data.hp=Math.max(0,(Number(data.hp)||MAX)-amount);
 const oldBar=$('gloamBossFill');if(oldBar)oldBar.style.width=data.hp/MAX*100+'%';
 const value=$('gloamBossValue');if(value)value.textContent=Math.ceil(data.hp)+' / '+MAX;
 if(data.hp>0){port.save();return}
 data.defeated=true;data.awakened=true;f.rising=false;endBattle();
 port.memory('Haigen defeated Gloamjaw after uncovering the disguised flower deep in the woodland. Crossbow crafting unlocked.');
 notify('🌿 GLOAMJAW DEFEATED! Crossbow crafting unlocked.');port.save();
}
function act(action){
 if(!f.active||data.defeated)return;
 if(action==='flee'){endBattle();f.retreatLock=true;log('Haigen retreats. Get clear before trying again.');notify('🏃 Haigen escaped Gloamjaw.');return}
 if(f.player<2150)return;
 if(action==='attack'||action==='tool'){
  const eq=state.equipped,level=Number(state.tools?.[eq])||0;
  const ranged=eq==='bow'||eq==='crossbow';
  let damage=action==='tool'?15:12;
  if(ranged){if(!level||state.arrows<1){log('No arrows. Switch gear or choose another action.');return}
   state.arrows--;damage=action==='tool'?(eq==='crossbow'?27:21)+3*level:(eq==='crossbow'?20:15)+3*level;
  }else if(eq==='axe')damage=action==='tool'?18:14;
  else if(eq==='pickaxe')damage=action==='tool'?16:13;
  else if(action==='tool'){log('Equip an axe, pickaxe or ranged weapon to use Tool.');return}
  f.player=0;port.startHaigenAction('swing',330);port.soundEffect('swing');
  log('Haigen strikes the exposed bloom for '+damage+' damage.');
  bossDamage(damage);
 }else if(action==='item'){
  if((Number(state.potions)||0)<1){log('No healing salves in the backpack.');return}
  state.potions--;state.health=Math.min(100,(Number(state.health)||0)+38);
  f.player=0;log('Haigen uses a healing salve (+38 health).');port.save();
 }else if(action==='defend'){
  f.defended=true;f.player=0;log('Haigen braces. Next hit will be reduced.');
 }else return;
 setCharge();
}
buttons.forEach(b=>b.addEventListener('click',()=>act(b.dataset.act)));
$('v147Wait').addEventListener('click',()=>{
 f.wait=!f.wait;$('v147Wait').textContent=f.wait?'WAIT mode':'ACTIVE mode';
 log(f.wait?'Wait mode: enemy gauge pauses while Haigen chooses.':'Active mode: the enemy keeps charging.');
});
function enemyTurn(){
 f.enemy=0;
 const attacks=[['a sweeping root strike',13],['a cloud of stinging spores',11],['a snapping thorn-vine',16],['a hungry bite',21]];
 const [name,hurt]=attacks[f.turn++%attacks.length],amount=f.defended?Math.ceil(hurt*.35):hurt;
 f.defended=false;
 port.takeDamage(amount,'Gloamjaw '+name,false,{x:X,y:Y});
 log('Gloamjaw unleashes '+name+'! '+amount+' damage.');
}
function update(dt){
 const r=distance(),t=time();
 const hud=$('gloamBossHud');
 if(hud){
  const showing=(data.awakened||f.rising)&&!data.defeated&&r<520;
  hud.style.display=showing?'block':'none';
  if(showing){hud.setAttribute('aria-valuenow',String(Math.ceil(data.hp)));
   $('gloamBossFill').style.width=Math.max(0,data.hp/MAX*100)+'%';
   $('gloamBossValue').textContent=Math.ceil(data.hp)+' / '+MAX;}
 }
 if(data.defeated){if(f.active)endBattle();return}
 if(f.retreatLock&&r>445)f.retreatLock=false;
 if(!data.awakened){
  if(!f.rising){
   if(!f.seenFlower&&r<230){f.seenFlower=true;notify('🌺 An unusual flower sways without a breeze.')}
   if(r<119&&!port.snapshot().collapsed)awaken();
  }else if(t-f.risingAt>=1550){
   f.rising=false;data.awakened=true;data.discovered=true;
   port.memory('An innocent-looking flower erupted from Gloamjaw Hollow and revealed a monstrous hungry bloom.');
   port.save();if(r<330&&!f.retreatLock)startBattle();
  }
  return;
 }
 if(!f.active&&r<320&&!f.retreatLock&&!port.snapshot().collapsed)startBattle();
 if(!f.active)return;
 if(r>485||port.snapshot().collapsed){endBattle();f.retreatLock=true;return}
 // ATB gauges only advance inside a boss encounter. Normal world creatures
 // continue running their original independent update systems.
 const step=Math.min(60,Math.max(0,dt));
 if(f.player<2150)f.player=Math.min(2150,f.player+step);
 const choosing=f.wait&&f.player>=2150&&!state.autonomy;
 if(!choosing)f.enemy+=step;
 if(f.enemy>=3450)enemyTurn();
 if(state.autonomy&&f.player>=2150){
  act(state.health<45&&state.potions>0?'item':'attack');
 }
 if(t>f.messageUntil&&f.player>=2150&&f.messageUntil>0)
  $('v147Log').textContent='Haigen is ready. Choose Attack, Tool, Heal or Defend.';
 setCharge();
}
boss.update=update;
boss.drawGround=function(){if(!data.awakened)flowerGround();else old.ground()};
boss.drawBoss=function(){
 if(data.defeated||data.awakened){old.draw();return}
 if(!f.rising){drawFlower(port.snapshot());return}
 const p=Math.min(1,(time()-f.risingAt)/1550);
 if(p<.35)drawFlower(port.snapshot());
 if(p>.27){
  ctx.save();ctx.globalAlpha=Math.min(1,(p-.27)/.6);
  const scale=.25+.75*Math.min(1,(p-.27)/.73);
  ctx.translate(X,Y);ctx.scale(scale,scale);ctx.translate(-X,-Y);
  old.draw();ctx.restore();
 }
};
boss.drawEffects=function(){if(data.awakened)old.effects()};
boss.useTool=function(){
 if(f.active&&distance()<510){notify('⚔️ Choose your action in the boss battle menu.');return true}
 if(!data.awakened&&distance()<145){if(!f.rising)awaken();return true}
 return old.tool();
};
boss.revive=function(){
 const ok=old.revive();if(!ok)return false;
 data.awakened=false;data.discovered=false;f.rising=false;f.seenFlower=false;
 f.retreatLock=false;endBattle();port.save();return true;
};
boss.snapshot=()=>({...old.snapshot(),build:147,awakened:data.awakened,revealing:f.rising,
 atbActive:f.active,playerGauge:Math.round(f.player/2150*100),enemyGauge:Math.round(f.enemy/3450*100),atbWaitMode:f.wait});
window.__v147BossQA=()=>boss.snapshot();
})();