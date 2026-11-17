/* Static contract: on-screen version/identity surfaces agree with GAME_BUILD. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
const version=JSON.parse(fs.readFileSync(path.join(root,'haigen-version.json'),'utf8'));
const build=Number(version.build);
assert(Number.isInteger(build)&&build>0,'haigen-version.json build missing');
const label='V'+build;

const buildDecl=source.match(/const GAME_BUILD=(\d+)/);
assert(buildDecl,'GAME_BUILD declaration missing');
assert.equal(Number(buildDecl[1]),build,'GAME_BUILD must match haigen-version.json');

assert.match(source,new RegExp(`<title>Haigen's World ${label} · Woodland Paths</title>`),'document title default must use GAME_BUILD');
assert.match(source,new RegExp(`id="hudBuildBadge"[^>]*>${label}</span>`),'HUD badge default must use GAME_BUILD');
assert.match(source,new RegExp(`id="devVersion"[^>]*>${label}</div>`),'devVersion chrome default must use GAME_BUILD');

assert.match(source,/hudBuildBadge\.textContent=buildLabel/,'runtime must sync HUD badge from GAME_BUILD');
assert.match(source,/buildBadge\.textContent=buildLabel/,'runtime must sync bottom-right badge from GAME_BUILD');
assert.match(source,/document\.title="Haigen's World "\+buildLabel\+" · Woodland Paths"/,'runtime must sync document title from GAME_BUILD');

const body=source.slice(source.indexOf('<body>'),source.indexOf('<script>'));
const bodyVersions=[...body.matchAll(/V\d{3,}/g)].map(m=>m[0]);
assert.deepEqual(bodyVersions,[label,label],'body chrome must only show the current GAME_BUILD label');
assert.doesNotMatch(body,/\bV318\b|\bV344\b|\bV408\b/,'stale identity labels must not remain in body chrome');

console.log('PASS game-build-identity: title, HUD badge, and chrome use V'+build);
