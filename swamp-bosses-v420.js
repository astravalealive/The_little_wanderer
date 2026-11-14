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
 b.clock+=dt;const d=dist(b);
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
function moss(b){ctx.save();ctx.translate(b.x,b.y);
 ellipse(0,7,145,51,'#294f4a88');ellipse(0,0,134,65,'#426a5b');
 for(let i=0;i<8;i++){const a=i*Math.PI/4;ellipse(Math.cos(a)*110,Math.sin(a)*41,30,21,'#536b45')}
 ellipse(0,-44,123,93,'#293f35');ellipse(0,-57,113,82,'#607750');
 for(let i=0;i<16;i++){const a=i*2.399;ellipse(Math.cos(a)*85,Math.sin(a)*57-56,19,12,i%3?'#3d6a45':'#8a9561')}
 ellipse(0,-105,35,25,'#80916a');ellipse(-22,-111,10,8,'#e8b957');ellipse(22,-111,10,8,'#e8b957');
 ellipse(-22,-111,4,5,'#1c2924');ellipse(22,-111,4,5,'#1c2924');
 if(b.phase==='stunned')ellipse(0,-13,67,15,'#b7a47e');
 ctx.restore()}
function toad(b){ctx.save();ctx.translate(b.x,b.y);
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