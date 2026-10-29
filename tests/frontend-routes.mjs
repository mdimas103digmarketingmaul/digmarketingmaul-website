import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.argv[2]||'http://127.0.0.1:4321';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname),'Local frontend only');
const baseline=JSON.parse(fs.readFileSync('tests/baseline.json','utf8'));
for(const file of Object.keys(baseline.files).filter(f=>f.endsWith('.html'))){
 const route='/'+file.replace(/index.html$/,'');const r=await fetch(origin+route);assert.equal(r.status,200,route);
 assert.ok(r.headers.get('content-type').includes('text/html'),route);
}
console.log('PASS: all 36 HTML routes on',origin);
