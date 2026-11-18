# Haigen live regression foundation

This is an additive, PR-triggered smoke suite for the **canonical** `haigen.html`. It never tests the older preview HTML pages or the production website.

Checks: live startup readiness and error overlay, phone/tablet touch layouts and mobile menu, canvas and joystick presence, uncaught JavaScript errors, failed image HTTP responses, optional asset report, isolated localStorage persistence across reload, and clean startup after reload.

**Boundaries:** The suite uses a fresh browser context per viewport and a synthetic QA-only localStorage key. It does not read or rewrite real player save data. It does **not** prove backwards compatibility of every historical save schema; that requires approved fixtures and explicit save-key/schema inventory. The suite does not move boats or characters, or mutate game state, so boat boarding, directional movement, shoreline collisions, gamepad hardware and native iOS Safari remain **manual/next-phase checks**. A successful Chromium mobile emulation run is not equivalent to iPad Safari verification.

CI is additive and does not edit the existing workflows or the game. The new workflow triggers for relevant pull requests and by manual dispatch; it does not deploy. If checks reveal an existing failure, report it instead of changing gameplay in this PR.

Next phase (separate approval): safe deterministic boat/collision test hooks or fixtures, save migration fixtures, controller mocks and native iOS testing.
