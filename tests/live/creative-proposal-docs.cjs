/* Static contract: creative proposal docs and Gate 1 previews exist and stay proposal-only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../..');
const required=[
 'docs/priority-repairs-proposal.md',
 'docs/style-guide-and-asset-inventory.md',
 'docs/previews/painting-pose-concept.html',
 'docs/previews/fish-school-concept.html',
 'docs/previews/veiled-isle-concept.html',
 'docs/previews/style-homestead-mockup.html',
 'docs/previews/style-character-trees-mockup.html'
];
for(const rel of required){
 const full=path.join(root,rel);
 assert(fs.existsSync(full),rel+' missing');
 const text=fs.readFileSync(full,'utf8');
 assert.match(text,/proposal|PROPOSAL|Gate 1|Concept/i,rel+' should read as proposal/concept');
 assert.doesNotMatch(text,/MERGE NOW|deploy to production/i,rel+' must not instruct immediate deploy');
}
const proposal=fs.readFileSync(path.join(root,'docs/priority-repairs-proposal.md'),'utf8');
assert.match(proposal,/Veiled Isle/);
assert.match(proposal,/paintHaigen|Painting/);
assert.match(proposal,/drawLakeFish|Fish/);
assert.match(proposal,/Stage 1/);
const style=fs.readFileSync(path.join(root,'docs/style-guide-and-asset-inventory.md'),'utf8');
assert.match(style,/48×72|48x72/);
assert.match(style,/baseCameraScale/);
assert.match(style,/KEEP/);
assert.match(style,/RESTYLE/);
console.log('PASS creative-proposal-docs: Gate 1 docs and previews present');
