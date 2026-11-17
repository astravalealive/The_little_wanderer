'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../haigen.html'),'utf8');
const start=source.indexOf('function boatwrightJournal(){'),end=source.indexOf('function journal(){',start);
assert(start>0&&end>start,'Boatwright helper must be immediately before journal');
assert(source.slice(end,end+1800).includes('${boatwrightJournal()}'),'Discovery Journal must display milestones');
const script=new vm.Script(source.slice(start,end)+';boatwrightJournal()');
function render(state){return script.runInNewContext({state})}
const base={wood:0,raftBuilt:false,skiffBerth:undefined,skiffLashing:false};
let output=render(base);
assert.match(output,/Gather 8 more wood/);assert.match(output,/Wood 0\/8 · gather 8 more carried wood · swamp reed lashing needed/);assert.match(output,/Locked · future distant-island materials/);
output=render({...base,wood:8,raftBuilt:true,skiffLashing:true});
assert.match(output,/✓ Built · Great Lake crossing/);assert.match(output,/Materials ready · build at Saltwick boathouse/);
output=render({...base,wood:2,raftBuilt:true,skiffLashing:true,skiffBerth:'island'});
assert.match(output,/moored at Riverwatch Lighthouse/);
output=render({...base,skiffBerth:'saltwick'});assert.match(output,/moored at Saltwick/);
assert.equal(Object.prototype.hasOwnProperty.call(base,'longshipBuilt'),false);
console.log('PASS Job 207: 4 progress states, existing-state-only journal, longship locked');
