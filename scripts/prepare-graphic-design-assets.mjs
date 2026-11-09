// Lossless crops / assembly of the owner's artwork, followed by web-sized exports.
// Usage: node scripts/prepare-graphic-design-assets.mjs --hijra-dir <folder> --newsletter-dir <folder>
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const root = path.resolve('assets/graphic-design');

async function exportWork(input, category, name, mail = false) {
  const folder = path.join(root, category);
  await fs.mkdir(folder, { recursive: true });
  const image = sharp(input);
  await image.clone().resize({ width: mail ? 1188 : 1600, withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(folder, `${name}.webp`));
  await image.clone().resize({ width: mail ? 680 : 800, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(folder, `${name}-card.webp`));
  const thumb = image.clone();
  if (mail) {
    const { width, height } = await image.metadata();
    thumb.extract({ left: 0, top: 0, width, height: Math.min(height, Math.round(width * 1.25)) });
  }
  await thumb.resize({ width: 480, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(folder, `${name}-thumb.webp`));
  const { width, height } = await sharp(path.join(folder, `${name}.webp`)).metadata();
  const card = await sharp(path.join(folder, `${name}-card.webp`)).metadata();
  console.log(`${category}/${name}: ${width}×${height}; card ${card.width}×${card.height}`);
}

if (args.includes('--hijra-dir')) {
  const folder = option('--hijra-dir');
  for (const [file, name] of [
    ['10_ Januari 1080x1350.png', 'hijra-deposito-january'],
    ['10_januari-newuser copy.png', 'hijra-deposito-new-user'],
    ['HIJRA - DEPOSITO APRIL 2026 - FEEDS.png', 'hijra-deposito-april'],
  ]) await exportWork(path.join(folder, file), 'social', name);
}

if (args.includes('--newsletter-dir')) {
  const folder = option('--newsletter-dir');
  // All six captures show the same 1188px email, with different outer margins.
  // Offsets were matched against overlapping artwork, not the screenshot edges.
  const captures = [
    ['Screenshot at Nov 10 02-47-34.png', 56, 0],
    ['Screenshot at Nov 10 02-47-49.png', 52, 1170],
    ['Screenshot at Nov 10 02-48-06.png', 50, 1365],
    ['Screenshot at Nov 10 02-48-17.png', 90, 1461],
    ['Screenshot at Nov 10 02-48-29.png', 62, 1611],
    ['Screenshot at Nov 10 02-48-45.png', 58, 1119],
  ];
  const width = 1188;
  const frames = [];
  for (const [file, left, offset] of captures) {
    const input = path.join(folder, file);
    const { height } = await sharp(input).metadata();
    const buffer = await sharp(input).extract({ left, top: 0, width, height }).png().toBuffer();
    frames.push({ buffer, height, offset, raw: await sharp(buffer).removeAlpha().raw().toBuffer() });
  }
  // Pick quiet rows inside each overlap to avoid cutting through type or details.
  const seams = [47]; // remove the first capture's browser strip / shadow
  for (let i = 1; i < frames.length; i++) {
    const previous = frames[i - 1], current = frames[i];
    const overlap = previous.height - current.offset;
    let best = { score: Infinity, y: 100 };
    for (let y = 50; y < overlap - 50; y++) {
      let score = 0;
      for (let x = 40; x < width - 40; x += 3) for (let c = 0; c < 3; c++) {
        const a = ((current.offset + y) * width + x) * 3 + c;
        const b = (y * width + x) * 3 + c;
        score += Math.abs(previous.raw[a] - current.raw[b]);
        score += 2 * Math.abs(current.raw[b] - current.raw[b + width * 3]);
      }
      // Prefer the middle of the overlap if several blank rows match equally.
      score += Math.abs(y - overlap / 2) * 0.01;
      if (score < best.score) best = { score, y };
    }
    seams.push(best.y);
  }
  let height = 60;
  const strips = [];
  for (let i = 0; i < frames.length; i++) {
    const top = seams[i];
    const bottom = i + 1 < frames.length ? frames[i + 1].offset + seams[i + 1] : frames[i].height;
    const strip = await sharp(frames[i].buffer).extract({ left: 0, top, width, height: bottom - top }).png().toBuffer();
    strips.push({ input: strip, left: 0, top: height });
    console.log(`Newsletter part ${i + 1}: rows ${top}–${bottom}; joins at ${height}`);
    height += bottom - top;
  }
  const email = await sharp({ create: { width, height: height + 60, channels: 3, background: '#ffffff' } }).composite(strips).png().toBuffer();
  await exportWork(email, 'newsletter', 'mti-with-gratitude', true);
}
