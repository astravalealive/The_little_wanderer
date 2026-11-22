/* Haigen's World navigation watchdog: monitors net progress, not footstep motion. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HaigenNavigationWatchdog=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
class NavigationWatchdog{
 constructor(options={}){this.minProgress=options.minProgress??2;this.stuckAfterMs=options.stuckAfterMs??1200;this.retargetCooldownMs=options.retargetCooldownMs??1800;this.maxFailures=options.maxFailures??3;this.reset();}
 reset(){this.lastTarget=null;this.lastTimestamp=null;this.bestDistance=Infinity;this.stationaryMs=0;this.failures=0;this.lastRetargetAt=-Infinity;}
 update({position,target,now,autonomous=true,moving=true}){
  if(!finitePoint(position)||!finitePoint(target)||!Number.isFinite(now))throw new TypeError('position, target and now must be finite');
  if(!autonomous||!moving){this.reset();return {action:'none',reason:'inactive'};}
  if(this.lastTimestamp!==null&&now<this.lastTimestamp)this.reset();
  const d=distance(position,target);
  if(!this.lastTarget||distance(target,this.lastTarget)>this.minProgress*2){this.lastTarget={...target};this.lastTimestamp=now;this.bestDistance=d;this.stationaryMs=0;this.failures=0;return {action:'none',reason:'new-target'};}
  const elapsed=Math.min(Math.max(now-this.lastTimestamp,0),500);this.lastTimestamp=now;
  if(d<=this.minProgress*2){this.stationaryMs=0;this.failures=0;this.bestDistance=d;return {action:'none',reason:'arrived'};}
  if(d<=this.bestDistance-this.minProgress){this.bestDistance=d;this.stationaryMs=0;this.failures=0;}else this.stationaryMs+=elapsed;
  if(this.stationaryMs<this.stuckAfterMs||now-this.lastRetargetAt<this.retargetCooldownMs)return {action:'none',reason:'monitoring'};
  this.stationaryMs=0;this.lastRetargetAt=now;this.failures++;
  if(this.failures>=this.maxFailures){this.failures=0;return {action:'abandon-target',reason:'repeated-blockage'};}
  return {action:'repath',reason:'no-net-progress',attempt:this.failures};
 }
}
return {NavigationWatchdog};
});
