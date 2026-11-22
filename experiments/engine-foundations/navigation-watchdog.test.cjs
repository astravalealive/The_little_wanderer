const assert=require('node:assert/strict');
const {NavigationWatchdog}=require('./navigation-watchdog');
const w=new NavigationWatchdog({minProgress:0.2,stuckAfterMs:1000,retargetCooldownMs:1000,maxFailures:2});
const step=(now,x=0,autonomous=true,target=100)=>w.update({position:{x,y:0},target:{x:target,y:0},now,autonomous});
assert.equal(step(0).reason,'new-target');
assert.equal(step(500,0.5).action,'none');
assert.equal(step(1000,0).action,'none'); // pacing is movement, not net progress
assert.equal(step(1500,0.5).action,'repath');
assert.equal(step(2000,0).action,'none');
assert.equal(step(2500,0.5).action,'abandon-target');
assert.equal(step(2600,5,false).reason,'inactive');
assert.equal(step(3000).reason,'new-target');
assert.equal(step(3100,1).action,'none');
assert.equal(step(3200,2).action,'none');
assert.equal(step(3300,3).action,'none');
assert.equal(step(3400,3,true,200).reason,'new-target');
assert.throws(()=>w.update({position:{x:NaN,y:0},target:{x:1,y:1},now:0}),TypeError);
console.log('Navigation watchdog regression tests passed');
