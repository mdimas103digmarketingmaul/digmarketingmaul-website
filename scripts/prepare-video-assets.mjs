// Regenerates assets/video-editing-motion/work/* (Video Editing & Motion · selected work)
// from the final renders. Sources are only read, never changed. Needs ffmpeg on PATH; the
// WebP poster uses the motion-engine repo's own sharp install, so this repo gains no dependency.
// Not part of the build.
//
//   node scripts/prepare-video-assets.mjs "<hijra final .mp4>" "<website offer final .mp4>" "<path>/digmarketingmaul-motion-engine"
//
// Per video, three files:
//   <name>-poster.webp   540×960 still, shown before any video loads
//   <name>-preview.mp4   540×960 H.264, silent, for the muted loop on the sheet
//   <name>.mp4           720×1280 H.264 + AAC, loaded only when the visitor presses play
// All MP4s are "faststart" (moov atom first) so playback starts while the rest streams.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const [hijra, offer, sharpRepo] = process.argv.slice(2);
if (!hijra || !offer || !sharpRepo) throw new Error('Pass the Hijra Deposito render, the Website Offer render and a repo with sharp installed.');
const sharp = createRequire(join(sharpRepo, 'package.json'))('sharp');
const out = join(process.cwd(), 'assets/video-editing-motion/work');
await mkdir(out, { recursive: true });

const jobs = [
  // name, source, poster frame (s)
  ['hijra-deposito-10', hijra, 2.6],
  ['digmarketingmaul-website-offer', offer, 1.5],
];

const ff = (args, opts = { stdio: 'inherit' }) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], opts);
const h264 = ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-g', '60'];
const kb = async (f) => `${((await stat(f)).size / 1024).toFixed(0)} KB`;

for (const [name, src, posterAt] of jobs) {
  const poster = join(out, `${name}-poster.webp`);
  const preview = join(out, `${name}-preview.mp4`);
  const full = join(out, `${name}.mp4`);
  const png = ff(['-ss', String(posterAt), '-i', src, '-frames:v', '1', '-vf', 'scale=540:960:flags=lanczos', '-f', 'image2pipe', '-c:v', 'png', '-'], { maxBuffer: 64 << 20 });
  await sharp(png).webp({ quality: 80, effort: 6 }).toFile(poster);
  ff(['-i', src, '-an', '-vf', 'scale=540:960:flags=lanczos', ...h264, '-crf', '28', preview]);
  ff(['-i', src, '-vf', 'scale=720:1280:flags=lanczos', ...h264, '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', full]);
  console.log(name, '· poster', await kb(poster), '· preview', await kb(preview), '· full', await kb(full));
}
