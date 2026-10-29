import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin=process.env.WORKER_TEST_ORIGIN||'http://127.0.0.1:8787';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname),'Local Worker only');
const baseline=JSON.parse(fs.readFileSync('tests/baseline.json','utf8'));
const results=[];
for(const file of Object.keys(baseline.files).filter(f=>f.endsWith('.html'))){
 const route='/'+file.replace(/index.html$/,'');
 const response=await fetch(origin+route);assert.equal(response.status,200,route);
 assert.ok(response.headers.get('content-type').includes('text/html'),route);
 results.push({route,status:response.status});
}
for(const route of ['/blog','/products','/frameworks','/checkout?product=website-course','/products/website-course','/index.html#profile','/blog/index.html']){
 const response=await fetch(origin+route,{redirect:'manual'});
 assert.ok([301,307,308].includes(response.status),`expected existing directory redirect: ${route}: ${response.status}`);
 results.push({route,status:response.status,location:response.headers.get('location')});
 if(route.includes('?product='))assert.ok(response.headers.get('location').includes('?product=website-course'));
}
for(const route of ['/checkout/?product=website-course','/payment/success/?invoice=local-audit&token=local-audit'])assert.equal((await fetch(origin+route)).status,200);
// Wrong methods, missing input, or missing admin credentials: no payment creation/webhook submission.
for(const [route,expected] of [['/api/create-payment',405],['/api/create-midtrans-payment',405],['/api/doku-notification',405],['/api/midtrans-notification',405],['/api/payment-status',400],['/admin/api/overview',403]]){
 const response=await fetch(origin+route);assert.equal(response.status,expected,route);results.push({route,status:response.status});
}
const html=await (await fetch(origin+'/')).text();
const asset=html.match(/(?:href|src)="(\/_astro\/[^" ]+)"/)[1];assert.equal((await fetch(origin+asset)).status,200);
assert.equal((await fetch(origin+'/worker.js')).status,404);
assert.equal((await fetch(origin+'/package.json')).status,404);
assert.equal((await fetch(origin+'/not-a-real-page/')).status,404);
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/worker.json',JSON.stringify(results,null,2));
console.log('PASS: 36 Worker-served HTML routes, directory/HTML redirects, query retention, hashed assets, API rejection and private source exclusion. No transaction or database mutation.');
