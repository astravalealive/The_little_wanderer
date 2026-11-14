// V420: Two distinct Forgotten Swamps guardians. Procedural first-pass art.
(()=>{'use strict';const p=window.__gloamPort;if(!p)return;const {ctx,state}=p;
const bosses=[
 {id:'mossmaw',name:'Mossmaw',x:-3150,y:450,hx:-3150,hy:450,hp:280,max:280,phase:'hidden',clock:0,attack:0,seed:0},
 {id:'grumgullet',name:'Grumgullet',x:-2200,y:2150,hx:-2200,hy:2150,hp:230,max:230,phase:'hidden',clock:0,attack:0,seed:2}
];
const projectiles=[];let hitAt=0;
const dist=b=>Math.hypot(state.x-b.x,state.y-b.y);
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function notify(b,t){p.notify('🌿 '+b.name+': '+t)}
function strike(){
 const b=bosses.find(b=>b.phase!=='hidden'&&b.phase!=='defeated'&&dist(b)<150);
 if(!b)return false;
 const tool=state.equipped;const dmg={axe:19,pickaxe:21,bow:16,crossbow:23}[tool];
 if(!dmg)return false;
 if(p.snapshot().time-hitAt<450)return true;hitAt=p.snapshot().time;
 const vulnerable=b.phase==='stunned';
 if(!vulnerable){notify(b,'Its armour is too strong! Wait for an opening.');return true}
 b.hp=Math.max(0,b.hp-dmg);p.startHaigenAction('swing',300);p.soundEffect('hit');
 if(!b.hp){b.phase='defeated';b.clock=0;p.memory('Haigen overcame '+b.name+' in the Forgotten Swamps.');notify(b,'The swamp guardian is defeated!');p.save()}
 return true;
}
function update(dt){
 dt=Math.max(0,Math.min(dt,50));
 for(const b of bosses){
 b.clock+=dt;const d=dist(b);if(d>1){b.facingX=(state.x-b.x)/d;b.facingY=(state.y-b.y)/d;}
 if(b.phase==='hidden'){if(d<260){b.phase='rising';b.clock=0;notify(b,b.id==='mossmaw'?'The island is moving!':'The mire begins to croak!')}continue}
 if(b.phase==='defeated')continue;
 if(b.phase==='rising'&&b.clock>1700){b.phase='fight';b.clock=0}
 if(b.phase==='stunned'){if(b.clock>2500){b.phase='fight';b.clock=0}continue}
 if(b.phase!=='fight')continue;
 if(d>1200)continue;
 if(d>110){const v=Math.min(d-110,dt*(b.id==='mossmaw'?.035:.055));b.x+=((state.x-b.x)/d)*v;b.y+=((state.y-b.y)/d)*v}
 b.attack+=dt;
 if(b.attack>2400){b.attack=0;b.seed++;
 const a=Math.atan2(state.y-b.y,state.x-b.x);
 if(b.id==='mossmaw'){
 if(b.seed%3===0){b.phase='stunned';b.clock=0;notify(b,'Its shell rises, exposing its soft underside!')}
 else{for(let i=-1;i<=1;i++)projectiles.push({owner:b.id,x:b.x,y:b.y,vx:Math.cos(a+i*.23)*.22,vy:Math.sin(a+i*.23)*.22,age:0,type:'mud'})}
 }else if(b.seed%3===0){b.phase='stunned';b.clock=0;notify(b,'The toad is winded after its great leap!')}
 else{projectiles.push({owner:b.id,x:b.x,y:b.y,vx:Math.cos(a)*.33,vy:Math.sin(a)*.33,age:0,type:b.seed%2?'tongue':'bubble'})}
 }
 }
 for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(Math.hypot(q.x-state.x,q.y-state.y)<38){p.takeDamage(q.type==='tongue'?13:9,q.type==='tongue'?'Grumgullet tongue':'Swamp projectile',false,q);projectiles.splice(i,1)}
 else if(q.age>1700)projectiles.splice(i,1)}
}
function moss(b){
 ctx.save();ctx.translate(b.x,b.y);
 const face=(b.facingX||1)<0?-1:1;ctx.scale(face,1);
 const step=b.phase==='fight'?Math.sin(b.clock*.008)*4:0;
 ellipse(0,13,145,36,'#18392f88');
 // Four grounded clawed legs: heavy turtle proportions, not frog pads.
 for(const side of [-1,1])for(const rear of [0,1]){
  const x=side*(rear?91:65),y=rear?0:-57;
  ellipse(x,y+step*side,32,23,'#344c3d');
  ellipse(x+side*8,y+10+step*side,30,17,'#506b50');
  for(let j=0;j<3;j++)ellipse(x+side*(12+j*9),y+19+step*side,7,4,'#d0c59b');
 }
 // Shell is an unmistakable high-domed carapace with angular scutes.
 ellipse(-12,-69,121,92,'#253b30');
 ellipse(-12,-76,114,84,'#526a46');
 ctx.save();ctx.translate(-12,-76);
 for(let ring=0;ring<2;ring++)for(let j=0;j<7;j++){
  const ang=j*Math.PI*2/7+(ring?.25:0),rad=ring?66:35;
  const x=Math.cos(ang)*rad,y=Math.sin(ang)*rad*.68;
  ctx.strokeStyle='#253e32';ctx.lineWidth=4;
  ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;const px=x+Math.cos(a)*(ring?25:22),py=y+Math.sin(a)*(ring?19:17);if(!k)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.closePath();ctx.stroke();
  ellipse(x-4,y-4,7,4,ring?'#73875a':'#879466');
 }
 ctx.restore();
 for(let i=0;i<17;i++){const a=i*2.399;ellipse(-12+Math.cos(a)*94,-76+Math.sin(a)*59,6+i%5,4+i%3,i%2?'#668a50':'#899758')}
 // Broad snapping beak and low reptilian head, projecting ahead of shell.
 ellipse(89,-62,49,37,'#3c5945');
 ellipse(110,-55,42,24,'#667d57');
 ctx.fillStyle='#b4a87c';ctx.beginPath();ctx.moveTo(120,-43);ctx.lineTo(146,-39);ctx.lineTo(123,-25);ctx.lineTo(113,-38);ctx.fill();
 ellipse(113,-77,12,11,'#d5a95b');ellipse(116,-77,4,7,'#192b25');
 ellipse(133,-54,4,3,'#25382e');
 if(b.phase==='stunned'){ellipse(80,-13,50,11,'#a99274');ellipse(100,-7,24,6,'#c6a88c')}
 ctx.restore();
}
const atlasImage=new Image();atlasImage.src='./assets/Grumgullet_Sprite_Sheet.png?v=421';
const spriteFrames={idle:[[608,58,116,125],[718,58,116,125],[827,58,116,125],[937,58,116,125]],walk:[[1082,59,115,125],[1194,59,115,125],[1308,59,115,125],[1418,59,115,125]],tongue:[[8,257,145,123],[157,257,145,123],[307,257,145,123],[454,257,145,123],[598,257,145,123],[729,257,125,123]],bubble:[[869,258,154,123],[1025,258,154,123],[1180,258,154,123],[1334,258,154,123]],stunned:[[1091,441,148,131],[1239,441,148,131],[1383,441,148,131]],rising:[[5,828,155,144],[165,828,155,144],[320,828,155,144],[480,828,155,144],[635,828,155,144],[785,828,165,144]],defeated:[[560,643,155,135],[720,643,155,135],[865,643,155,135],[1015,643,155,135],[1165,643,155,135],[1320,643,155,135]]};
const processed={};let atlasReady=false;
atlasImage.onload=()=>{
 try{
  for(const [kind,rects] of Object.entries(spriteFrames)){
   processed[kind]=rects.map(([sx,sy,sw,sh])=>{
    const c=document.createElement('canvas');c.width=sw;c.height=sh;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(atlasImage,sx,sy,sw,sh,0,0,sw,sh);
    const data=g.getImageData(0,0,sw,sh),a=data.data;
    // Estimate each frame's painted brown background from its upper corners.
    const sample=(x,y)=>{const k=(y*sw+x)*4;return[a[k],a[k+1],a[k+2]]};
    const bg=sample(sw-3,3);
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
     const k=(y*sw+x)*4,r=a[k],gr=a[k+1],bl=a[k+2];
     const distance=Math.hypot(r-bg[0],gr-bg[1],bl-bg[2]);
     const brown=(r>gr*1.08&&gr>bl*.99&&r<190&&bl<125);
     if(brown&&distance<54)a[k+3]=0;
     else if(brown&&distance<72)a[k+3]=Math.round(255*(distance-54)/18);
    }
    g.putImageData(data,0,0);return c;
   });
  }atlasReady=true;
 }catch(e){console.warn('Grumgullet atlas unavailable; procedural fallback',e)}
};
function spriteToad(b){
 if(!atlasReady)return false;
 let kind='idle';
 if(b.phase==='rising')kind='rising';
 else if(b.phase==='stunned')kind='stunned';
 else if(b.phase==='defeated')kind='defeated';
 else if(b.phase==='fight')kind=b.attack>1450?(b.seed%2?'tongue':'bubble'):(dist(b)>120?'walk':'idle');
 const frames=processed[kind]||processed.idle;
 const index=Math.min(frames.length-1,Math.floor((kind==='rising'?b.clock:kind==='stunned'?b.clock:b.attack)/Math.max(120,kind==='rising'?270:250))%frames.length);
 const frame=frames[index];if(!frame)return false;
 ctx.save();ctx.translate(b.x,b.y);
 // Atlas forward direction is right; mirror it when travelling left.
 ctx.scale((b.facingX||-1)>0?1:-1,1);
 // World position is at the creature's feet, matching the old procedural boss.
 const w=236,h=210;ctx.drawImage(frame,-w/2,-h+15,w,h);ctx.restore();
 return true;
}

function toad(b){
 if(spriteToad(b))return;ctx.save();ctx.translate(b.x,b.y);ctx.scale((b.facingX||-1)>0?1:-1,1);
 ellipse(0,8,113,32,'#274f4388');ellipse(0,-37,109,77,'#546a39');
 ellipse(-72,-6,41,30,'#465d33');ellipse(72,-6,41,30,'#465d33');
 ellipse(0,-79,89,58,'#73824a');
 for(let i=0;i<19;i++){const a=i*2.399;ellipse(Math.cos(a)*78,Math.sin(a)*46-75,7+i%5,5+i%3,i%3?'#9c9b5a':'#b1b67a')}
 ellipse(-48,-112,30,31,'#a7ad63');ellipse(48,-112,30,31,'#a7ad63');
 ellipse(-48,-113,13,15,'#e4c965');ellipse(48,-113,13,15,'#e4c965');
 ellipse(-48,-113,5,10,'#1b3027');ellipse(48,-113,5,10,'#1b3027');
 ctx.strokeStyle='#2e3b2c';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-67,54,.18,Math.PI-.18);ctx.stroke();
 if(b.phase==='stunned'){ctx.fillStyle='#f0a5a4';ctx.fillRect(-30,-52,60,9)}
 ctx.restore()}
function draw(){for(const b of bosses){
 if(b.phase==='defeated')continue;
 if(b.phase==='hidden'){
 ellipse(b.x,b.y,135,58,b.id==='mossmaw'?'#4b6957':'#455b39');
 if(b.id==='mossmaw'){for(let i=0;i<6;i++)ellipse(b.x+Math.cos(i)*85,b.y+Math.sin(i)*34,28,15,'#72865a')}
 else{for(let i=0;i<5;i++)ellipse(b.x+Math.cos(i*2)*66,b.y+Math.sin(i*2)*26,13,12,'#779450')}
 continue}
 if(b.id==='mossmaw')moss(b);else toad(b);
 ctx.fillStyle='#25302c';ctx.fillRect(b.x-72,b.y-184,144,10);
 ctx.fillStyle=b.phase==='stunned'?'#e3c878':'#c6785e';ctx.fillRect(b.x-70,b.y-182,140*b.hp/b.max,6);
 }
 for(const q of projectiles){ellipse(q.x,q.y-18,q.type==='tongue'?29:24,q.type==='tongue'?12:20,q.type==='tongue'?'#d77983':q.type==='mud'?'#62563d':'#80bba2');ellipse(q.x-7,q.y-25,7,5,'#d8e8b9')}
}
window.__swampBosses={update,draw,strike,snapshot:()=>bosses.map(b=>({id:b.id,phase:b.phase,hp:b.hp,x:b.x,y:b.y}))};
})();