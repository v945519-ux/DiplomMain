const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { products, categories } = require('./catalog.json');
const user = {id:999,username:'design_preview',first_name:'Анна',last_name:'',email:'preview@example.test'};
const profile = {user,phone:'+7 900 000-00-00',address:'Тестовый адрес, 12',avatar:null};
let quantity = 2, favorites = [], calls = [], browser;
const cart = () => ({id:999,items:quantity ? [{id:999,product:products[0],quantity,subtotal:String(Number(products[0].price)*quantity)}] : [],total_items:quantity,total_price:String(Number(products[0].price)*quantity)});
(async()=>{
 browser = await chromium.launch({channel:'msedge',headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:1000}});
 const page = await context.newPage(); page.setDefaultNavigationTimeout(60000);
 const errors = [];
 page.on('pageerror', e=>errors.push(e.message));
 await context.route('**/_next/image?**',async route=>{
  const src = new URL(route.request().url()).searchParams.get('url');
  if (src?.includes('/media/')) {
   const p = products.find(p=>p.image===src);
   if (p) return route.fulfill({body:await fs.readFile(path.join(root,'config',decodeURIComponent(new URL(src).pathname))),contentType:'image/png'});
  }
  return route.continue();
 });
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),pathname=url.pathname;
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
  const data=req.postDataJSON(); calls.push({pathname,query:url.search,method:req.method(),data});
  function paginate(list, size=12) {
   const number=Number(url.searchParams.get('page') || 1);
   const next=new URL(url);next.searchParams.set('page',String(number+1));
   return {count:list.length,next:number*size<list.length?next.href:null,previous:null,results:list.slice((number-1)*size,number*size)};
  }
  let response;
  if(pathname==='/api/catalog/categories/') response=paginate(categories,3);
  else if(pathname==='/api/catalog/products/') {
   let list=[...products];
   const search=url.searchParams.get('search'); if(search) list=list.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
   const cat=url.searchParams.get('category_slug'); if(cat) list=list.filter(p=>p.category===categories.find(c=>c.slug===cat)?.id);
   if(url.searchParams.get('is_popular')) list=list.filter(p=>p.is_popular);
   if(url.searchParams.get('ordering')==='price') list.sort((a,b)=>a.price-b.price);
   response=paginate(list);
  } else if(pathname.startsWith('/api/catalog/products/')) response=products.find(p=>p.slug===decodeURIComponent(pathname.split('/')[4]));
  else if(pathname==='/api/auth/me/') response=user;
  else if(pathname==='/api/auth/profile/') response=profile;
  else if(pathname==='/api/auth/login/' || pathname==='/api/auth/register/') response={user,tokens:{access:'preview',refresh:'preview'}};
  else if(pathname==='/api/cart/add/') {quantity++;response=cart();}
  else if(pathname.startsWith('/api/cart/items/')) {quantity=req.method()==='DELETE'?0:data.quantity;response=cart();}
  else if(pathname==='/api/cart/') {if(req.method()==='DELETE')quantity=0;response=cart();}
  else if(pathname==='/api/favorites/') {if(req.method()==='POST') favorites.push({id:999,product:products.find(p=>p.id===data.product_id)});response={results:favorites};}
  else if(pathname.startsWith('/api/favorites/')) {favorites=[];response={};}
  else if(pathname==='/api/orders/choices/') response={delivery_types:[{value:'delivery',label:'Доставка'},{value:'pickup',label:'Самовывоз'}],payment_methods:[{value:'card',label:'Картой'},{value:'cash',label:'Наличными'}]};
  else if(pathname==='/api/orders/' && req.method()==='POST') {quantity=0;response={id:999,status_display:'Принят'};}
  else if(pathname==='/api/orders/') response={results:[]};
  else throw new Error('Unhandled mock endpoint: '+pathname);
  await route.fulfill({json:response,headers:{'access-control-allow-origin':'*'}});
 });
 const base=process.env.UI_BASE || 'http://127.0.0.1:3001';
 async function ready(){await page.locator('h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);}
 async function checkOverflow(label){const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.width+1,label+' overflows: '+JSON.stringify(size));}
 async function shot(name){await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});await page.screenshot({path:path.join(__dirname,name+'.png'),fullPage:name!=='home-mobile'});}
 await page.goto(base,{waitUntil:'networkidle'}); await ready(); await page.locator('article').first().waitFor(); await checkOverflow('desktop catalog'); await shot('home-desktop');
 assert.equal(await page.locator('article').count(),products.length,'Every page of the full assortment must be visible');
 assert.equal(await page.getByRole('combobox',{name:'Категория',exact:true}).locator('option').count(),categories.length+1);
 for (const category of categories) {
  await page.getByRole('combobox',{name:'Категория',exact:true}).selectOption(category.slug);
  const count=products.filter(p=>p.category===category.id).length;
  await page.waitForFunction(count=>document.querySelectorAll('article').length===count,count);
  assert.equal(await page.locator('article').count(),count,category.name+' must include all products');
  if(category.name==='Напитки')await shot('drinks-desktop');
 }
 await page.getByRole('button',{name:'Хиты',exact:true}).click();
 await page.getByRole('textbox',{name:'Поиск'}).fill('несуществующий');
 await page.getByRole('button',{name:'Всё меню',exact:true}).click();
 await page.waitForFunction(count=>document.querySelectorAll('article').length===count,products.length);
 assert.equal(await page.getByRole('textbox',{name:'Поиск'}).inputValue(),'');
 assert.equal(await page.getByRole('button',{name:'Хиты',exact:true}).getAttribute('aria-pressed'),'false');
 await page.getByRole('link',{name:'Выбрать пиццу'}).click();assert.ok(await page.locator('#menu').evaluate(el=>el.getBoundingClientRect().top>=0));
 await page.getByRole('textbox',{name:'Поиск'}).fill('небывающее название');await page.getByRole('heading',{name:'Ничего не найдено'}).waitFor();
 await page.getByRole('textbox',{name:'Поиск'}).fill('');await page.locator('article').first().waitFor();
 for(const width of [768,390,320]) {await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));await checkOverflow('catalog '+width);if(width===390)await shot('home-mobile');}
 await page.getByRole('button',{name:'В корзину',exact:true}).first().click();await page.waitForURL('**/auth');await ready();await checkOverflow('auth 320');
 await page.getByRole('button',{name:'Регистрация',exact:true}).click();await page.getByLabel('Повтор', {exact:true}).waitFor();await checkOverflow('register 320');
 await page.setViewportSize({width:1440,height:1000});await shot('auth-desktop');
 await page.getByRole('button',{name:'Вход',exact:true}).click();await page.getByLabel('Логин',{exact:true}).fill('design_preview');await page.getByLabel('Пароль',{exact:true}).fill('preview-password');await page.getByRole('button',{name:'Войти',exact:true}).click();await page.waitForURL('**/profile');await page.getByRole('button',{name:'Сохранить',exact:false}).waitFor();await checkOverflow('profile desktop');await shot('profile-desktop'); for (const width of [768,390,320]) {await page.setViewportSize({width,height:900});await checkOverflow('profile '+width);} await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/cart',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Увеличить',exact:true}).click();await page.locator('strong').filter({hasText:'3'}).first().waitFor();assert.equal(quantity,3);
 await page.getByRole('button',{name:'Уменьшить',exact:true}).click();await page.waitForFunction(()=>document.body.innerText.includes('2'));assert.equal(quantity,2);await shot('cart-desktop');
 for(const width of [768,390,320]) {await page.setViewportSize({width,height:900});await checkOverflow('cart '+width);if(width===390)await shot('cart-mobile');}
 await page.getByRole('button',{name:'Оформить заказ',exact:true}).click();await page.getByText('Заказ #999 принят.',{exact:false}).waitFor();assert.equal(quantity,0);
 await page.goto(base+'/products/'+products[0].slug,{waitUntil:'networkidle'});await ready();assert.equal(await page.locator('header').count(),1);await checkOverflow('detail mobile');await page.getByRole('button',{name:'Добавить в корзину',exact:true}).click();await page.getByRole('status').waitFor();assert.equal(quantity,1);
 await page.setViewportSize({width:1440,height:1000});await shot('product-desktop');
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'В избранное: '+products[0].name,exact:true}).click();await page.getByRole('button',{name:'Убрать из избранного: '+products[0].name,exact:true}).waitFor();
 await page.mouse.move(0,0);await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'),null,{timeout:3000});await page.emulateMedia({reducedMotion:'reduce'});const motion=await page.locator('article').first().evaluate(el=>getComputedStyle(el).transitionDuration);assert.equal(motion,'0s');
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus-visible').count(),1);
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(__dirname,'result.json'),JSON.stringify({passed:true,widths:[1440,768,390,320],api:'intercepted fixtures, no database writes',checks:['catalog','search','CTA','guest redirect','login','registration layout','profile','quantity','checkout','product detail','favorite','reduced motion','keyboard focus','no page errors'],requests:calls.length},null,2));
 console.log('PASS: responsive and functional browser checks');
})().catch(async e=>{await fs.writeFile(path.join(__dirname,'result.json'),JSON.stringify({passed:false,error:e.message},null,2));console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});



