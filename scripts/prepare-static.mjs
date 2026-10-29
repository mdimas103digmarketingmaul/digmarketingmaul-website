import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { astroHtml } from './routes.mjs';

// public/ is generated, never a second editable source. Explicit allowlist prevents
// repository files, local state and backend source from becoming public assets.
const sources = ['assets', 'admin', 'checkout', 'payment', 'products',
  'playground', 'playground_home', 'playground_home2', 'playground_products',
  'styles.css', 'script.js', 'robots.txt', 'sitemap.xml'];
const root = process.cwd();
const output = resolve(root, 'public');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const source of sources) {
  await cp(source, join(output, source), {
    recursive: true,
    filter: (path) => !path.endsWith('.DS_Store') && !astroHtml.includes(relative(root, path)),
  });
}
// Compatibility URLs used by existing snapshots / bookmarks; one editable source.
await mkdir(join(output, 'assets/home'), { recursive: true });
await copyFile('src/styles/home/home.css', join(output, 'assets/home/styles.css'));
await copyFile('src/scripts/home/home.js', join(output, 'assets/home/script.js'));
for (const path of astroHtml) {
  const parent = join(output, path.slice(0, path.lastIndexOf('/')));
  // Empty directories are harmless; no static index may shadow an Astro route.
  if (path.includes('/')) await mkdir(parent, { recursive: true });
}
console.log('Prepared explicit standalone/static assets; Astro owns', astroHtml.length, 'HTML routes.');
