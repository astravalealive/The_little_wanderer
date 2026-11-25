'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { NavigationWatchdog } = require('./navigation-watchdog');
const html = fs.readFileSync('haigen.html', 'utf8');
const source = html.slice(html.indexOf('const autoNav='), html.indexOf('// V208: temporary travel camp'));
function walk(target, standable) {
  const state = { x: 0, y: 0, autonomy: true };
  const context = vm.createContext({
    state, target, window: { HaigenNavigationWatchdog: { NavigationWatchdog } },
    dist: (a,b) => Math.hypot(a.x-b.x, a.y-b.y), time: 0,
    islandDepth: () => 500, walkingLakeLevel: () => 2,
    blockedBySolid: (x,y) => !standable(x,y),
    mindWrite() {}, autoIgnore: new Map(), autoDestination: null, autoPause: 0
  });
  vm.runInContext(source, context);
  const tick = new vm.Script('autoTravel(target,40,25)');
  for (let step = 0; step < 1500; step++) {
    context.time += 40;
    if (tick.runInContext(context)) return true;
    assert(standable(state.x,state.y), 'crossed a blocked cell');
    if (context.autoPause) break;
  }
  return false;
}
assert(walk({ x: 3000, y: 0 }, (x,y) => x < 590 || x > 650 || Math.abs(y) > 80));
assert(walk({ x: -1800, y: -1700 }, () => true));
assert.equal(walk({ x: 3000, y: 0 }, (x,y) => Math.hypot(x,y) < 5), false);
console.log('PASS long travel across bounded legs, detour, and blocked departure');
