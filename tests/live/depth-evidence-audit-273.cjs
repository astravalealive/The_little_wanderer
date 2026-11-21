'use strict';
// Validate completeness and metadata of extracted screenshot evidence.
// This deliberately does NOT claim that visual occlusion is correct.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const dir=process.argv[2]||'depth-visual-evidence';
assert(fs.existsSync(dir),'screenshot evidence directory missing');
const sizes={forest:[1024,768],ipad:[1024,768],iphone:[390,844]};
const kinds=['companions','deer','haigen','troll'];
const obstacles=['rock','stump','tree'];
function dimensions(buffer){
 assert.equal(buffer.toString('hex',0,8),'89504e470d0a1a0a','invalid PNG signature');
 return [buffer.readUInt32BE(16),buffer.readUInt32BE(20)];
}
let count=0;
for(const [device,size] of Object.entries(sizes)){
 for(const kind of kinds)for(const obstacle of obstacles){
  const pair=['behind','front'].map(side=>{
   const name=`${device}-${kind}-${obstacle}-${side}.png`;
   const file=path.join(dir,name);
   assert(fs.existsSync(file),'missing capture '+name);
   const bytes=fs.readFileSync(file);
   assert.deepEqual(dimensions(bytes),size,'wrong screenshot dimensions '+name);
   count++;
   return bytes;
  });
  assert(!pair[0].equals(pair[1]),'identical pair; not useful evidence: '+device+'/'+kind+'/'+obstacle);
 }
}
assert.equal(count,72);
console.log('PASS screenshot evidence file count, PNG dimensions and pair non-identity (NOT occlusion sign-off)');
