import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';
import { astroHtml } from './routes.mjs';
const baseline=JSON.parse(fs.readFileSync('tests/baseline.json','utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const attr=(n,k)=>n?.attrs?.find(a=>a.name===k)?.value;
const nodes=n=>[n,...(n.childNodes||[]).flatMap(nodes)];
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
const old=p=>execFileSync('git',['show',`${baseline.commit}:${p}`],{encoding:'utf8',maxBuffer:10e6});
const meta=s=>{
 const ns=nodes(parse(s));
 const by=(tag,k,v)=>ns.find(n=>n.tagName===tag&&attr(n,k)===v);
 return {title:text(ns.find(n=>n.tagName==='title')),description:attr(by('meta','name','description'),'content'),canonical:attr(by('link','rel','canonical'),'href'),robots:attr(by('meta','name','robots'),'content'),icons:ns.filter(n=>n.tagName==='link'&&['icon','apple-touch-icon','manifest'].includes(attr(n,'rel'))).map(n=>attr(n,'href'))};
};
assert.equal(hash('worker.js'),baseline.files['worker.js'],'Worker must remain byte-identical');
let passthrough=0, htmlCount=0, links=0;
for(const [file,digest] of Object.entries(baseline.files)) {
 if(file==='worker.js'||astroHtml.includes(file))continue;
 assert.ok(fs.existsSync('dist/'+file),`missing compatibility asset: ${file}`);
 assert.equal(hash('dist/'+file),digest,`passthrough changed: ${file}`);passthrough++;
}
const docs=new Map();
for(const file of Object.keys(baseline.files).filter(f=>f.endsWith('.html'))) {
 const output=fs.readFileSync('dist/'+file,'utf8');htmlCount++;
 const parsed=nodes(parse(output));docs.set('/'+file,parsed);
 assert.deepEqual(meta(output),meta(old(file)),`SEO changed: ${file}`);
 if(astroHtml.includes(file)) {
  assert.ok(!fs.existsSync('public/'+file),`duplicate ownership: ${file}`);
  assert.equal(parsed.filter(n=>n.tagName==='script'&&text(n).includes("event:'gtm.js'")).length,1,`GTM loader count: ${file}`);
  assert.equal(parsed.filter(n=>n.tagName==='noscript'&&text(n).includes('googletagmanager.com/ns.html')).length,1,`GTM noscript count: ${file}`);
  const oldIds=nodes(parse(old(file))).map(n=>attr(n,'id')).filter(Boolean);
  const newIds=new Set(parsed.map(n=>attr(n,'id')).filter(Boolean));
  for(const id of oldIds)assert.ok(newIds.has(id),`lost anchor ${file}#${id}`);
 }
}
for(const [file,ns] of docs) {
 // Historical playground may intentionally reference absent design assets. Production is strict.
 if(file.startsWith('/playground'))continue;
 for(const n of ns) for(const key of ['href','src']) {
  const ref=attr(n,key);if(!ref||/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref))continue;
  const url=new URL(ref,'https://local.test'+file);
  if(/^\/(api|admin\/api|cdn-cgi)\//.test(url.pathname))continue;
  let target=decodeURIComponent(url.pathname);let disk=path.join('dist',target);
  if(fs.existsSync(disk)&&fs.statSync(disk).isDirectory()){target+='index.html';disk=path.join('dist',target);}
  assert.ok(fs.existsSync(disk),`broken reference: ${file} -> ${ref}`);links++;
  if(url.hash&&docs.has(target))assert.ok(docs.get(target).some(x=>attr(x,'id')===decodeURIComponent(url.hash.slice(1))),`missing anchor: ${file} -> ${ref}`);
 }
}
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,9);
assert.ok(!/playground|\/admin|\/checkout|\/payment/.test(sitemap));
const catalog=JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
const worker=fs.readFileSync('worker.js','utf8');
for(const p of catalog.filter(p=>p.amount&&p.status==='available')) {
 const amount=worker.match(new RegExp('"'+p.id+'": \\{[\\s\\S]*?amount: (\\d+)'))?.[1];
 assert.equal(p.amount,Number(amount),`presentation price drift: ${p.id}`);
}
// Stale catalog flow is intentionally removed only where there are no buy-now controls.
assert.ok(!fs.readFileSync('dist/products/index.html','utf8').includes('maulLastPayment'));
assert.ok(!fs.readFileSync('dist/products/index.html','utf8').includes('/api/doku-checkout-sdk.js'));
console.log(`PASS: ${htmlCount} HTML routes; ${passthrough} byte-identical passthrough files; ${links} local references; SEO, anchors, GTM, pricing and Worker preservation.`);
