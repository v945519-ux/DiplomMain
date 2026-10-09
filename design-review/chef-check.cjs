const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
(async()=>{
const b=await chromium.launch({channel:'msedge',headless:true});
try {
 const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('http://localhost:3001',{waitUntil:'domcontentloaded'});
 const icon=p.locator('header img[src="/ronni-chef.webp"]');
 await icon.waitFor();await icon.evaluate(i=>i.decode());
 await p.locator('header').screenshot({path:'design-review/chef-header.png'});
 await p.setViewportSize({width:320,height:800});
 const size=await p.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));
 if(size.s>size.w+1)throw Error('Mobile overflow');
 await p.locator('header').screenshot({path:'design-review/chef-header-mobile.png'});
 console.log('PASS: chef image loaded; header fits desktop and 320px');
} finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
