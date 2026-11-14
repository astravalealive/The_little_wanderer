(()=>{'use strict';if(new URLSearchParams(location.search).get('editor')!=='1')return;const b=window.__hwEditorBridge;if(!b)return;
const KEY='hw-editor-preview-v1';let items=[],history=[],mode='move',active=false,drag=null;
try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(v))items=v.filter(o=>o&&['tree','cottage'].includes(o.type)&&Number.isFinite(o.x)&&Number.isFinite(o.y)).slice(0,150)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}},remember=()=>{history.push(JSON.stringify(items));if(history.length>30)history.shift()};
const bar=document.createElement('div');bar.style.cssText='position:fixed;z-index:999999;bottom:10px;left:10px;right:10px;display:flex;flex-wrap:wrap;gap:5px;pointer-events:none';
const controls=[];function btn(label,fn){const x=document.createElement('button');x.textContent=label;x.style.cssText='pointer-events:auto;background:#233a34;color:#fff;border:1px solid #d8bf8c;border-radius:9px;padding:9px;font:600 13px system-ui';x.onclick=fn;bar.append(x);return x}
const toggle=btn('🛠 Edit World',()=>{active=!active;toggle.textContent=active?'✓ Finish Editing':'🛠 Edit World';controls.forEach(x=>x.style.display=active?'':'none');drag=null;save()});
for(const [k,label] of [['move','✋ Move'],['tree','🌳 Tree'],['cottage','🏠 Cottage'],['delete','⌫ Delete']])controls.push(btn(label,()=>{mode=k}));
controls.push(btn('↶ Undo',()=>{if(history.length){items=JSON.parse(history.pop());save()}}));
controls.push(btn('📋 Export',async()=>{const data=JSON.stringify({format:'hw-preview',version:1,items},null,2);try{await navigator.clipboard.writeText(data);alert('Layout copied')}catch(e){prompt('Copy layout:',data)}}));
controls.forEach(x=>x.style.display='none');document.body.append(bar);
const cv=b.canvas;
function point(e){const r=cv.getBoundingClientRect(),c=b.camera(),z=b.zoom();return{x:Math.round((c.x+(e.clientX-r.left-r.width/2)/z)/32)*32,y:Math.round((c.y+(e.clientY-r.top-r.height/2)/z)/32)*32}}
const hit=p=>[...items].reverse().find(o=>Math.abs(o.x-p.x)<48&&Math.abs(o.y-p.y)<48);
function valid(p,ignore){return !items.some(o=>o!==ignore&&Math.abs(o.x-p.x)<(o.type==='cottage'||ignore?.type==='cottage'?95:36)&&Math.abs(o.y-p.y)<(o.type==='cottage'||ignore?.type==='cottage'?95:36))}
cv.addEventListener('pointerdown',e=>{if(!active)return;e.preventDefault();e.stopImmediatePropagation();const p=point(e),o=hit(p);
if(mode==='move'){if(o){remember();drag=o;try{cv.setPointerCapture(e.pointerId)}catch(err){}}}
else if(mode==='delete'){if(o){remember();items=items.filter(x=>x!==o);save()}}
else if(items.length<150&&valid(p,null)){remember();items.push({id:'editor-'+Date.now(),type:mode,x:p.x,y:p.y});save()}},true);
cv.addEventListener('pointermove',e=>{if(!active||!drag)return;e.preventDefault();e.stopImmediatePropagation();const p=point(e);if(valid(p,drag)){drag.x=p.x;drag.y=p.y}},true);
function end(e){if(!drag)return;e.preventDefault();e.stopImmediatePropagation();drag=null;save()}cv.addEventListener('pointerup',end,true);cv.addEventListener('pointercancel',end,true);
b.renderEditor=()=>{if(!items.length)return;const ctx=b.ctx,c=b.camera(),z=b.zoom(),s=b.size();ctx.save();ctx.translate(s.width/2,s.height/2);ctx.scale(z,z);ctx.translate(-c.x,-c.y);
for(const o of items){ctx.save();ctx.translate(o.x,o.y);if(o.type==='tree'){ctx.fillStyle='#543e30';ctx.fillRect(-7,-12,14,30);ctx.fillStyle='#5d8551';ctx.beginPath();ctx.arc(0,-28,24,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle='#a38a69';ctx.fillRect(-38,-44,76,62);ctx.fillStyle='#62546d';ctx.beginPath();ctx.moveTo(-45,-44);ctx.lineTo(0,-82);ctx.lineTo(45,-44);ctx.closePath();ctx.fill();ctx.fillStyle='#3b302d';ctx.fillRect(-9,-10,18,28)}if(active){ctx.strokeStyle='#f2db8c';ctx.lineWidth=2;ctx.strokeRect(-44,-85,88,104)}ctx.restore()}ctx.restore()};
})();