/* Haigen's World V136 · Gloamjaw Attack FX Polish
   Visual-only addon. No combat timing, hitboxes, damage, spawning or saves changed.
   Retains approved V133 boss atlas and the old FX as safe runtime fallbacks. */
(()=>{'use strict';
const boss=window.__gloamAddon,port=window.__gloamFxInput;
if(!boss||!port){console.warn('Gloamjaw V136 FX: boss bridge unavailable');return}
const {ctx,combat,state,data,x,y,rx,ry}=port;
const oldGround=boss.drawGround,oldEffects=boss.drawEffects;
const TAU=Math.PI*2;
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=n=>{const a=Math.sin(n*127.1+14.73)*43758.5453;return a-Math.floor(a)};
const colors={
 vine:['#243b35','#3f6547','#79916b','#a9b78b','#d2c6a0'],
 spore:['#4f6150','#91a76b','#d1d49a','#f1dda2','#a17c7d'],
 earth:['#29392f','#5d5844','#90775b','#c0a27a','#7f8d60'],
 bite:['#412b42','#87546d','#bd8291','#efbea6','#d8d3a8'],
 hit:['#614048','#ac697a','#f0b69b','#f7d6ab','#d7d2ae']
};
const fxState={bursts:[],lastTurn:0,lastHitTurn:0,lastHP:data.hp,lastSpores:[],drawCalls:0,groundBuilt:false,errors:0};
function ellipse(g,cx,cy,rrx,rry,fill,stroke=null,line=1){
 g.beginPath();g.ellipse(cx,cy,Math.max(.25,rrx),Math.max(.25,rry),0,0,TAU);
 if(fill){g.fillStyle=fill;g.fill()}
 if(stroke){g.lineWidth=line;g.strokeStyle=stroke;g.stroke()}
}
function segment(g,ax,ay,bx,by,color,width=2){
 g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';
 g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();
}
function tapered(g,points,rad,fill,edge){
 if(points.length<2)return;
 const L=[],R=[];
 for(let i=0;i<points.length;i++){
  const p=points[i],last=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
  const vx=next.x-last.x,vy=next.y-last.y,d=Math.max(1,Math.hypot(vx,vy));
  const nx=-vy/d,ny=vx/d,t=i/(points.length-1);
  const width=(rad*(1-t)**.82+1.35)*(1+.08*Math.sin(t*28));
  L.push({x:p.x+nx*width,y:p.y+ny*width});
  R.push({x:p.x-nx*width,y:p.y-ny*width});
 }
 g.beginPath();g.moveTo(L[0].x,L[0].y);
 for(const p of L.slice(1))g.lineTo(p.x,p.y);
 for(const p of R.reverse())g.lineTo(p.x,p.y);
 g.closePath();g.fillStyle=fill;g.fill();
 if(edge){g.strokeStyle=edge;g.lineWidth=2.2;g.stroke()}
}
function bezier(a,b,c,d,t){
 const k=1-t;
 return {x:k*k*k*a.x+3*k*k*t*b.x+3*k*t*t*c.x+t*t*t*d.x,
         y:k*k*k*a.y+3*k*k*t*b.y+3*k*t*t*c.y+t*t*t*d.y};
}
function makeTerrain(){
 const canvas=document.createElement('canvas');
 canvas.width=900;canvas.height=760;
 const g=canvas.getContext('2d');
 if(!g)return null;
 const cx=450,cy=344;
 // No solid circular platform: earth stains fade into the existing biome.
 const moisture=g.createRadialGradient(cx,cy,25,cx,cy,375);
 moisture.addColorStop(0,'#192a236c');
 moisture.addColorStop(.42,'#3f48303b');
 moisture.addColorStop(.75,'#474c3118');
 moisture.addColorStop(1,'#34453300');
 g.fillStyle=moisture;g.fillRect(0,0,900,760);
 for(let i=0;i<165;i++){
  const angle=TAU*rnd(i*8+1),rad=Math.sqrt(rnd(i*8+3)),px=cx+Math.cos(angle)*rad*343;
  const py=cy+Math.sin(angle)*rad*269;
  const spread=7+rnd(i*8+5)*48;
  const grd=g.createRadialGradient(px,py,1,px,py,spread);
  const palette=i%5===0?'#252d27':i%4===0?'#6c5c49':i%3===0?'#53543c':'#4d5941';
  const opacity=rad>.74?.13:.20;
  g.globalAlpha=opacity;
  grd.addColorStop(0,palette);grd.addColorStop(.63,palette);
  grd.addColorStop(1,'#36452f00');
  g.fillStyle=grd;
  g.beginPath();g.ellipse(px,py,spread,spread*(.5+rnd(i*8+6)*.45),angle*.3,0,TAU);g.fill();
 }
 g.globalAlpha=1;
 // Primary knot of roots grows outwards across the soil, never ending at a ring.
 for(let arm=0;arm<17;arm++){
  const a=arm*2.399+.18*Math.sin(arm*4),length=137+rnd(arm*21+2)*226;
  const v={x:Math.cos(a),y:Math.sin(a)},n={x:-v.y,y:v.x};
  const from={x:cx+v.x*18,y:cy+v.y*11};
  const bend=(rnd(arm*17+3)-.5)*83,px=cx+v.x*length,py=cy+v.y*length*.77;
  const m1={x:cx+v.x*length*.34+n.x*bend,y:cy+v.y*length*.2+n.y*bend*.5};
  const m2={x:cx+v.x*length*.76-n.x*bend*.3,y:cy+v.y*length*.54-n.y*bend*.23};
  const path=[];for(let j=0;j<=25;j++)path.push(bezier(from,m1,m2,{x:px,y:py},j/25));
  tapered(g,path,9+(arm%4)*3,'#263a2f','#16291f');
  g.strokeStyle=arm%3===0?'#85865e':'#606c4b';g.lineWidth=2.2;g.beginPath();
  path.forEach((p,j)=>j?g.lineTo(p.x-2,p.y-2):g.moveTo(p.x-2,p.y-2));g.stroke();
  for(let j=2;j<6;j++){
   const t=j/7,p=bezier(from,m1,m2,{x:px,y:py},t),prev=bezier(from,m1,m2,{x:px,y:py},t-.02);
   const dx=p.x-prev.x,dy=p.y-prev.y,l=Math.max(1,Math.hypot(dx,dy));
   const sg=(j+arm)%2?1:-1,side={x:-dy/l*sg,y:dx/l*sg};
   segment(g,p.x,p.y,p.x+side.x*(14+j*2)+dx*.45,p.y+side.y*(13+j*2)+dy*.45,'#344537',3.5);
   segment(g,p.x+side.x*4,p.y+side.y*4,p.x+side.x*(13+j*2),p.y+side.y*(13+j*2),'#818465',1.1);
  }
 }
 // Natural ground clutter: lichens, flaked bark, stones, moss and buried spores.
 for(let i=0;i<295;i++){
  const a=rnd(i*53+12)*TAU,r=Math.sqrt(rnd(i*53+14));
  const px=cx+Math.cos(a)*r*355,py=cy+Math.sin(a)*r*274;
  const t=rnd(i*53+16),s=1+t*4.5;
  if(i%13===0){
   ellipse(g,px,py,7+t*6,3+t*2,'#2c4234a5');
   ellipse(g,px-1,py-2,4+t*3,1.7,'#768865a5');
  }else if(i%11===0){
   ellipse(g,px,py,s*2.2,s*.95,'#786b57b0','#28382e',.7);
   segment(g,px-3,py-1,px+s,py-2,'#a7a0849a',.7);
  }else if(i%9===0){
   segment(g,px,py,px+Math.cos(a)*s*3,py+Math.sin(a)*s*2,'#7b865f94',1.7);
   ellipse(g,px+2,py-2,1.3,.8,'#ccb4a1ab');
  }else{
   ellipse(g,px,py,s*.7,s*.45,i%3===0?'#a9967383':'#6f82616b');
  }
 }
 for(let i=0;i<22;i++){
  const a=rnd(i*33+1)*TAU,r=110+rnd(i*33+2)*215,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r*.77;
  const size=3+rnd(i*33+3)*4.5;
  segment(g,px,py+4,px-2,py-6,'#b0ad91b0',1.3);
  ellipse(g,px-2,py-7,size,size*.52,i%3?'#76576aa8':'#8c8290b8','#463d46',.9);
  ellipse(g,px-4,py-8,size*.32,size*.15,'#dbbdadbb');
 }
 const shadow=g.createRadialGradient(cx,cy,7,cx,cy,126);
 shadow.addColorStop(0,'#101d188b');shadow.addColorStop(.48,'#14251f60');shadow.addColorStop(1,'#16251b00');
 g.fillStyle=shadow;g.fillRect(cx-145,cy-145,290,290);
 fxState.groundBuilt=true;
 return canvas;
}
let terrain=null;
try{terrain=makeTerrain()}catch(error){window.__gloamTerrainError=String(error)}
function drawGround(){
 const snap=port.time(),dx=state.x-x,dy=state.y-y;
 // Camera may pan independently of Haigen; use the normal boss culling route.
 const scene=window.__gloamPort?.snapshot?.();
 if(scene&&(Math.abs(x-scene.cameraX)>1200||Math.abs(y-scene.cameraY)>920))return;
 if(!terrain){oldGround();return}
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.drawImage(terrain,x-450,y-344);
 ctx.restore();
 fxState.drawCalls++;
}
function burst(kind,px,py,t,count=15){
 const palette=colors[kind]||colors.earth;
 for(let i=0;i<count;i++){
  const seed=t*.1+i*31.11+px*.3+py*.09;
  const angle=rnd(seed+9)*TAU,speed=27+rnd(seed+14)*135;
  const life=420+rnd(seed+8)*640;
  fxState.bursts.push({kind,x:px,y:py,at:t,life,
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-(kind==='spore'?48:23),
    r:1.4+rnd(seed+7)*5.7,color:palette[i%palette.length],
    spin:rnd(seed+22)*TAU,shape:i%5===0?'thorn':i%3===0?'leaf':'dust'});
 }
 if(fxState.bursts.length>180)fxState.bursts.splice(0,fxState.bursts.length-180);
}
function particles(t){
 fxState.bursts=fxState.bursts.filter(p=>t-p.at<p.life&&t>=p.at);
 for(const p of fxState.bursts){
  const u=clamp((t-p.at)/p.life),ease=u*(2-u);
  const px=p.x+p.vx*ease*p.life/1000,py=p.y+p.vy*ease*p.life/1000+u*u*25;
  ctx.save();ctx.globalAlpha=(1-u)**1.6*.94;ctx.translate(px,py);ctx.rotate(p.spin+u*2);
  if(p.shape==='thorn'){
   ctx.fillStyle=p.color;ctx.strokeStyle='#24362f';ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(-p.r,0);ctx.lineTo(p.r*1.9,-p.r*.42);
   ctx.lineTo(-p.r*.6,p.r*.78);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(p.shape==='leaf'){
   ctx.fillStyle=p.color;ctx.strokeStyle='#253d35';ctx.lineWidth=.7;
   ctx.beginPath();ctx.moveTo(-p.r,0);ctx.quadraticCurveTo(0,-p.r*1.5,p.r,0);
   ctx.quadraticCurveTo(0,p.r*.75,-p.r,0);ctx.fill();ctx.stroke();
  }else{
   ellipse(ctx,0,0,p.r*(1-u*.45),p.r*.63,p.color);
   ellipse(ctx,-p.r*.24,-p.r*.20,p.r*.24,p.r*.16,'#f5ddba9c');
  }
  ctx.restore();
 }
}
function vineCurve(angle,extension=1,wiggle=0){
 const ux=Math.cos(angle),uy=Math.sin(angle),nx=-uy,ny=ux;
 const from={x:x+ux*27,y:y-103},to={x:x+ux*315*extension,y:y+uy*315*extension};
 const b={x:lerp(from.x,to.x,.3)+nx*(35+wiggle),y:lerp(from.y,to.y,.3)-50+ny*(35+wiggle)};
 const c={x:lerp(from.x,to.x,.76)-nx*(28+wiggle*.4),y:lerp(from.y,to.y,.77)+ny*(28+wiggle*.4)};
 const path=[];for(let j=0;j<=32;j++)path.push(bezier(from,b,c,to,j/32));
 return path;
}
function renderVine(angle,t,warning=false){
 const progress=clamp((700-combat.timer)/700);
 const wind=warning?Math.sin(t*.011)*8:Math.sin(progress*TAU)*21;
 const extension=warning?.28:1;
 const path=vineCurve(angle,extension,wind);
 const head=path[0],end=path[path.length-1];
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(!warning){
  // Side trails are displaced from the actual root strike, never extending the hitbox.
  ctx.strokeStyle='#c7a58b44';ctx.lineWidth=10;ctx.beginPath();
  for(let i=0;i<path.length;i++){const p=path[i];i?ctx.lineTo(p.x+7,p.y-9):ctx.moveTo(p.x+7,p.y-9)}ctx.stroke();
 }
 const bark=ctx.createLinearGradient(head.x-18,head.y-20,end.x+12,end.y+10);
 bark.addColorStop(0,'#264236');bark.addColorStop(.2,'#526c49');
 bark.addColorStop(.43,'#a2ae7d');bark.addColorStop(.68,'#64805a');bark.addColorStop(1,'#253d35');
 tapered(ctx,path,warning?12:20,bark,'#1b302d');
 // Inner woody fibre, striped cambium, and scars follow the bend.
 ctx.strokeStyle='#b7b58c';ctx.lineWidth=warning?1.7:3.4;ctx.beginPath();
 for(let i=0;i<path.length;i++){
  const p=path[i],shift=(1-i/32)*3.4;
  i?ctx.lineTo(p.x-shift,p.y-shift):ctx.moveTo(p.x-shift,p.y-shift)
 }ctx.stroke();
 for(let i=2;i<path.length-2;i+=3){
  const p=path[i],prev=path[i-1],next=path[i+1],
   dx=next.x-prev.x,dy=next.y-prev.y,l=Math.max(1,Math.hypot(dx,dy));
  const nx=-dy/l,ny=dx/l,side=i%2?1:-1,width=(warning?9:18)*(1-i/32);
  const root={x:p.x+nx*width*side,y:p.y+ny*width*side};
  const tip={x:root.x+nx*side*(10+(i%4)*2)+dx*.65,
             y:root.y+ny*side*(10+(i%4)*2)+dy*.65};
  ctx.beginPath();ctx.moveTo(root.x-2,root.y-2);ctx.lineTo(tip.x,tip.y);
  ctx.lineTo(root.x+3,root.y+3);ctx.closePath();
  ctx.fillStyle=i%3===0?'#e0cfaa':'#a6b38b';ctx.fill();
  ctx.strokeStyle='#34473d';ctx.lineWidth=.9;ctx.stroke();
  if(i%6===2&&!warning){
   const lx=root.x+nx*side*7,ly=root.y+ny*side*7;
   ctx.fillStyle=i%12===2?'#8b8d69':'#596e50';ctx.strokeStyle='#293c34';ctx.lineWidth=1.4;
   ctx.beginPath();ctx.moveTo(root.x,root.y);
   ctx.bezierCurveTo(lx-13,ly-25,lx+17,ly-27,lx+nx*side*21,ly-2);
   ctx.quadraticCurveTo(lx,ly+9,root.x,root.y);ctx.fill();ctx.stroke();
   segment(ctx,root.x,root.y,lx+nx*side*15,ly-5,'#bac49a',1);
  }
 }
 if(!warning){
  ellipse(ctx,end.x,end.y,10,5,'#dbc1a27a');
  for(let j=0;j<3;j++){
   const a=angle+(j-1)*.42;
   segment(ctx,end.x,end.y,end.x+Math.cos(a)*14,end.y+Math.sin(a)*14,
    '#a9b488aa',2);
  }
 }
 ctx.restore();
}
function warningLine(angle){
 const ux=Math.cos(angle),uy=Math.sin(angle),nx=-uy,ny=ux;
 ctx.save();ctx.lineCap='round';
 ctx.strokeStyle='#dcad9888';ctx.lineWidth=3;ctx.setLineDash([12,8,4,10]);
 ctx.beginPath();ctx.moveTo(x+ux*44,y+uy*44);ctx.lineTo(x+ux*320,y+uy*320);ctx.stroke();
 ctx.setLineDash([]);
 for(let i=1;i<=8;i++){
  const r=66+i*30,px=x+ux*r,py=y+uy*r;
  segment(ctx,px-nx*5,py-ny*5,px+nx*(6+i%3*2),py+ny*(6+i%3*2),
   i%2?'#d4c3a37f':'#bc8b937f',1.7);
 }
 ctx.restore();
}
function renderSporePod(px,py,t,small=false){
 const r=small?7:17,beat=Math.sin(t*.011+px*.05)*.08;
 ctx.save();ctx.translate(px,py);ctx.scale(1+beat,1-beat*.6);
 const aura=ctx.createRadialGradient(0,0,2,0,0,r*2.6);
 aura.addColorStop(0,'#e9de9a55');aura.addColorStop(1,'#c2d08d00');
 ellipse(ctx,0,0,r*2.6,r*2.6,aura);
 const body=ctx.createRadialGradient(-r*.35,-r*.3,r*.18,0,0,r*1.3);
 body.addColorStop(0,'#eee0a8');body.addColorStop(.35,'#bdc58c');
 body.addColorStop(.69,'#7c936e');body.addColorStop(1,'#384b47');
 ellipse(ctx,0,0,r,r*.87,body,'#2b4440',small?1:2.7);
 ellipse(ctx,-r*.32,-r*.35,r*.35,r*.21,'#f7dfabbd');
 for(let i=0;i<7;i++){
  const a=i*2.399,dx=Math.cos(a)*r*.58,dy=Math.sin(a)*r*.43;
  ellipse(ctx,dx,dy,small?1:1.3,small?1:2,i%3===0?'#d6ada4':'#4c6656');
 }
 ctx.restore();
}
function renderSporeProjectile(sp,t){
 const vx=sp.vx||1,vy=sp.vy||0,ang=Math.atan2(vy,vx);
 ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(ang);
 const tail=ctx.createLinearGradient(-47,0,9,0);
 tail.addColorStop(0,'#b0c18400');tail.addColorStop(.72,'#a5ba8698');tail.addColorStop(1,'#e9dfaa');
 ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-47,-2);ctx.quadraticCurveTo(-24,-11,0,-7);
 ctx.lineTo(0,9);ctx.quadraticCurveTo(-24,9,-47,2);ctx.fill();
 ctx.strokeStyle='#d4d0a676';ctx.lineWidth=1.7;
 for(let i=1;i<4;i++){const offset=i*13;segment(ctx,-offset,Math.sin(t*.015+i)*6,-offset-7,Math.cos(t*.011+i)*9,'#e1dca693',1.1)}
 ctx.restore();
 renderSporePod(sp.x,sp.y,t,true);
 // Tiny satellite pollen, still just visual particles.
 for(let i=0;i<4;i++){
  const phase=t*.004+i*1.7,dd=8+i*3;
  ellipse(ctx,sp.x+Math.cos(phase)*dd,sp.y+Math.sin(phase)*dd*.7,1+i*.25,1+i*.2,
   i%2?'#e1d19dbd':'#bdcc95ad');
 }
}
function drawRootCracks(t){
 const ax=combat.aim.x,ay=combat.aim.y;
 ctx.save();ctx.lineCap='round';
 const glow=ctx.createRadialGradient(ax,ay,8,ax,ay,105);
 glow.addColorStop(0,'#bd8b8571');glow.addColorStop(.45,'#8a69634a');glow.addColorStop(1,'#b67c8200');
 ellipse(ctx,ax,ay,105,105,glow);
 // The real damage radius stays 93 units, exactly as before.
 ctx.strokeStyle='#e8a8a0a0';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.arc(ax,ay,93,0,TAU);ctx.stroke();
 for(let j=0;j<11;j++){
  const a=TAU*j/11+Math.sin(j*3)*.19,length=25+j%4*15;
  const ax1=ax+Math.cos(a)*length*.15,ay1=ay+Math.sin(a)*length*.15;
  const ax2=ax+Math.cos(a)*Math.min(90,length+31),ay2=ay+Math.sin(a)*Math.min(90,length+31);
  ctx.strokeStyle=j%3?'#3b2d2dcb':'#78535acd';ctx.lineWidth=2.5+j%3;
  ctx.beginPath();ctx.moveTo(ax1,ay1);
  ctx.lineTo(lerp(ax1,ax2,.52)+Math.sin(j)*8,lerp(ay1,ay2,.52));
  ctx.lineTo(ax2,ay2);ctx.stroke();
  segment(ctx,ax1+1,ay1-2,ax2-2,ay2-3,'#c38c7a66',1);
 }
 ctx.restore();
}
function drawRootSurge(t){
 const ax=combat.aim.x,ay=combat.aim.y,p=clamp((700-combat.timer)/700);
 ctx.save();ctx.lineJoin='round';
 for(let j=0;j<9;j++){
  const a=j*TAU/9,px=ax+Math.cos(a)*85,py=ay+Math.sin(a)*85;
  const height=(28+j%4*9)*(p<.2?Math.max(.45,p/.2):1);
  const topX=px+Math.cos(a)*13,topY=py-height;
  const root=ctx.createLinearGradient(px-11,py,px+13,py-height);
  root.addColorStop(0,'#283d33');root.addColorStop(.5,'#697c57');root.addColorStop(1,'#b9b494');
  ctx.fillStyle=root;ctx.strokeStyle='#1d342d';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(px-12,py+4);
  ctx.quadraticCurveTo(px-15,py-height*.46,topX-2,topY);
  ctx.quadraticCurveTo(px+16,py-height*.55,px+13,py+4);
  ctx.closePath();ctx.fill();ctx.stroke();
  segment(ctx,px-4,py,topX-3,topY+7,'#d4c4a17a',2.3);
  for(let k=0;k<3;k++){
   const yy=py-height*.28-(k*height*.17);
   const sx=px+Math.sin(k+j)*8;
   ctx.fillStyle=k%2?'#b6ab81':'#82946f';
   ctx.beginPath();ctx.moveTo(sx,yy);ctx.lineTo(sx+10,yy-10);
   ctx.lineTo(sx+5,yy+6);ctx.closePath();ctx.fill();
  }
  ellipse(ctx,px+11,py+7,7,2.5,'#97816689');
 }
 ctx.restore();
}
function drawBiteTell(t){
 ctx.save();
 const beat=1+Math.sin(t*.014)*.017;
 ctx.translate(x,y);
 ctx.strokeStyle='#dfa89e8f';ctx.lineWidth=3.3;
 ctx.beginPath();ctx.arc(0,0,125*beat,0,TAU);ctx.stroke();
 for(let i=0;i<13;i++){
  const a=i*TAU/13,r=125;
  const px=Math.cos(a)*r,py=Math.sin(a)*r;
  const inward=13+(i%3)*5;
  ctx.fillStyle=i%3===0?'#e5beaf8d':'#966b7b9e';
  ctx.beginPath();ctx.moveTo(px-5,py-4);ctx.lineTo(px-Math.cos(a)*inward,py-Math.sin(a)*inward);
  ctx.lineTo(px+5,py+4);ctx.closePath();ctx.fill();
 }
 // Saliva strings tremble beneath the fanged jaw.
 ctx.strokeStyle='#e4d4c098';ctx.lineWidth=1.6;
 for(let i=0;i<5;i++){
  const bx=(i-2)*25,by=-68;
  ctx.beginPath();ctx.moveTo(bx,by);
  ctx.quadraticCurveTo(bx+Math.sin(t*.008+i)*5,by+11,bx+Math.sin(t*.01+i)*4,by+15+i%3*5);
  ctx.stroke();
  ellipse(ctx,bx+Math.sin(t*.01+i)*4,by+15+i%3*5,1.8,2.9,'#e9d8c48e');
 }
 ctx.restore();
}
function drawBiteImpact(t){
 const p=clamp((700-combat.timer)/700);
 const scale=1.08+Math.sin(p*Math.PI)*.17;
 ctx.save();ctx.translate(x,y-126);ctx.scale(scale,scale);
 ctx.strokeStyle='#ebc3b09e';ctx.lineWidth=5;
 ctx.beginPath();ctx.ellipse(0,0,102,57,0,Math.PI*.14,Math.PI*.84);ctx.stroke();
 ctx.strokeStyle='#9c5279aa';ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,0,112,63,0,Math.PI*.98,Math.PI*1.9);ctx.stroke();
 for(let j=0;j<8;j++){
  const angle=j*TAU/8,px=Math.cos(angle)*95,py=Math.sin(angle)*57;
  segment(ctx,px,py,px+Math.cos(angle)*(11+j%3*4),py+Math.sin(angle)*(9+j%3*4),
   j%2?'#e8cfb09c':'#be7d8b9c',2.6);
 }
 ctx.restore();
}
function drawPlayerArrows(){
 for(const arrow of combat.arrows){
  ctx.save();ctx.translate(arrow.x,arrow.y);ctx.rotate(Math.atan2(arrow.vy,arrow.vx));
  segment(ctx,-17,1,8,1,'#2d382f',4.8);
  segment(ctx,-17,0,8,0,'#d7b782',2.6);
  ctx.fillStyle='#d1d6c0';ctx.strokeStyle='#485a50';ctx.lineWidth=.85;
  ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(5,-5);ctx.lineTo(5,5);ctx.closePath();ctx.fill();ctx.stroke();
  for(const side of [-1,1]){
   ctx.fillStyle=side===1?'#a3aa84':'#d4c49a';
   ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(-26,side*5);ctx.lineTo(-11,side*2);ctx.closePath();ctx.fill();
  }
  ctx.restore();
 }
 if(!['bow','crossbow'].includes(state.equipped))return;
 ctx.save();ctx.translate(state.x+19,state.y-42);
 ctx.strokeStyle='#2e3c34';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,-20);
 ctx.quadraticCurveTo(state.equipped==='bow'?24:34,0,0,21);ctx.stroke();
 ctx.strokeStyle='#a67c4f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-20);
 ctx.quadraticCurveTo(state.equipped==='bow'?24:34,0,0,21);ctx.stroke();
 segment(ctx,0,-20,0,21,'#e8d9b5',1.8);
 if(state.equipped==='crossbow'){
  segment(ctx,-9,0,22,0,'#836642',6);segment(ctx,-9,-2,22,-2,'#c9aa79',2.1);
 }
 ctx.restore();
}
function drawEffects(){
 const t=port.time(),a=combat;
 // Visual event transitions only. The attack state machine is never modified.
 if(a.mode==='strike'&&a.turn!==fxState.lastTurn&&!data.defeated){
  fxState.lastTurn=a.turn;
  if(a.attack==='vine')burst('vine',x+Math.cos(a.angle)*305,y+Math.sin(a.angle)*305,t,20);
  else if(a.attack==='roots')burst('earth',a.aim.x,a.aim.y,t,32);
  else if(a.attack==='bite')burst('bite',x,y-119,t,18);
  else if(a.attack==='spores')burst('spore',x,y-135,t,22);
 }
 if(a.hit&&fxState.lastHitTurn!==a.turn&&!data.defeated){
  fxState.lastHitTurn=a.turn;
  burst(a.attack==='roots'?'earth':a.attack==='vine'?'vine':'bite',
   state.x,state.y-25,t,16);
 }
 if(data.hp<fxState.lastHP){
  burst('hit',x,y-115,t,Math.min(24,9+Math.round((fxState.lastHP-data.hp)*.6)));
 }
 fxState.lastHP=data.hp;
 for(const previous of fxState.lastSpores){
  if(!a.spores.includes(previous.ref)&&Math.hypot(previous.x-state.x,previous.y-(state.y-34))<65){
   burst('spore',previous.x,previous.y,t,18);
  }
 }
 fxState.lastSpores=a.spores.map(sp=>({ref:sp,x:sp.x,y:sp.y}));
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(!data.defeated&&a.mode==='warning'){
  if(a.attack==='vine'){warningLine(a.angle);renderVine(a.angle,t,true)}
  else if(a.attack==='spores'){
   for(let i=-1;i<=1;i++){
    renderSporePod(x+i*30,y-134+Math.sin(t*.009+i)*3,t);
    for(let j=0;j<3;j++){
     const a1=t*.003+i*2+j*TAU/3;
     ellipse(ctx,x+i*30+Math.cos(a1)*24,y-134+Math.sin(a1)*16,
      1.6+j*.4,1.2+j*.3,j%2?'#cdd8a19a':'#efcaac8a');
    }
   }
  }else if(a.attack==='roots')drawRootCracks(t);
  else if(a.attack==='bite')drawBiteTell(t);
 }
 if(!data.defeated&&a.mode==='strike'){
  if(a.attack==='vine')renderVine(a.angle,t);
  else if(a.attack==='roots')drawRootSurge(t);
  else if(a.attack==='bite')drawBiteImpact(t);
  else if(a.attack==='spores'){
   for(let i=0;i<5;i++){
    const f=t*.003+i*2.399;
    ellipse(ctx,x+Math.cos(f)*35,y-143+Math.sin(f)*18,2+i%2,2,
     i%2?'#c2c68dbb':'#eee4b1ae');
   }
  }
 }
 // Luminous woodland dust, drifting up from the roots, at a very low density.
 if(!data.defeated&&Math.hypot(state.x-x,state.y-y)<930){
  for(let i=0;i<15;i++){
   const phase=t*.00015+i*2.399,a=phase+i*1.13;
   const rad=38+rnd(i*17+3)*210;
   const px=x+Math.cos(a)*rad+Math.sin(t*.00058+i)*12;
   const py=y-5-Math.sin(t*.00073+i)*22+Math.sin(a)*rad*.56;
   ellipse(ctx,px,py,1.05+i%3*.47,.9+i%3*.26,i%4?'#c7bda46f':'#b9cb878c');
  }
 }
 for(const sp of a.spores)renderSporeProjectile(sp,t);
 particles(t);
 drawPlayerArrows();
 ctx.restore();fxState.drawCalls++;
}
boss.drawGround=function(){try{drawGround()}catch(error){fxState.errors++;window.__gloamVfxError=String(error);oldGround()}};
boss.drawEffects=function(){try{drawEffects()}catch(error){fxState.errors++;window.__gloamVfxError=String(error);oldEffects()}};
window.__gloamFXQA=()=>({version:136,loaded:true,terrainCached:fxState.groundBuilt,drawCalls:fxState.drawCalls,
 bursts:fxState.bursts.length,errors:fxState.errors,attack:combat.attack,mode:combat.mode,
 originalTimingsPreserved:true,originalBossArtPreserved:true});
})();
