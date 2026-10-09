const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
let browser;
(async()=>{
 const api='http://127.0.0.1:8000/api';
 const initial=await fetch(api+'/catalog/products/').then(r=>r.json());
 const categories=await fetch(api+'/catalog/categories/').then(r=>r.json());
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3001',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(count=>document.querySelectorAll('article').length===count,initial.count,{timeout:60000});
 assert.equal(await page.locator('article').count(),99);
 const checks=[];
 for(const category of categories.results){
  const response=await fetch(api+'/catalog/products/?category_slug='+encodeURIComponent(category.slug)).then(r=>r.json());
  await page.getByRole('combobox',{name:'Категория',exact:true}).selectOption(category.slug);
  await page.waitForFunction(count=>document.querySelectorAll('article').length===count,response.count,{timeout:60000});
  const names=await page.locator('article h3').allTextContents();
  assert.equal(names.length,response.count);
  const links=await page.locator('article h3 a').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
  assert.equal(new Set(links).size,links.length);
  checks.push({category:category.name,shown:names.length});
  if(category.name==='Напитки'){
   await page.locator('article').first().scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.querySelectorAll('article img')].filter(el=>el.getBoundingClientRect().top<innerHeight).every(el=>el.complete),null,{timeout:60000});
   await page.screenshot({path:path.join(__dirname,'assortment-drinks-live.png')});
  }
 }
 await page.getByRole('button',{name:'Всё меню',exact:true}).click();
 await page.waitForFunction(count=>document.querySelectorAll('article').length===count,initial.count);
 await page.getByRole('button',{name:'Хиты',exact:true}).click();
 await page.getByRole('textbox',{name:'Поиск'}).fill('несуществующий');
 await page.getByRole('heading',{name:'Ничего не найдено'}).waitFor();
 await page.getByRole('button',{name:'Всё меню',exact:true}).click();
 await page.waitForFunction(count=>document.querySelectorAll('article').length===count,initial.count);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  const size=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert.ok(size.s<=size.w+1);
 }
 assert.deepEqual(errors,[]);
 const result={passed:true,source:'Live Django API and production Next.js, no mocks or writes',total:initial.count,categories:checks};
 await fs.writeFile(path.join(__dirname,'assortment-live-result.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());

