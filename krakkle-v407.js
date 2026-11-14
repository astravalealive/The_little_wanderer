// Krakkle, the Buried King of Saltwick Beach
(() => {
  'use strict';
  const port = window.__gloamPort;
  if (!port) return;
  const {state, ctx} = port;
  const home = {x:-2500, y:7750};
  const names = ['down','up','left','right','idle','claw','foam','throw','burrow','tunnel','emerge','pull','stun','recover','hurt','defeat','water'];
  const counts = [4,4,4,4,4,4,4,6,6,4,6,4,6,6,2,6,4];
  const durations = {emerge:1100, claw:650, foam:800, throw:1080, burrow:600, tunnel:1600, pull:580, stun:2700, recover:720, defeat:1080};
  const atlas = new Image();
  atlas.src = './assets/krakkle/krakkle.png?v=416';
  const s = { ...home, hp:320, maxHp:320, mode:'hidden', timer:0, attack:0, direction:'down', noticed:false, defeated:false };
  let lastHit = -Infinity, attackIndex = 0, released = false, aimX = 0, aimY = 0;
  let shots = [];
  let wreckDebris = [];
  function scatterWreck(){
    wreckDebris=Array.from({length:19},(_,i)=>{const angle=i*2.39996,spread=75+(i%5)*24;return {x:home.x+Math.cos(angle)*spread,y:home.y+Math.sin(angle)*spread*.55,rot:angle,len:19+(i%4)*13,kind:i%4};});
  }
  const distance = () => Math.hypot(state.x-s.x, state.y-s.y);
  const now = () => port.snapshot().time;
  function enter(mode) {
    if(mode==='emerge' && s.mode==='hidden')scatterWreck();
    s.mode = mode;
    s.timer = 0;
    released = false;
  }
  function strike() {
    const eq = state.equipped, d = distance();
    if (eq === 'rod' && ['burrow','tunnel'].includes(s.mode) && d <= 210) {
      enter('pull');
      port.notify('🎣 Krakkle is hooked! Strike while he’s on his back.');
      return true;
    }
    if (!['fight','claw','foam','throw','stun','recover'].includes(s.mode)) return false;
    const damage = {axe:21, pickaxe:19, bow:24, crossbow:30}[eq];
    const ranged = eq === 'bow' || eq === 'crossbow';
    if (!damage || d > (ranged ? 205 : 110)) return false;
    if (now()-lastHit < 550 || (ranged && !state.arrows)) return true;
    if (ranged) state.arrows--;
    lastHit = now();
    s.hp = Math.max(0, s.hp-damage*(s.mode === 'stun' ? 2 : 1));
    port.startHaigenAction('swing',320);
    port.soundEffect('swing');
    if (!s.hp) {
      enter('defeat');
      s.defeated = true;
      shots = [];
      port.memory('Haigen defeated Krakkle, the Buried King of Saltwick Beach.');
      port.notify('🦀 KRAKKLE DEFEATED! The ancient shore falls silent.');
      port.save();
    }
    return true;
  }
  function moveToward(x,y,speed,dt) {
    const dx=x-s.x, dy=y-s.y, d=Math.hypot(dx,dy);
    if (d < 1) return;
    const step=Math.min(d,speed*dt)/d;
    s.x=Math.max(home.x-520, Math.min(home.x+520,s.x+dx*step));
    s.y=Math.max(home.y-470, Math.min(home.y+480,s.y+dy*step));
    s.direction=Math.abs(dx)>Math.abs(dy) ? (dx<0?'left':'right') : (dy<0?'up':'down');
  }
  function update(dt) {
    const step=Math.min(50, Math.max(0,dt)), d=distance();
    s.timer+=step;
    shots=shots.filter(q=>{
      q.x+=q.vx*step; q.y+=q.vy*step; q.age+=step;
      if (Math.hypot(state.x-q.x,state.y-q.y)<30) {
        port.takeDamage(q.rock?14:9,q.rock?'Krakkle boulder':'Krakkle sea foam',false,q);
        return false;
      }
      return q.age<1500;
    });
    if (s.mode==='hidden') {
      if (d<410 && !s.noticed) {s.noticed=true;port.notify('🐚 Something enormous shifts beneath the sand...');}
      if (d<190) {enter('emerge');port.notify('💥 The sand erupts! Krakkle, the Buried King!');}
      return;
    }
    if (s.mode==='fight') {
      if (d>1100) {moveToward(home.x,home.y,.045,step);return;}
      if (d>65) moveToward(state.x,state.y,s.y>home.y+140?.075:.048,step);
      s.attack+=step;
      if (s.attack>=2300) {
        s.attack=0;
        aimX=state.x; aimY=state.y;
        const sequence=['claw','foam','throw','burrow'];
        const next=sequence[attackIndex++ % sequence.length];
        enter(next==='claw' && d>165?'foam':next);
      }
      return;
    }
    if (s.mode==='tunnel') moveToward(aimX,aimY,.15,step);
    if (!released && ['claw','foam','throw'].includes(s.mode) && s.timer>=durations[s.mode]*.72) {
      released=true;
      if (s.mode==='claw') {
        if (d<165) port.takeDamage(13,'Krakkle crushing claw',false,s);
      } else {
        const angle=Math.atan2(aimY-s.y,aimX-s.x);
        shots.push({x:s.x,y:s.y,vx:.28*Math.cos(angle),vy:.28*Math.sin(angle),rock:s.mode==='throw',age:0});
      }
    }
    if (s.timer<durations[s.mode] || s.defeated) return;
    if (s.mode==='tunnel' && d<100) port.takeDamage(12,'Krakkle sand eruption',false,s);
    enter(({burrow:'tunnel',tunnel:'emerge',pull:'stun',stun:'recover'})[s.mode] || 'fight');
  }
  function draw() {
    if(wreckDebris.length){ctx.save();for(const p of wreckDebris){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.kind===0?'#b08b5c':'#70513c';ctx.fillRect(-p.len/2,-4,p.len,8);ctx.fillStyle='#c7a477';ctx.fillRect(-p.len/2,-4,p.len,2);ctx.restore();}ctx.restore();}
    if (!atlas.naturalWidth || (s.defeated && s.timer>durations.defeat+300)) return;
    let name=s.mode, fraction=0;
    if (s.mode==='hidden') {
      // Half-buried fishing wreck, not the boss sprite.
      ctx.save();ctx.translate(s.x,s.y);const shake=s.noticed?Math.sin(now()*.045)*2.8:0;ctx.translate(shake,0);
      ctx.fillStyle='#bfa37688';ctx.beginPath();ctx.ellipse(0,0,112,29,0,0,Math.PI*2);ctx.fill();
      // Weathered curved hull and dark interior.
      ctx.fillStyle='#302d2a';ctx.beginPath();ctx.moveTo(-105,-20);ctx.quadraticCurveTo(-63,-87,20,-76);ctx.quadraticCurveTo(90,-64,112,-22);ctx.quadraticCurveTo(24,13,-105,-20);ctx.fill();
      ctx.fillStyle='#77513b';ctx.beginPath();ctx.moveTo(-108,-25);ctx.quadraticCurveTo(-50,-103,26,-84);ctx.quadraticCurveTo(92,-71,115,-26);ctx.lineTo(95,-11);ctx.quadraticCurveTo(7,-37,-87,-11);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#c19b6a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-107,-24);ctx.quadraticCurveTo(-47,-100,28,-83);ctx.quadraticCurveTo(92,-70,114,-26);ctx.stroke();
      ctx.strokeStyle='#382c2b';ctx.lineWidth=4;
      for(let i=0;i<7;i++){const x=-78+i*26;ctx.beginPath();ctx.moveTo(x,-16);ctx.lineTo(x+12,-63+Math.abs(i-3)*7);ctx.stroke();}
      // Broken mast, net and brass fittings.
      ctx.strokeStyle='#5d4432';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-7,-52);ctx.lineTo(23,-137);ctx.stroke();
      ctx.strokeStyle='#d2b47c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(20,-131);ctx.lineTo(79,-47);ctx.lineTo(-49,-30);ctx.stroke();
      ctx.strokeStyle='#8a9a81';ctx.lineWidth=1.7;
      for(let j=0;j<6;j++){ctx.beginPath();ctx.moveTo(-43+j*19,-34);ctx.lineTo(-24+j*17,-53);ctx.stroke();}
      for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(-42,-34-j*4);ctx.lineTo(60,-36-j*3);ctx.stroke();}
      for(const x of [-84,74]){ctx.fillStyle='#d4aa65';ctx.beginPath();ctx.arc(x,-24,5,0,Math.PI*2);ctx.fill();}
      ctx.restore();return;
    }
    else if (s.mode==='fight') {
      name=s.y>home.y+140?'water':distance()<=66?'idle':s.direction;
      fraction=(now()%680)/680;
    } else {
      fraction=['tunnel','stun'].includes(name) ? (s.timer%720)/720 : s.timer/durations[name];
    }
    if (s.mode==='fight' && now()-lastHit<200) {name='hurt';fraction=(now()-lastHit)/200;}
    const row=names.indexOf(name), frame=Math.min(counts[row]-1, Math.floor(fraction*counts[row]));
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(atlas,frame*176,row*128,176,128,s.x-297,s.y-422,594,432);
    if (!['hidden','defeat','burrow','tunnel'].includes(s.mode)) {
      ctx.fillStyle='#271f25';ctx.fillRect(s.x-65,s.y-145,130,9);
      ctx.fillStyle='#d56d4c';ctx.fillRect(s.x-63,s.y-143,126*s.hp/s.maxHp,5);
    }
    for (const q of shots) {
      const lift=q.rock?30*Math.sin(Math.PI*q.age/1500):0;
      ctx.save();
      ctx.translate(q.x,q.y-30-lift);
      const spin=q.age*.0035;
      ctx.rotate(q.rock?spin:Math.sin(q.age*.012)*.12);
      if(q.rock){
        // Large faceted boulder with chipped edges, shadow and highlighted planes.
        ctx.fillStyle='#302e35';ctx.beginPath();ctx.moveTo(-31,-12);ctx.lineTo(-18,-32);ctx.lineTo(13,-35);ctx.lineTo(34,-13);ctx.lineTo(29,19);ctx.lineTo(3,33);ctx.lineTo(-29,17);ctx.closePath();ctx.fill();
        ctx.fillStyle='#857d7a';ctx.beginPath();ctx.moveTo(-25,-14);ctx.lineTo(-14,-28);ctx.lineTo(12,-28);ctx.lineTo(26,-9);ctx.lineTo(18,16);ctx.lineTo(-7,25);ctx.lineTo(-25,11);ctx.closePath();ctx.fill();
        ctx.fillStyle='#b2a59a';ctx.beginPath();ctx.moveTo(-14,-28);ctx.lineTo(12,-28);ctx.lineTo(4,-5);ctx.lineTo(-22,-7);ctx.closePath();ctx.fill();
        ctx.fillStyle='#625f64';ctx.beginPath();ctx.moveTo(4,-5);ctx.lineTo(26,-9);ctx.lineTo(18,16);ctx.lineTo(-7,25);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#d2c4b1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,6);ctx.lineTo(-5,2);ctx.lineTo(0,12);ctx.lineTo(12,15);ctx.stroke();
      }else{
        // Oversized foamy seawater orb: deep translucent core, scalloped foam and specular glints.
        ctx.fillStyle='#2a728dbb';ctx.beginPath();ctx.arc(0,0,36,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#64bcd4e0';ctx.beginPath();ctx.arc(-3,-3,31,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#9de6e9';ctx.beginPath();ctx.arc(-10,-12,15,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#e5ffff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,33,-2.7,.6);ctx.stroke();
        for(let i=0;i<7;i++){const a=i*Math.PI*2/7+q.age*.003;ctx.fillStyle=i%2?'#f2ffff':'#c2f5f4';ctx.beginPath();ctx.arc(Math.cos(a)*33,Math.sin(a)*33,5+(i%3)*2,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-16,-17,5,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  window.__krakkle={update,draw,strike,atlas,snapshot:()=>({...s})};
})();
