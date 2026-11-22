/* Haigen's World experimental navigation watchdog.
 * Independent module: not loaded by haigen.html until integrated and tested.
 * MIT licensed original implementation, inspired by classic action-adventure navigation.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HaigenNavigationWatchdog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
  class NavigationWatchdog {
    constructor(options = {}) {
      this.minProgress = options.minProgress ?? 2;
      this.stuckAfterMs = options.stuckAfterMs ?? 1200;
      this.retargetCooldownMs = options.retargetCooldownMs ?? 1800;
      this.maxFailures = options.maxFailures ?? 3;
      this.reset();
    }
    reset() {
      this.lastPosition = null;
      this.lastTarget = null;
      this.lastTimestamp = null;
      this.stationaryMs = 0;
      this.failures = 0;
      this.lastRetargetAt = -Infinity;
    }
    /**
     * Call at AI update rate, with monotonic time in milliseconds.
     * Returns a decision; never mutates game state or chooses an unsafe position.
     * Caller must check candidate destinations against existing collision/pathfinder.
     */
    update({ position, target, now, autonomous = true, moving = true }) {
      if (!finitePoint(position) || !finitePoint(target) || !Number.isFinite(now)) {
        throw new TypeError('position, target and now must be finite');
      }
      if (!autonomous || !moving) {
        this.reset();
        return { action: 'none', reason: 'inactive' };
      }
      if (this.lastTimestamp !== null && now < this.lastTimestamp) {
        this.reset();
      }
      if (!this.lastTarget || distance(target, this.lastTarget) > this.minProgress * 2) {
        this.lastPosition = { ...position };
        this.lastTarget = { ...target };
        this.lastTimestamp = now;
        this.stationaryMs = 0;
        return { action: 'none', reason: 'new-target' };
      }
      const elapsed = Math.min(Math.max(now - this.lastTimestamp, 0), 500);
      const advanced = distance(position, this.lastPosition);
      this.stationaryMs = advanced >= this.minProgress ? 0 : this.stationaryMs + elapsed;
      this.lastPosition = { ...position };
      this.lastTimestamp = now;
      if (distance(position, target) <= this.minProgress * 2) {
        this.stationaryMs = 0;
        this.failures = 0;
        return { action: 'none', reason: 'arrived' };
      }
      if (this.stationaryMs < this.stuckAfterMs || now - this.lastRetargetAt < this.retargetCooldownMs) {
        return { action: 'none', reason: 'monitoring' };
      }
      this.stationaryMs = 0;
      this.lastRetargetAt = now;
      this.failures += 1;
      if (this.failures >= this.maxFailures) {
        this.failures = 0;
        return { action: 'abandon-target', reason: 'repeated-blockage' };
      }
      return { action: 'repath', reason: 'no-progress', attempt: this.failures };
    }
  }
  return { NavigationWatchdog };
});
