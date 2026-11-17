'use strict';
const {chromium}=require('playwright-core'),{spawn}=require('node:child_process'),assert=require('node:assert/strict'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),port=18769;
async function serve(){const child=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});for(let i=0;i<60;i++){try{const ok=await new Promise((res,rej)=>http.get('http://127.0.0.1:'+port+'/haigen.html',r=>{r.resume();res(r.statusCode===200)}).on('error',rej));if(ok)return child}catch{}await new Promise(r=>setTimeout(r,150))}child.kill();throw Error('server failed')}
async function run(){const server=await serve();let browser;try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 for(const vp of [{width:390,height:844},{width:1024,height:768}]){
 const ctx=await browser.newContext({viewport:vp,isMobile:true,hasTouch:true}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+port+'/haigen.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__haigenWorldReady,{timeout:30000});
 assert.equal(await page.locator('#cacheCompare205').count(),0,'panel must be hidden without opt-in');
 assert.equal(await page.evaluate(()=>window.__woodlandCache204.enabled),false,'cache must default off');
 await page.goto('http://127.0.0.1:'+port+'/haigen.html?cacheCompare205=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__haigenWorldReady&&window.__cacheCompare205,{timeout:30000});
 assert.equal(await page.locator('#cacheCompare205').count(),1);
 assert.equal(await page.evaluate(()=>window.__woodlandCache204.enabled),false);
 await page.locator('#cache205Toggle').click();assert.equal(await page.evaluate(()=>window.__woodlandCache204.enabled),true);
 await page.locator('#cache205Toggle').click();assert.equal(await page.evaluate(()=>window.__woodlandCache204.enabled),false);
 const initial=await page.evaluate(()=>({diag:window.__haigenPerfDiag.enabled,keys:Object.keys(localStorage).sort()}));
 await page.locator('#cache205Sample').click();assert.equal(await page.locator('#cache205Sample').isDisabled(),true);
 await page.waitForFunction(()=>window.__cacheCompare205.records.ORIGINAL!==undefined,{timeout:14000});
 const after=await page.evaluate(()=>({diag:window.__haigenPerfDiag.enabled,keys:Object.keys(localStorage).sort(),r:window.__cacheCompare205.records.ORIGINAL}));
 assert.equal(after.diag,initial.diag,'diagnostics state must be restored');assert.deepEqual(after.keys,initial.keys,'tool must not add save keys');
 assert(Number.isFinite(after.r.fps)&&Number.isFinite(after.r.frameMs));
 assert.equal(errors.length,0,'browser errors: '+errors.join('; '));
 console.log('PASS: iOS-size '+vp.width+'×'+vp.height+' opt-in panel, toggle, sample, diagnostics restore, no new save keys');
 await ctx.close();
 }
 }finally{if(browser)await browser.close();server.kill()}}
run().catch(e=>{console.error(e);process.exitCode=1});
