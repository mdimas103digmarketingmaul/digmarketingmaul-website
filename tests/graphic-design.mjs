// Run after npm run build. BROWSER_PATH may point to an installed Chromium.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let file = path.join('dist', decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
fs.mkdirSync('test-results', { recursive: true });

try {
  for (const mode of ['desktop', 'mobile', 'reduced-motion']) {
    const mobile = mode === 'mobile';
    const context = await browser.newContext({
      viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 960 },
      isMobile: mobile, hasTouch: mobile,
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
    });
    // Keep the audit local; never call production APIs, tracking or third parties.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === origin && !url.pathname.startsWith('/api/')
        ? route.continue() : route.fulfill({ status: 200, body: '' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const broken = [];
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) broken.push(response.url()); });
    await page.goto(`${origin}/products/`);
    await page.getByRole('tab', { name: 'Design', exact: true }).click();
    assert.match(await page.locator('.sc-creative img[data-k="jersey"]').getAttribute('src'), /hijra-runner-jersey-thumb/);
    assert.match(await page.locator('.sc-creative img[data-k="promo"]').getAttribute('src'), /hijra-deposito-april-thumb/);
    assert.equal(await page.locator('.sc-creative').evaluate(el => getComputedStyle(el, '::before').borderTopColor), 'rgb(255, 48, 79)');
    await page.locator('.sc-creative').screenshot({ path: `test-results/design-card-${mode}.png` });

    await page.goto(`${origin}/products/graphic-design/`);
    assert.equal(await page.locator('.sheet[data-cat="social"]').count(), 3);
    assert.equal(await page.locator('.sheet[data-cat="email"]').count(), 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${mode}: horizontal overflow`);
    await page.locator('[data-cat-go="social"]').click();
    await page.locator('[data-key="hijra-deposito-january"] [data-work-go]').click();
    assert.equal(await page.locator('[data-work-viewer]').evaluate(el => el.open), true);
    assert.notEqual(await page.locator('[data-mv-scroll]').evaluate(el => getComputedStyle(el).cursor), 'none');
    assert.notEqual(await page.locator('[data-mv-close]').evaluate(el => getComputedStyle(el).cursor), 'none');
    if (mode === 'desktop') {
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('has-cursor')), true);
      assert.equal(await page.locator('.cursor-ring').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    }
    for (const name of ['hijra-deposito-january', 'hijra-deposito-new-user', 'hijra-deposito-april']) {
      await page.locator('.mv-img').evaluate(img => img.decode());
      assert.match(await page.locator('.mv-img').getAttribute('src'), new RegExp(`${name}\\.webp$`));
      assert.deepEqual(await page.locator('.mv-img').evaluate(img => [img.naturalWidth, img.naturalHeight]), [1080, 1350]);
      if (name !== 'hijra-deposito-april') await page.locator('[data-mv-next]').click();
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-work-viewer]').evaluate(el => el.open), false);
    await expect(page.locator('[data-key="hijra-deposito-january"] [data-work-go]')).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/mv-lock/);

    await page.locator('[data-cat-go="email"]').click();
    await page.locator('[data-key="mti-juz-amma"] [data-work-go]').click();
    for (let i = 0; i < 3; i++) await page.locator('[data-mv-next]').click();
    await page.locator('.mv-img').evaluate(img => img.decode());
    assert.deepEqual(await page.locator('.mv-img').evaluate(img => [img.naturalWidth, img.naturalHeight]), [1188, 8705]);
    await page.screenshot({ path: `test-results/newsletter-preview-${mode}.png` });
    await page.locator('[data-mv-scroll]').evaluate(el => { el.scrollTop = el.scrollHeight; });
    assert.equal(await page.locator('[data-mv-scroll]').evaluate(el => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 2), true);
    await page.screenshot({ path: `test-results/newsletter-footer-${mode}.png` });
    await page.locator('[data-mv-close]').click();
    assert.equal(await page.locator('[data-work-viewer]').evaluate(el => el.open), false);
    await expect(page.locator('html')).not.toHaveClass(/mv-lock/);
    if (mode === 'desktop') {
      assert.equal(await page.locator('.cursor-ring').evaluate(el => getComputedStyle(el).visibility), 'visible');
      await page.locator('[data-key="mti-juz-amma"] [data-work-go]').click();
      await page.mouse.click(2, 2);
      assert.equal(await page.locator('[data-work-viewer]').evaluate(el => el.open), false, 'Backdrop closes preview');
    }

    // This page shares the viewer stylesheet and script.
    await page.goto(`${origin}/products/crm-email-management/`);
    await page.locator('[data-cat-go]').first().click();
    await page.locator('[data-work-go]').first().click();
    assert.equal(await page.locator('[data-work-viewer]').evaluate(el => el.open), true);
    assert.notEqual(await page.locator('[data-mv-scroll]').evaluate(el => getComputedStyle(el).cursor), 'none');
    await page.locator('[data-mv-close]').click();
    await expect(page.locator('html')).not.toHaveClass(/mv-lock/);
    assert.deepEqual(errors, [], `${mode}: browser errors`);
    assert.deepEqual(broken, [], `${mode}: broken local requests`);
    console.log(`PASS ${mode}: Design card, social gallery, continuous email, scrolling, cursor, close/focus and shared CRM viewer`);
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
