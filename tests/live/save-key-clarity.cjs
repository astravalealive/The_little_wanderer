/* Static contract: live save key naming, dual-read/write, docs, and saveVersion. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
const docs=fs.readFileSync(path.join(root,'docs/haigen-save-keys.md'),'utf8');

assert.match(source,/const HAIGEN_SAVE_KEY='haigenWorldSave'/,'canonical live key constant required');
assert.match(source,/const HAIGEN_SAVE_LEGACY_LIVE='wandererV127PreviewSave'/,'legacy live key constant required');
assert.match(source,/const HAIGEN_SAVE_VERSION=1/,'saveVersion constant required');
assert.match(source,/function readHaigenSaveRaw\(\)/,'dual-read helper required');
assert.match(source,/function writeHaigenSave\(/,'dual-write helper required');
assert.match(source,/localStorage\.setItem\(HAIGEN_SAVE_KEY,raw\)/,'write must target canonical key');
assert.match(source,/localStorage\.setItem\(HAIGEN_SAVE_LEGACY_LIVE,raw\)/,'write must dual-write legacy live key');
assert.match(source,/localStorage\.getItem\(HAIGEN_SAVE_KEY\)\|\|localStorage\.getItem\(HAIGEN_SAVE_LEGACY_LIVE\)/,'read prefers canonical then legacy live');
assert.match(source,/state\.saveVersion=HAIGEN_SAVE_VERSION/,'save() must stamp saveVersion on state');
assert.match(source,/window\.__haigenSaveKeys=/,'runtime key probe required');
assert.match(source,/window\.__haigenSaveQA=/,'runtime save QA probe required');

assert.doesNotMatch(source,/localStorage\.setItem\('wandererV127PreviewSave'/,'direct V127 writes must go through writeHaigenSave');
assert.match(source,/localStorage\.removeItem\(HAIGEN_SAVE_KEY\)/,'fresh/reset must clear canonical live key');
assert.match(source,/localStorage\.removeItem\(HAIGEN_SAVE_LEGACY_LIVE\)/,'fresh/reset must clear legacy live key');
assert.doesNotMatch(source,/localStorage\.removeItem\('wandererTestSave'\)/,'must never wipe wandererTestSave');
assert.doesNotMatch(source,/localStorage\.removeItem\('wandererV126PreviewSave'\)/,'must never wipe V126 fallback');
assert.doesNotMatch(source,/localStorage\.removeItem\('wandererV125PreviewSave'\)/,'must never wipe V125 fallback');
assert.doesNotMatch(source,/localStorage\.removeItem\('wandererV121PreviewSave'\)/,'must never wipe V121 fallback');

assert.match(docs,/haigenWorldSave/,'docs must name the live key');
assert.match(docs,/wandererV127PreviewSave/,'docs must name the legacy live key');
assert.match(docs,/dual-write|Dual-write/i,'docs must describe dual-write');
assert.match(docs,/saveVersion/,'docs must mention saveVersion');

console.log('PASS save-key-clarity: live key, dual-read/write, saveVersion, docs');
