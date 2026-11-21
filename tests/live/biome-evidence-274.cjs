'use strict';
const {chromium}=require('playwright-core');
const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'biome-visual-evidence-274');fs.mkdirSync(out,{recursive:true});
const regions=[['snow',1500,-4000],['swamp',-2700,900],['rainforest',-5200,800],['desert',6500,5050],['downs',-1500,4900],['coast',900,7700],['wasteland',4500,2900]];
async function serve(){const p=spawn('python3',['-m','http.server','18874','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});for(let i=0;i<60;i++){try{const status=await new Promise((ok,fail)=>http.get('http://127.0.0.1:18874/haigen.html',r=>{r.resume();ok(r.statusCode)}).on('error',fail));if(status===200)return p}catch{}await new Promise(r=>setTimeout(r,150))}p.kill();throw Error('server unavailable')}
async function main(){const server=await serve();let browser;try{
browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
for(const device of [{name:'iphone',width:390,height:844},{name:'ipad',width:1024,height:768}]){
const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/haigen.html?qa=biomes-274',async route=>{const response=await route.fetch(),html=await response.text(),marker='function worldZoom(){return baseCameraScale()*cameraZoom}';assert(html.includes(marker));await route.fulfill({response,body:html.replace(marker,marker+';window.__biomeQA=(x,y)=>{cam.x=x;cam.y=y;cameraDetached=true;cameraLastPanAt=performance.now();return {x:cam.x,y:cam.y,region:expandedRegion(x,y)?.id||"woodland",landDepth:islandDepth(x,y)}};')})});
console.log('DEVICE',device.name);
await page.goto('http://127.0.0.1:18874/haigen.html?qa=biomes-274',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>window.__haigenWorldReady===true,{timeout:30000});
for(const [name,x,y] of regions){const result=await page.evaluate(([x,y])=>window.__biomeQA(x,y),[x,y]);console.log('VIEW',device.name,name,JSON.stringify(result));assert(result.region!=='woodland','invalid biome '+name);if(name==='desert')console.log('DESERT WATER CHECK',result.landDepth);await page.waitForTimeout(180);await page.locator('canvas#game').screenshot({path:path.join(out,device.name+'-'+name+'.png'),timeout:15000});console.log('CAPTURE',device.name,name)}
assert.equal(errors.length,0,'page errors '+errors.join(';'));await context.close()}
}finally{if(browser)await browser.close();server.kill()}}
main().catch(e=>{console.error('BIOME EVIDENCE FAILED',e);process.exitCode=1});
