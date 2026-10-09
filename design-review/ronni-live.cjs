const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3001',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('article').length===99,null,{timeout:60000});
 const cards=page.locator('article');
 const failures=[];
 for(let index=0;index<99;index++){
  const card=cards.nth(index);await card.scrollIntoViewIfNeeded();
  try{await page.waitForFunction(i=>document.querySelectorAll('article img')[i].complete,index,{timeout:30000});await card.locator('img').evaluate(img=>img.decode());}
  catch{failures.push(await card.locator('h3').innerText());}
 }
 assert.deepEqual(failures,[],'All 99 photos must decode');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.locator('header').getByRole('link',{name:'Пиццерия Ронни',exact:true}).waitFor();
 const header=await page.locator('header').evaluate(el=>({background:getComputedStyle(el).backgroundColor,position:getComputedStyle(el).position,filter:getComputedStyle(el).backdropFilter}));
 assert.equal(header.background,'rgb(255, 255, 255)');assert.equal(header.position,'sticky');assert.equal(header.filter,'none');
 await page.screenshot({path:path.join(__dirname,'ronni-desktop.png')});
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:900});
  const dims=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert.ok(dims.s<=dims.w+1);
  if(width===390)await page.screenshot({path:path.join(__dirname,'ronni-mobile.png')});
 }
 await page.mouse.move(0,0);
 await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'),null,{timeout:3000});
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(__dirname,'ronni-result.json'),JSON.stringify({passed:true,images:99,missingImages:failures,header,widths:[1440,768,390,320],continuousAnimations:0},null,2));
 console.log('PASS: 99 images decoded; white sticky header; responsive; no continuous animations');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());

