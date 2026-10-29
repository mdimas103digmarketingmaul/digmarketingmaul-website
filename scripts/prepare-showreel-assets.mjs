// Regenerates assets/home/showreel/* (homepage SECTION 02) from the two sample-site repos (read-only).
// Uses the CFP repo's own sharp install, so this repo gains no dependency. Not part of the build.
//
//   node scripts/prepare-showreel-assets.mjs "<path>/bumi-aksara-portfolio/website-thufeil-cfp" "<path>/mammaroti"
import { createRequire } from 'node:module';
import { copyFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const [cfp, bakery] = process.argv.slice(2);
if (!cfp || !bakery) throw new Error('Pass the website-thufeil-cfp and mammaroti repo paths.');
const sharp = createRequire(join(cfp, 'package.json'))('sharp');
const out = join(process.cwd(), 'assets/home/showreel');

const jobs = [
  // Sample 1 — CFP placeholder persona (AI-generated in the CFP repo). /option-2/ (real client) is never used.
  [cfp, 'src/assets/profile/haikal-portrait.png', 'cfp/haikal-portrait-640.webp', 640],
  [cfp, 'src/assets/insight/post-desk.jpg', 'cfp/post-desk-360.webp', 360],
  // Sample 2 — bakery product renders. Logos (public/logos/*) are never copied.
  [bakery, 'public/images/hero-bun.webp', 'bakery/hero-bun-520.webp', 520],
  [bakery, 'public/images/original-half-left.webp', 'bakery/original-half-left-640.webp', 640],
  [bakery, 'public/images/original-half-right.webp', 'bakery/original-half-right-640.webp', 640],
  [bakery, 'public/images/taro-half-left.webp', 'bakery/taro-half-left-640.webp', 640],
  [bakery, 'public/images/taro-half-right.webp', 'bakery/taro-half-right-640.webp', 640],
];
for (const [repo, src, name, width] of jobs) {
  await mkdir(join(out, dirname(name)), { recursive: true });
  const info = await sharp(join(repo, src)).resize({ width }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(join(out, name));
  console.log(name, `${info.width}×${info.height}`, `${(info.size / 1024).toFixed(1)} KB`);
}

// Bebas Neue + Poppins (SIL OFL 1.1), copied with their licences.
await mkdir(join(out, 'bakery/fonts'), { recursive: true });
for (const f of ['bebas-neue-latin-400-normal.woff2', 'bebas-neue-LICENSE.txt', 'poppins-latin-400-normal.woff2', 'poppins-latin-600-normal.woff2', 'poppins-LICENSE.txt']) {
  await copyFile(join(bakery, 'public/fonts', f), join(out, 'bakery/fonts', f));
}
console.log('fonts copied');
