const assert = require('node:assert/strict');
const { NavigationWatchdog } = require('./navigation-watchdog');
function step(w, now, x = 0, y = 0, autonomous = true) {
  return w.update({ position: { x, y }, target: { x: 100, y: 0 }, now, autonomous });
}
const w = new NavigationWatchdog({ stuckAfterMs: 1000, retargetCooldownMs: 1000, maxFailures: 2 });
assert.equal(step(w, 0).action, 'none');
assert.equal(step(w, 500).action, 'none');
assert.equal(step(w, 1000).action, 'repath');
assert.equal(step(w, 1500).action, 'none');
assert.equal(step(w, 2000).action, 'abandon-target');
assert.equal(step(w, 2500, 5).action, 'none');
assert.equal(step(w, 2600, 5, 0, false).reason, 'inactive');
assert.equal(step(w, 3000).reason, 'new-target');
assert.throws(() => w.update({ position: { x: NaN, y: 0 }, target: { x: 1, y: 1 }, now: 0 }), TypeError);
console.log('Navigation watchdog tests passed');
