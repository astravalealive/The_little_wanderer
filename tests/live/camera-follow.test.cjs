'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('haigen.html', 'utf8');
const source = html.slice(html.indexOf('const draggingCamera=cameraTouches.size>0;'), html.indexOf('for(let f of state.structures)'));
function scene(overrides = {}) {
  return {
    cameraTouches: new Set(), cameraLastPanAt: 0, cameraReleaseAt: 0,
    performance: { now: () => 10000 }, CAMERA_IDLE_RETURN_MS: 5000,
    worldEditorActive: false, visitorRoom: false, homeInside: false,
    trollStumpInside: false, autonomousHomeVisit: false,
    cameraDetached: false, playerInput: false,
    state: { x: 0, y: 0, autonomy: true }, cam: { x: 0, y: 0 },
    look: { x: 0, y: 0 }, W: 1024, H: 768, dt: 16,
    worldZoom: () => 1, presentationPortraitFraming: () => false,
    WORLD_MIN: -7500, WORLD: 10500,
    clamp: (n, low, high) => Math.max(low, Math.min(high, n)),
    ...overrides
  };
}
function step(context) {
  vm.runInNewContext('{'+source+'}', context);
}
let c = scene({ state: { x: 30, y: 25, autonomy: true } });
step(c);
assert.deepEqual(c.cam, { x: 0, y: 0 }, 'small steps should not scroll');
c = scene({ cameraDetached: true, playerInput: true, state: { x: 500, y: 0, autonomy: false } });
step(c);
assert.equal(c.cameraDetached, false, 'manual walking must restore follow');
assert(c.cam.x > 0 && c.cam.x < 436, 'return must be gradual');
for (const overrides of [
  { cameraTouches: new Set([1]) },
  { cameraReleaseAt: 9900 },
  { worldEditorActive: true },
  { homeInside: true },
  { visitorRoom: true },
  { trollStumpInside: true },
  { autonomousHomeVisit: true }
]) {
  c = scene({ state: { x: 500, y: 0, autonomy: true }, ...overrides });
  step(c);
  assert.equal(c.cam.x, 0, 'pans and special views must retain control');
}
c = scene({ cameraDetached: true, cameraLastPanAt: 9900 });
step(c);
assert.equal(c.cameraDetached, true);
c.cameraLastPanAt = 0;
step(c);
assert.equal(c.cameraDetached, false, 'idle autonomy must resume follow');
for (const dt of [16, 33, 100]) {
  c = scene({ dt, playerInput: true });
  for (let elapsed = 0; elapsed < 10000; elapsed += dt) {
    c.state.x += dt * .2;
    step(c);
  }
  assert(c.state.x - c.cam.x < 120, 'walking should stay near the central zone');
}
console.log('PASS camera dead zone, smooth walking follow, pan hold, idle return, interiors and frame rates');
