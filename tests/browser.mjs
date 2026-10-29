import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { astroHtml } from '../scripts/routes.mjs';
const baseline=JSON.parse(fs.readFileSync('tests/baseline.json','utf8'));
const before=fs.mkdtempSync(path.join(os.tmpdir(),'maul-baseline-'));
for(const file of Object.keys(baseline.files).filter(p=>p!=='worker.js')){
 fs.mkdirSync(path.dirname(path.join(before,file)),{recursive:true});
 fs.writeFileSync(path.join(before,file),execFileSync('git',['show',`${baseline.commit}:${file}`],{maxBuffer:20e6}));
}
fs.mkdirSync('test-results',{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.json':'application/json'};
const serve=async root=>{
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');let target=path.join(root,decodeURIComponent(u.pathname));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){res.writeHead(404);return res.end('Not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,url:`http://127.0.0.1:${server.address().port}`};
};
const oldServer=await serve(before),newServer=await serve(path.resolve('dist'));
const executablePath=process.env.BROWSER_PATH;
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const results=[];
const makePage=async (viewport, reducedMotion = 'reduce')=>{
 const context=await browser.newContext({viewport,reducedMotion});
 // Block ALL external traffic, even iframe previews, tracking, gateway SDK and fonts.
 // Mock local API: tests must never create a transaction or touch production data.
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/admin/api/')) {
   if(u.pathname.endsWith('.js'))return route.fulfill({contentType:'application/javascript',body:'window.loadJokulCheckout = function(){};'});
   return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({success:false,error:'Local audit: API intentionally disabled'})});
  }
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.fulfill({status:200,body:'',contentType:u.pathname.endsWith('.css')?'text/css':'text/plain'});
  return route.continue();
 });
 return {context,page:await context.newPage()};
};
try{
 for(const width of (process.argv.includes("--behavior-only") ? [] : [1440,390])){
  const {context,page}=await makePage({width,height:900});
  for(const file of astroHtml){
   const route='/'+file.replace(/index.html$/,'');const label=(route==='/'?'home':route.replaceAll('/','_'))+'-'+width;
   const captures=[];const dimensions=[];const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for(const origin of [oldServer.url,newServer.url]){
    const response = await page.goto(origin+route,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,`visual route ${origin+route}`);
    await page.evaluate(async()=>{
     for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}
     window.scrollTo(0,0);
    });
    await page.waitForTimeout(150);
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
    captures.push(await page.screenshot({fullPage:true,animations:'disabled'}));
    dimensions.push(await page.locator('body').boundingBox());
   }
   const a=PNG.sync.read(captures[0]),b=PNG.sync.read(captures[1]);let ratio=1;
   if(a.width===b.width&&a.height===b.height){const diff=new PNG({width:a.width,height:a.height});const count=pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:.15});ratio=count/(a.width*a.height);if(ratio>.001)fs.writeFileSync(`test-results/${label}-diff.png`,PNG.sync.write(diff));}
   if(ratio>.001){fs.writeFileSync(`test-results/${label}-before.png`,captures[0]);fs.writeFileSync(`test-results/${label}-after.png`,captures[1]);}
   results.push({route,width,diffRatio:ratio,dimensions,errors});console.log('Visual',width,route,(ratio*100).toFixed(3)+'%',errors);
   page.removeAllListeners('pageerror');
  }
  await context.close();
 }
 if(results.length) fs.writeFileSync('test-results/visual.json',JSON.stringify(results,null,2));
 // Route smoke checks include all standalone and playground HTML from the baseline.
 const {context,page}=await makePage({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const file of Object.keys(baseline.files).filter(p=>p.endsWith('.html'))){
  const response=await page.goto(newServer.url+'/'+file.replace(/index.html$/,''),{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,file);
 }
 // Marketing behavior; no SDK invocation or submit/payment action is performed.
 await page.goto(newServer.url+'/blog/');
 await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.goto(newServer.url+'/');await page.locator('.menu-toggle').click();
 await page.locator('.mobile-menu a[href="#profile"]').click();await page.waitForTimeout(200);assert.equal(new URL(page.url()).hash,'#profile');
 // Navbar order (2026-10-29): Home, Profile, Frameworks, Blog, Products — Products is the highlighted CTA.
 await page.goto(newServer.url+'/blog/');
 assert.deepEqual(await page.locator('.main-nav .nav-link').evaluateAll(as=>as.map(a=>a.textContent.replace(/\W+/g,''))),['01Home','02Profile','03Frameworks','04Blog','05Products']);
 assert.equal(await page.locator('.main-nav .nav-cta').getAttribute('href'),'/products/');
 await page.evaluate(()=>localStorage.clear());
 await page.goto(newServer.url+'/products/');
 // First visit is English; a chosen language is remembered.
 assert.equal(await page.locator('html').getAttribute('data-language'),'en');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('[data-maul-language-select]').selectOption('id');await page.reload();assert.equal(await page.locator('html').getAttribute('data-language'),'id');
 // Products: four product cards, creative services straight to WhatsApp, QRIS popover, brief → WhatsApp.
 assert.deepEqual(await page.locator('.cards a.card').evaluateAll(as=>as.map(a=>a.getAttribute('href'))),['/products/website-development/','/products/website-course/','/products/digital-ads-management/','/products/digital-marketing-ebooks/']);
 assert.equal(await page.locator('.svc[href*="wa.me"]').count(),9);
 assert.ok(decodeURIComponent(await page.locator('.svc').first().getAttribute('href')).includes('Video Motion Production'),'creative WhatsApp message');
 await page.locator('[data-qris]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-qris]').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');
 await page.locator('[data-maul-language-select]').selectOption('en');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('[data-product-international-toggle]').click();assert.equal(await page.locator('html').getAttribute('data-international'),'true');
 assert.equal(await page.locator('.card-price strong').first().textContent(),'USD 61');
 await page.locator('[data-product-international-toggle]').click();assert.equal(await page.locator('.card-price strong').first().textContent(),'Rp999.000');
 await page.locator('#f-name').fill('Local audit');await page.locator('.chip:has-text("Video motion")').click();
 assert.ok((await page.locator('[data-chat-text]').textContent()).includes('Local audit'),'products brief preview');
 await page.goto(newServer.url+'/frameworks/digital-ads-operating-system/');
 await page.locator('[data-maul-theme-select]').first().selectOption('dark');assert.equal(await page.locator('html').getAttribute('data-article-theme'),'dark');
 await page.locator('[data-maul-language-select]').first().selectOption('en');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 for(const route of ['website-development','digital-ads-management','digital-marketing-ebooks','digital-marketing-ebooks-midtrans']){
  await page.evaluate(()=>localStorage.clear());
  await page.goto(newServer.url+'/products/'+route+'/');
  await page.locator('[data-maul-language-select]').selectOption('en');assert.equal(await page.locator('html').getAttribute('data-language'),'en');
  // Website Development is light only (no dark toggle since 2026-10-29).
  if(route==='website-development')assert.equal(await page.locator('[data-maul-dark-toggle]').count(),0);
  else{const previous=await page.locator('html').getAttribute('data-theme');await page.locator('[data-maul-dark-toggle]').click();assert.notEqual(await page.locator('html').getAttribute('data-theme'),previous);}
  await page.locator('[data-product-international-toggle]').click();assert.equal(await page.locator('html').getAttribute('data-international'),'true');
 }
 await page.goto(newServer.url+'/products/digital-ads-management/');
 await page.locator('[name="business"]').fill('Local audit only');
 assert.ok((await page.locator('a[href*="wa.me"]').evaluateAll(as=>as.map(a=>a.href))).some(h=>decodeURIComponent(h).includes('Local audit only')),'WhatsApp brief');
 await page.goto(newServer.url+'/products/website-development/');
 // Selected work: hanging sheets, one live preview per client, scaled to the sheet; the ↗ button is the only link.
 assert.equal(await page.locator('.sheet iframe').count(),3);
 assert.ok((await page.locator('.sheet-screen').first().getAttribute('style')).includes('--s:'));
 assert.equal(await page.locator('.sheet a.sheet-go').count(),4);
 // Brief form composes a WhatsApp message; nothing is sent from the page.
 await page.locator('#f-name').fill('Local audit');await page.locator('.chip:has-text("Landing page")').click();
 assert.ok((await page.locator('[data-chat-text]').textContent()).includes('Local audit'),'brief preview');
 await page.evaluate(()=>localStorage.clear());
 await page.goto(newServer.url+'/products/website-course/');
 await page.locator('.theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.locator('[data-language-choice="en"]').click();assert.equal(await page.locator('html').getAttribute('data-language'),'en');
 await page.locator('.international-toggle').click();assert.equal(await page.locator('html').getAttribute('data-international'),'true');
 await context.close();
 // Exercise animation initialization with reduced-motion disabled as well.
 const motion = await makePage({width:1440,height:900}, 'no-preference');
 motion.page.on('pageerror', e => errors.push(e.message));
 await motion.page.goto(newServer.url+'/');
 await motion.page.waitForFunction(()=>document.documentElement.classList.contains('is-ready'));
 await motion.page.locator('[data-stack="creative"]').click();
 assert.equal(await motion.page.locator('[data-stack="creative"]').getAttribute('aria-pressed'),'true');
 await motion.page.goto(newServer.url+'/blog/');
 await motion.page.locator('.topic-section').scrollIntoViewIfNeeded();
 await motion.page.waitForFunction(()=>document.querySelector('.topic-section').classList.contains('is-visible'));
 await motion.context.close();
 fs.writeFileSync('test-results/browser.json',JSON.stringify({visual:results,routeCount:36,smokeErrors:errors},null,2));
 assert.ok(results.every(r=>r.errors.length===0),'runtime errors in visual checks');
 assert.ok(results.every(r=>r.diffRatio<=.001),'visual regression; inspect test-results');
 assert.equal(errors.length,0,`smoke runtime errors: ${errors}`);
 console.log(`PASS: 36 routes, ${results.length} visual comparisons, menu/profile/nav/products/theme/language/international/WhatsApp/iframe/course behavior. External traffic and APIs blocked.`);
} finally {await browser.close();oldServer.server.close();newServer.server.close();fs.rmSync(before,{recursive:true,force:true});}
