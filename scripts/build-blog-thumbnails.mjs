/**
 * Build-time image variants for the blog (run by hand, outputs are committed; NOT part of `npm run build`,
 * so Vercel builds stay basic and need no native sharp binary).
 *
 *   node scripts/build-blog-thumbnails.mjs
 *
 * For every public/blog-thumbnails/<slug>.jpg:
 *   - <slug>-<w>.avif (q50, effort 4) and <slug>-<w>.webp (q72) for w = 240, 480, 640, 800, 960, 1280
 *   - the JPEG fallback itself is re-encoded once (mozjpeg q78, 1600 wide, progressive, tagged in EXIF so a
 *     second run leaves it alone). It stays the og:image / Article image, so scrapers never need AVIF/WebP.
 * Also writes public/icon-app-96.webp (nav / footer logo shown at 40-48 px) and icon-app-224.webp (closing CTA, 96-112 px) and src/data/cover-sizes.json
 * (path -> real pixel size of every cover, plus /og-image.png) which the components read for width/height.
 *
 * Idempotent: a variant is skipped when it is newer than its source.
 */
import { readdirSync, statSync, existsSync, writeFileSync, utimesSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public', 'blog-thumbnails');
const WIDTHS = [240, 480, 640, 800, 960, 1280];
const TAG = 'qw-cover-v1';
const FALLBACK_QUALITY = 78;

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const newer = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

const sources = readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort();
const sizes = {};
const report = [];

for (const file of sources) {
  const slug = file.replace(/\.jpg$/, '');
  const src = join(dir, file);
  const meta = await sharp(src).metadata();
  const exifTagged = meta.exif && meta.exif.toString('latin1').includes(TAG);
  const made = [];

  for (const w of WIDTHS) {
    if (w >= meta.width) continue;
    for (const [ext, opts] of [
      ['avif', (p) => p.avif({ quality: 50, effort: 4 })],
      ['webp', (p) => p.webp({ quality: 72 })],
    ]) {
      const out = join(dir, `${slug}-${w}.${ext}`);
      if (newer(out, src)) continue;
      const info = await opts(sharp(src).resize({ width: w })).toFile(out);
      made.push(`${w}.${ext}=${kb(info.size)}`);
    }
  }

  if (!exifTagged) {
    const buf = await sharp(src)
      .resize({ width: 1600, withoutEnlargement: true })
      .withExif({ IFD0: { ImageDescription: TAG } })
      .jpeg({ quality: FALLBACK_QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();
    writeFileSync(src, buf);
    const now = new Date();
    for (const w of WIDTHS) for (const ext of ['avif', 'webp']) {
      const out = join(dir, `${slug}-${w}.${ext}`);
      if (existsSync(out)) utimesSync(out, now, now);
    }
    made.push(`jpg=${kb(buf.length)}`);
  }

  const m = await sharp(src).metadata();
  sizes[`/blog-thumbnails/${file}`] = { width: m.width, height: m.height };
  if (made.length) report.push(`${slug}: ${made.join(' ')}`);
}

// Generic site card (og:image everywhere else): real pixels, never resized.
const og = await sharp(join(root, 'public', 'og-image.png')).metadata();
sizes['/og-image.png'] = { width: og.width, height: og.height };

// Logo shown at 40-48 px: 96 x 96 WebP so the 96 KB icon-app-256.png is not fetched on every page.
// 224 x 224 for the closing-CTA icon (shown at 96-112 px, so 2x for retina).
const icon256 = join(root, 'public', 'icon-app-256.png');
for (const px of [96, 224]) {
  const out = join(root, 'public', `icon-app-${px}.webp`);
  if (newer(out, icon256)) continue;
  const info = await sharp(icon256).resize(px, px).webp({ quality: 90, effort: 6 }).toFile(out);
  report.push(`icon-app-${px}.webp=${kb(info.size)}`);
}

writeFileSync(join(root, 'src', 'data', 'cover-sizes.json'), `${JSON.stringify(sizes, null, 2)}\n`);
console.log(report.length ? report.join('\n') : 'up to date');
console.log(`cover-sizes.json: ${Object.keys(sizes).length} entries`);
