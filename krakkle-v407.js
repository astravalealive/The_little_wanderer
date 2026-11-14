// Krakkle, the Buried King of Saltwick Beach
(() => {
  'use strict';
  const port = window.__gloamPort;
  if (!port) return;
  const {state, ctx} = port;
  const home = {x:2300, y:7750};
  const names = ['down','up','left','right','idle','claw','foam','throw','burrow','tunnel','emerge','pull','stun','recover','hurt','defeat','water'];
  const counts = [4,4,4,4,4,4,4,6,6,4,6,4,6,6,2,6,4];
  const durations = {emerge:1100, claw:650, foam:800, throw:1080, burrow:600, tunnel:1600, pull:580, stun:2700, recover:720, defeat:1080};
  const atlas = new Image();
  atlas.src = './assets/krakkle/krakkle.png';
  const s = { ...home, hp:320, maxHp:320, mode:'hidden', timer:0, attack:0, direction:'down', noticed:false, defeated:false };
  let lastHit = -Infinity, attackIndex = 0, released = false, aimX = 0, aimY = 0;
  let shots = [];
  const distance = () => Math.hypot(state.x-s.x, state.y-s.y);
  const now = () => port.snapshot().time;
  function enter(mode) {
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
    if (!atlas.naturalWidth || (s.defeated && s.timer>durations.defeat+300)) return;
    let name=s.mode, fraction=0;
    if (s.mode==='hidden') {name='burrow';fraction=.65;}
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
      ctx.beginPath();ctx.ellipse(q.x,q.y-14-lift,q.rock?11:14,q.rock?10:7,0,0,Math.PI*2);
      ctx.fillStyle=q.rock?'#958077':'#99dce9';ctx.fill();
      ctx.strokeStyle=q.rock?'#61534c':'#e2fcff';ctx.lineWidth=2;ctx.stroke();
    }
    ctx.restore();
  }
  window.__krakkle={update,draw,strike,atlas,snapshot:()=>({...s})};
})();
