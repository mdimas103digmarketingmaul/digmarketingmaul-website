// Renders the 1200×630 Open Graph / Twitter share cards into assets/brand/og/*.jpg.
// Usage:  node scripts/generate-og-images.mjs            (uses BROWSER_PATH or the macOS Chrome path)
// Re-run after changing a card below or the images it uses. Pages pick their card through
// `image` in their meta (BaseHead); pages without one use default.jpg.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets/brand/og');
const file = (p) => pathToFileURL(path.join(root, p)).href;
const executablePath = process.env.BROWSER_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const base = (body, { dark = false } = {}) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=JetBrains+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;font-family:Inter,sans-serif;background:${dark ? '#07111f' : '#f6f7f9'};color:${dark ? '#f4f6fa' : '#07111f'};
  background-image:linear-gradient(${dark ? 'rgba(244,246,250,.05)' : 'rgba(23,32,44,.05)'} 1px,transparent 1px),linear-gradient(90deg,${dark ? 'rgba(244,246,250,.05)' : 'rgba(23,32,44,.05)'} 1px,transparent 1px);background-size:60px 60px}
.brand{position:absolute;top:56px;left:64px;display:flex;align-items:center;gap:12px;font-size:22px;font-weight:600;letter-spacing:-.02em}
.brand img{width:36px;height:36px}
.copy{position:absolute;left:64px;bottom:64px;width:560px}
h1{font-size:84px;font-weight:650;line-height:.92;letter-spacing:-.06em}
h1 em{font-style:normal;color:#ff304f}
h1 .dot{color:#ff304f}
p{margin-top:22px;font-size:24px;line-height:1.35;color:${dark ? '#a5b0bf' : '#4f5c6c'}}
.url{margin-top:26px;font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.06em;color:${dark ? '#a5b0bf' : '#7a8797'}}
.vis{position:absolute;top:0;right:0;bottom:0;width:560px}
.rail{position:absolute;top:120px;left:0;right:0;height:2px;background:#07111f;opacity:.85}
.hang{position:absolute;top:120px;transform-origin:50% 0}
.hang::before{content:"";position:absolute;left:50%;top:0;width:1.5px;height:var(--s,40px);background:#07111f;opacity:.75}
.hang .paper{margin-top:var(--s,40px);padding:8px;border-radius:12px;background:#fff;box-shadow:0 0 0 1px rgba(23,32,44,.1),0 30px 50px -28px rgba(7,17,31,.55)}
.hang .paper img{display:block;width:100%;border-radius:7px}
</style></head><body>${body}</body></html>`;

const brand = (dark) => `<div class="brand"><img src="${file(dark ? 'assets/brand/logo/icon-reversed.svg' : 'assets/brand/logo/icon.svg')}">digmarketingmaul</div>`;
const copy = (title, lead, url) => `<div class="copy"><h1>${title}</h1><p>${lead}</p><div class="url">${url}</div></div>`;

const cards = {
  default: base(`${brand(true)}
    <div class="copy" style="width:1000px"><h1 style="font-size:120px">Build. Create. <em>Grow</em><span class="dot">.</span></h1>
    <p>M. Dimas Maulana — digital marketing, websites, ads and creative production.</p><div class="url">digmarketingmaul.com</div></div>`, { dark: true }),

  products: base(`${brand()}${copy('Products &amp; <em>services</em><span class="dot">.</span>', 'Website, video, graphic design, ads and courses — in one place.', 'digmarketingmaul.com/products')}
    <div class="vis">
      <div class="hang" style="left:40px;width:300px;--s:44px;rotate:-3deg"><div class="paper"><img src="${file('assets/website-development/clients/haikal-cfp.webp')}"></div></div>
      <div class="hang" style="left:330px;width:130px;--s:70px;rotate:3deg"><div class="paper"><img src="${file('assets/video-editing-motion/work/hijra-deposito-10-poster.webp')}"></div></div>
      <div class="rail"></div>
    </div>`),

  'website-development': base(`${brand()}${copy('Website <em>development</em><span class="dot">.</span>', 'Websites for personal brands, businesses and digital products.', 'digmarketingmaul.com/products/website-development')}
    <div class="vis">
      <div class="hang" style="left:20px;width:250px;--s:40px;rotate:-2.5deg"><div class="paper"><img src="${file('assets/website-development/clients/hanasari.webp')}"></div></div>
      <div class="hang" style="left:290px;width:250px;--s:90px;rotate:2deg"><div class="paper"><img src="${file('assets/website-development/clients/haikal-cfp.webp')}"></div></div>
      <div class="rail"></div>
    </div>`),

  'video-editing-motion': base(`${brand()}${copy('Video editing &amp; <em>motion</em><span class="dot">.</span>', 'Video production, editing and motion graphics.', 'digmarketingmaul.com/products/video-editing-motion')}
    <div class="vis">
      <div class="hang" style="left:70px;width:190px;--s:36px;rotate:-3deg"><div class="paper"><img src="${file('assets/video-editing-motion/work/hijra-deposito-10-poster.webp')}"></div></div>
      <div class="hang" style="left:300px;width:190px;--s:56px;rotate:2.5deg"><div class="paper"><img src="${file('assets/video-editing-motion/work/digmarketingmaul-website-offer-poster.webp')}"></div></div>
      <div style="position:absolute;left:252px;top:330px;width:64px;height:64px;border-radius:50%;background:#ff304f;box-shadow:0 16px 30px -10px rgba(255,48,79,.8);display:grid;place-items:center"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg></div>
      <div class="rail"></div>
    </div>`),

  'graphic-design': base(`${brand()}${copy('Graphic <em>design</em><span class="dot">.</span>', 'Design for digital content, marketing materials, presentations, print, and more.', 'digmarketingmaul.com/products/graphic-design')}
    <style>
      .post{position:relative;width:150px;aspect-ratio:4/5;overflow:hidden;border-radius:7px;background:#f3e7d3;padding:14px;color:#3b2416;font-size:28px;font-weight:760;line-height:.88;letter-spacing:-.06em}
      .post i{position:absolute;right:-30px;bottom:-34px;width:130px;height:130px;border-radius:50%;background:#e0702d}
      .poster{width:150px;aspect-ratio:210/297;border-radius:7px;background:#0d0d0d;padding:14px;color:#fff;font-weight:800}
      .poster small{display:block;font-size:12px;text-transform:uppercase;font-style:italic}
      .poster b{display:block;margin-top:8px;color:#d7ff3a;font-size:66px;line-height:.8;letter-spacing:-.08em}
      .slide{position:relative;width:210px;aspect-ratio:16/9;border-radius:7px;background:#fff;padding:14px;color:#13294b;font-size:22px;font-weight:750;letter-spacing:-.05em;box-shadow:inset 0 0 0 1px #e3e8f0}
      .slide i{position:absolute;top:18%;right:7%;bottom:18%;width:36%;border-radius:5px;background:#13294b}
    </style>
    <div class="vis">
      <div class="hang" style="left:0;--s:40px;rotate:-3deg"><div class="paper"><div class="post">Es Kopi<br>Aren.<i></i></div></div></div>
      <div class="hang" style="left:180px;--s:70px;rotate:2deg"><div class="paper"><div class="poster"><small>Mega sale</small><b>50%</b></div></div></div>
      <div class="hang" style="left:300px;--s:290px;rotate:-2deg"><div class="paper"><div class="slide" style="width:190px">About us.<i></i></div></div></div>
      <div class="rail"></div>
    </div>`),

  'digital-ads-management': base(`${brand()}${copy('Digital ads <em>management</em><span class="dot">.</span>', 'From setup and tracking to optimisation and reporting.', 'digmarketingmaul.com/products/digital-ads-management')}
    <style>.fn{position:absolute;left:40px;right:64px;top:150px;display:grid;gap:16px}.fn i{display:flex;align-items:center;height:62px;padding-left:22px;border-radius:12px;background:#07111f;color:#fff;font-style:normal;font-family:'JetBrains Mono',monospace;font-size:18px}.fn i:last-child{background:#ff304f}</style>
    <div class="vis"><div class="fn"><i style="width:100%">Reach</i><i style="width:76%">Click</i><i style="width:54%">Lead</i><i style="width:34%">Sale</i></div></div>`),

  'website-course': base(`${brand()}${copy('Website pertama kamu, <em>live</em> dari 0<span class="dot">.</span>', 'Course step-by-step sampai website kamu live.', 'digmarketingmaul.com/products/website-course')}
    <style>.st{position:absolute;left:30px;right:64px;top:210px}.st .c{display:flex;gap:10px}.st .c i{padding:10px 16px;border-radius:999px;background:#07111f;color:#fff;font-style:normal;font-family:'JetBrains Mono',monospace;font-size:16px}.st .c i:last-child{background:#ff304f}.st .p{display:flex;align-items:center;gap:16px;margin-top:40px;font-size:44px;font-weight:700;letter-spacing:-.05em}.st .p span{flex:1;height:6px;border-radius:6px;background:linear-gradient(90deg,#ff304f,#ff8a9c)}.st .p b:last-child{color:#ff304f}</style>
    <div class="vis"><div class="st"><div class="c"><i>Domain</i><i>Hosting</i><i>Design</i><i>Live</i></div><div class="p"><b>0</b><span></span><b>Live</b></div></div></div>`),
};

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [name, html] of Object.entries(cards)) {
  const tmp = path.join(out, `.${name}.html`);
  fs.writeFileSync(tmp, html);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `${name}.jpg`), type: 'jpeg', quality: 84 });
  fs.unlinkSync(tmp);
  console.log(`${name}.jpg`, (fs.statSync(path.join(out, `${name}.jpg`)).size / 1024).toFixed(0), 'KB');
}
await browser.close();
