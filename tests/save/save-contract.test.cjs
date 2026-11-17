/* Read-only regression tests against the actual canonical save/load code. No browser, no production storage. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../haigen.html'),'utf8');
function between(start,end){const a=source.indexOf(start);assert(a>=0,'missing source marker: '+start);const b=source.indexOf(end,a+start.length);assert(b>a,'missing source boundary: '+end);return source.slice(a,b)}
const loadCode=between('let state;const fresh=()=>',' state.campTier=Math.max');
const saveCode=between('function save(){','setInterval(save,5000);');
const CURRENT='wandererV127PreviewSave';
const LEGACY=['wandererV126PreviewSave','wandererV125PreviewSave','wandererV121PreviewSave','wandererTestSave'];
function storage(seed={}){const data=new Map(Object.entries(seed));return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v))}}
function load(seed,search=''){const localStorage=storage(seed);const ctx={localStorage,location:{search},URLSearchParams,Date,Math,Number,JSON};vm.createContext(ctx);vm.runInContext(loadCode+';globalThis.result=state;',ctx,{timeout:1000});return {state:ctx.result,localStorage}}
const fixtures=[
 {name:'fresh install',seed:{},check:s=>{assert.equal(s.x,1500);assert.equal(s.wood,0)}},
 {name:'current save retains inventory and structures',seed:{[CURRENT]:JSON.stringify({x:321,wood:27,structures:[{kind:'shelter'}],quests:{home:true}})},check:s=>{assert.equal(s.x,321);assert.equal(s.wood,27);assert.equal(s.structures[0].kind,'shelter');assert.equal(s.quests.home,true)}},
 {name:'legacy V126 read',seed:{[LEGACY[0]]:JSON.stringify({x:456,stone:8})},check:s=>{assert.equal(s.x,456);assert.equal(s.stone,8)}},
 {name:'legacy V125 read',seed:{[LEGACY[1]]:JSON.stringify({berries:13})},check:s=>assert.equal(s.berries,13)},
 {name:'legacy V121 read',seed:{[LEGACY[2]]:JSON.stringify({twigs:5})},check:s=>assert.equal(s.twigs,5)},
 {name:'legacy test save read',seed:{[LEGACY[3]]:JSON.stringify({leaves:9})},check:s=>assert.equal(s.leaves,9)},
 {name:'current takes precedence over legacy',seed:{[CURRENT]:JSON.stringify({wood:3}),[LEGACY[0]]:JSON.stringify({wood:99})},check:s=>assert.equal(s.wood,3)},
 {name:'malformed current falls back to fresh',seed:{[CURRENT]:'{bad'},check:s=>assert.equal(s.wood,0)},
 {name:'resume safely clears at-sea flags',seed:{[CURRENT]:JSON.stringify({raftAfloat:true,skiffAtSea:true,skiffBerth:'invalid'})},check:s=>{assert.equal(s.raftAfloat,false);assert.equal(s.skiffAtSea,undefined);assert.equal(s.skiffBerth,undefined)}}
];
for(const f of fixtures){const {state,localStorage}=load(f.seed);f.check(state);assert.deepEqual(Object.fromEntries(localStorage.data),f.seed,'load must not modify browser storage');console.log('PASS load: '+f.name)}
{
 const state={x:80,y:90,raftAfloat:true,raftBerth:'shore',wood:12};
 const localStorage=storage();
 const ctx={state,localStorage,stumpPositionReady:false,Date,JSON,raftEnds:()=>({ready:true,a:{x:10,y:20},b:{x:300,y:400}}),skiffDeparture:null};
 vm.createContext(ctx);vm.runInContext(saveCode+';save()',ctx,{timeout:1000});
 const saved=JSON.parse(localStorage.getItem(CURRENT));
 assert.equal(saved.x,10);assert.equal(saved.y,20);assert.equal(saved.raftAfloat,false);assert.equal(saved.wood,12);
 assert.equal(state.x,80,'saving must not teleport the live character');
 console.log('PASS save: interrupted raft saves safe shore snapshot without mutating live state');
}
{
 const state={x:80,y:90,wood:7};
 const localStorage=storage();
 const ctx={state,localStorage,stumpPositionReady:false,Date,JSON,raftEnds:()=>{throw Error('unexpected raft lookup')},skiffDeparture:{x:11,y:22,skiffBerth:'saltwick',skiffAtSea:true}};
 vm.createContext(ctx);vm.runInContext(saveCode+';save()',ctx,{timeout:1000});
 const saved=JSON.parse(localStorage.getItem(CURRENT));
 assert.equal(saved.x,11);assert.equal(saved.y,22);assert.equal(saved.skiffAtSea,undefined);assert.equal(saved.wood,7);
 console.log('PASS save: interrupted skiff saves departure and strips at-sea flag');
}
console.log('Save contract checks complete (isolated fixtures, no real user saves).');
