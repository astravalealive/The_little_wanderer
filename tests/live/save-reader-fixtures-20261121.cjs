'use strict';
// Real save-reader regression fixtures. Does not touch browser production storage.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('haigen.html','utf8');
const begin=source.indexOf(' function readHaigenSave(storage,restore){');
const finish=source.indexOf('\n const useLiveSnapshot=',begin);
assert(begin>=0&&finish>begin,'live save reader must be found');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source.slice(begin,finish),context);
const read=context.readHaigenSave;
const KEY='wandererV127PreviewSave';
function storage(entries){
 const map=new Map(Object.entries(entries));
 const writes=[];
 return {map,writes,getItem:key=>map.has(key)?map.get(key):null,setItem(key,value){writes.push(key);map.set(key,value)}};
}
const fixture={
 wood:37,stone:18,berries:9,
 structures:[{type:'cabin',x:123,y:456,level:2}],
 memories:[{kind:'discovery',topic:'mushroom',day:3}],
 inventory:{axe:1,torch:1},questFlags:{frogFlippers:true},
 day:4,x:123,y:456
};
let s=storage({[KEY]:JSON.stringify(fixture)});
const loaded=read(s,false);
assert(loaded&&typeof loaded==='object','valid actual preview fixture must load');
for(const key of ['wood','stone','berries','structures','memories','inventory','questFlags','day','x','y']){
 assert.deepEqual(JSON.parse(JSON.stringify(loaded[key])),fixture[key],'save reader must preserve '+key);
}
assert.deepEqual(s.writes,[],'reading valid save must not write or mutate storage');
assert.equal(s.map.get(KEY),JSON.stringify(fixture),'save bytes must remain unchanged');
s=storage({[KEY]:'{bad',wandererV126PreviewSave:JSON.stringify(fixture)});
const fallback=read(s,false);
assert.equal(fallback.wood,37,'malformed primary must restore real legacy fixture');
assert.equal(s.map.get('wandererV127CorruptBackup'),'{bad','corrupt primary must be backed up');
console.log('PASS real save-reader fixture preservation, no mutation, and corrupt fallback');
