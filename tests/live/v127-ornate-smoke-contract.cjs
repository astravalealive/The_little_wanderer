/* Static contract: V127 ornate smoke targets canonical haigen.html after playtest redirect. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../..');
const stub=fs.readFileSync(path.join(root,'haigen-v127-ornate-playtest.html'),'utf8');
const live=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
const ornate=fs.readFileSync(path.join(root,'v127-ornate-ui.js'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/haigen-v127-ornate-smoke.yml'),'utf8');

assert.match(stub,/location\.replace\('\.\/haigen\.html'/,'ornate playtest stub must redirect to haigen.html');
assert.match(stub,/http-equiv="refresh" content="0;url=\.\/haigen\.html"/,'ornate playtest stub must include meta refresh to haigen.html');
assert.ok(stub.length<2000,'ornate playtest must remain a short redirect stub, not a second game copy');

assert.match(live,/function drawApprovedDylan\(/,'canonical haigen.html must keep approved Dylan renderer');
assert.match(live,/window\.__v125DylanStatus=/,'canonical haigen.html must expose Dylan status');
assert.match(live,/window\.__v126SkolliStatus=/,'canonical haigen.html must expose Skölli status');
assert.match(live,/wandererV127PreviewSave/,'canonical live save key remains V127');
assert.doesNotMatch(live,/localStorage\.setItem\('wandererV126PreviewSave'/,'canonical page must not write obsolete V126 save key');

assert.match(ornate,/oldStreamQuestRetired\|\|state\.stage>=6/,'ornate HUD must hide Silent Pond quest when retired');
assert.match(ornate,/__v127UISnapshot=\{version:128/,'ornate UI snapshot version is 128');

assert.match(workflow,/haigen\.html\?v=qa/,'browser-ui Playwright must load canonical haigen.html');
assert.doesNotMatch(workflow,/between\(old,'function drawApprovedDylan\('/,'stale Dylan byte-compare against redirect stub must be removed');
assert.match(workflow,/v127-ornate-smoke-contract\.cjs/,'workflow must run the static ornate smoke contract');

console.log('PASS v127-ornate-smoke-contract: redirect stub + canonical Dylan/Skölli + honest quest HUD');
