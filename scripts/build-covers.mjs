/**
 * Renders the QuranWall blog covers (2026-11-18, the quranwall-covers skill). Layout and rules come from
 * scripts/cover-engine.mjs, the same file on FaithWall, QuranWall and NoteWall: a short HOOK with one gold
 * accent word, a topic pill with an icon and an optional badge on the left; on the right a tilted iPhone whose
 * lock screen is QuranWall's own mockup (the Wallpaper art from src/components/mockup/Wallpaper.tsx) with one
 * ayah in English, Saheeh International, exactly as the post or src/data/showcaseVerses.ts quotes it.
 *
 * Input:  src/data/blogCovers.json  ({slug, wallpaper, ayah: {key, text}, hook, tag, icon, badge?} per post)
 * Output: public/blog-thumbnails/<slug>-cover.jpg, and each post's meta.image + the listing's thumbnail point
 *         at it. The old cover jpg and its variants are removed once nothing points at them (covers are served
 *         immutable, so a new look needs a new file name). Then run `node scripts/build-blog-thumbnails.mjs`
 *         for the avif/webp variants and src/data/cover-sizes.json.
 *
 * Rules the script enforces: the ayah text must appear word for word in the post's own verse section or in
 * showcaseVerses.ts (no typed scripture, no Arabic on covers: the Uthmani text needs its own credit), hooks are
 * at most 6 words with one *accent* word, and no price/free/trial words.
 *
 *   node scripts/build-covers.mjs                 # all covers
 *   node scripts/build-covers.mjs <slug>...       # only these posts
 *   node scripts/build-covers.mjs --out <dir> ... # samples to a folder, no data file touched
 *   node scripts/build-covers.mjs --dry           # check the entries only
 *
 * Needs Google Chrome (CHROME_PATH to override); esbuild (from Vite) compiles the mockup wallpaper for Node.
 */
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Lucide from 'lucide-react';
import { build } from 'esbuild';
import { launch, coverHtml, esc, LAYOUT_NAMES } from './cover-engine.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const coversPath = join(root, 'src/data/blogCovers.json');
const listingPath = join(root, 'src/data/blogPosts.json');
const postPath = (slug) => join(root, `src/data/posts/${slug}.json`);

// ---------- the app's wallpaper art, compiled from the site's own mockup ----------
const bundled = await build({
  stdin: {
    contents: `import { createElement } from 'react'; import { renderToStaticMarkup } from 'react-dom/server';
import Wallpaper from './src/components/mockup/Wallpaper.tsx';
export const wallpaperSvg = (variant) => renderToStaticMarkup(createElement(Wallpaper, { variant }));`,
    resolveDir: root, loader: 'tsx',
  },
  bundle: true, format: 'esm', platform: 'node', write: false, jsx: 'automatic', external: ['react', 'react-dom'], logLevel: 'error',
});
const tmpMod = join(root, 'node_modules/.cache-qw-covers.mjs');
writeFileSync(tmpMod, bundled.outputFiles[0].text);
const { wallpaperSvg } = await import(tmpMod);
rmSync(tmpMod);

const SHOWCASE = readFileSync(join(root, 'src/data/showcaseVerses.ts'), 'utf-8');

// ---------- brand ----------
const b64 = (p) => readFileSync(join(root, p)).toString('base64');
const FONT_CSS = `
@font-face{font-family:'DM Sans';font-weight:100 1000;src:url(data:font/woff2;base64,${b64('public/fonts/dm-sans-latin.woff2')}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:100 1000;src:url(data:font/woff2;base64,${b64('public/fonts/dm-sans-latin-ext.woff2')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF}
@font-face{font-family:'QW Verse Serif';font-weight:300 700;src:url(data:font/woff2;base64,${b64('public/fonts/qw-verse-serif-latin-var.woff2')}) format('woff2')}`;
const SANS = "'DM Sans', system-ui, sans-serif";
const GOLD = '#D9B968';
// eight-pointed star (khatam) lattice, the same motif as the app's Emerald wallpaper
const KHATAM = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><g fill="none" stroke="#f3e4b0" stroke-width="1.2" opacity=".16"><rect x="30" y="30" width="60" height="60"/><rect x="30" y="30" width="60" height="60" transform="rotate(45 60 60)"/></g></svg>')}")`;

const BRAND_CFG = {
  name: 'QuranWall',
  markHtml: '<span>Quran<b style="color:#D9B968">Wall</b></span>',
  iconSrc: `data:image/png;base64,${b64('public/icon-app-180.png')}`,
  fontCss: FONT_CSS,
  display: SANS,
  accent: '#E3C46B',
  accentInk: '#0C0D24',
  base: 'radial-gradient(120% 90% at 72% 0%, #2c1c58 0%, #1e1338 42%, #0f0a22 100%)',
  pattern: KHATAM,
  screenCss: `.screen svg.absolute{position:absolute;inset:0;width:100%;height:100%}
.veil{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.12),rgba(0,0,0,0) 35%,rgba(0,0,0,.28))}
.ayah{display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;justify-content:center;text-shadow:0 2px 12px rgba(0,0,0,.4)}
.ayah p{font-family:'QW Verse Serif',Georgia,serif;font-weight:500;line-height:1.38;color:rgba(255,255,255,.96);text-wrap:balance}
.ayah .ref{margin-top:24px;font-family:${SANS};font-weight:600;font-size:25px;color:rgba(255,255,255,.78)}`,
};
const GLOW = { night: '#6a4fd6', emerald: '#1f9a72', dusk: '#d0644f', photo: '#3f86a8' };

/** fan layout: the same content on two other wallpapers behind the front phone (one post, three styles). */
function fanWallpapers(c) {
  if (c.fanWallpapers) return c.fanWallpapers;
  const all = Object.keys(GLOW).filter((w) => w !== c.wallpaper);
  const h = [...c.slug].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return [all[h % all.length], all[(h + 1 + (h >> 3) % (all.length - 1)) % all.length]];
}

function screen(c) {
  return {
    bg: '#090731',
    overlay: wallpaperSvg(c.wallpaper) + '<div class="veil"></div>',
    time: 'rgba(255,255,255,.94)',
    date: c.date || 'Friday, 20 June',
    inner: `<div class="ayah"><p class="fit" data-min="26" data-max="60">${esc(c.ayah.text)}</p><div class="ref">Quran ${esc(c.ayah.key)} &middot; Saheeh Intl.</div></div>`,
  };
}

function iconSvg(name) {
  const Icon = Lucide[name];
  if (!Icon) throw new Error(`Unknown lucide icon ${name}`);
  return renderToStaticMarkup(createElement(Icon, { size: 30, strokeWidth: 2.25 }));
}

const HOOK_WORDS = 6;
const BANNED = /\b(free|price|priced|pricing|cost|costs|trial|subscribe|subscription|paywall|premium)\b|\$\d/i;
const norm = (s) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();

// ---------- main ----------
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const dry = args.includes('--dry');
const only = new Set(args.filter((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1)));
const data = JSON.parse(readFileSync(coversPath, 'utf-8'));
let listingSrc = readFileSync(listingPath, 'utf-8');
const listing = JSON.parse(listingSrc);
const problems = [];
for (const c of data.covers) {
  if (!wallpaperSvg(c.wallpaper || 'x').includes('<svg')) problems.push(`${c.slug}: unknown wallpaper ${c.wallpaper}`);
  if (!GLOW[c.wallpaper]) problems.push(`${c.slug}: no glow colour for wallpaper ${c.wallpaper}`);
  if (!c.hook) problems.push(`${c.slug}: no hook`);
  else {
    const words = c.hook.replace(/\*/g, '').split(/\s+/).filter(Boolean).length;
    if (words > HOOK_WORDS) problems.push(`${c.slug}: hook has ${words} words (max ${HOOK_WORDS})`);
    if (!/\*[^*]+\*/.test(c.hook)) problems.push(`${c.slug}: hook needs one *accent* word`);
  }
  for (const f of ['hook', 'tag', 'badge']) if (c[f] && BANNED.test(c[f])) problems.push(`${c.slug}: no price/free/trial words on covers (${f}: ${c[f]})`);
  if (!c.tag) problems.push(`${c.slug}: no tag`);
  if (!LAYOUT_NAMES.includes(c.layout)) problems.push(`${c.slug}: layout must be one of ${LAYOUT_NAMES.join(', ')}`);
  if (c.layout === 'number' && !(c.number && c.hook.replace(/\*/g, '').startsWith(c.number + ' '))) problems.push(`${c.slug}: number layout needs "number" and a hook that starts with it`);
  if (c.float) {
    if (!Lucide[c.float.icon]) problems.push(`${c.slug}: unknown float icon ${c.float.icon}`);
    for (const f of ['title', 'text']) if (!c.float[f] || c.float[f].length > 24 || BANNED.test(c.float[f])) problems.push(`${c.slug}: float ${f} must be 1-24 characters, no price words`);
    if (!['right', 'left', 'number'].includes(c.layout)) problems.push(`${c.slug}: float cards only fit right, left, number`);
  }
  if (!Lucide[c.icon]) problems.push(`${c.slug}: unknown icon ${c.icon}`);
  if (c.badge && c.badge.length > 24) problems.push(`${c.slug}: badge longer than 24 characters`);
  // the ayah must be quoted, not typed: word for word in the post's verse section or in showcaseVerses.ts
  let post;
  try { post = JSON.parse(readFileSync(postPath(c.slug), 'utf-8')); } catch { problems.push(`${c.slug}: no post file`); continue; }
  const quoted = post.sections.filter((s) => s.type === 'verse' && s.reference.match(/(\d+:\d+)/)?.[1] === c.ayah?.key).map((s) => norm(s.text));
  const inShowcase = SHOWCASE.includes(`key: '${c.ayah?.key}'`) && norm(SHOWCASE).includes(norm(c.ayah?.text || '§'));
  if (!c.ayah?.text || !(quoted.some((q) => q.includes(norm(c.ayah.text))) || inShowcase)) {
    problems.push(`${c.slug}: ayah ${c.ayah?.key} text is not quoted word for word in the post or showcaseVerses.ts`);
  }
  c.file = `/blog-thumbnails/${c.slug}-cover.jpg`;
  c.alt = `iPhone lock screen with Quran ${c.ayah?.key} (Saheeh International) on a QuranWall wallpaper`;
}
// Grid neighbours (blogPosts.json order, the order the blog grid shows) never share a layout: same style, a different
// picture each time. Pick one the 3 neighbours do not use (the covers skill, step 2).
{
  const bySlug = new Map(data.covers.map((c) => [c.slug, c]));
  const grid = listing.map((p) => bySlug.get(p.slug)).filter(Boolean);
  for (let i = 1; i < grid.length; i++) {
    if (grid[i].layout === grid[i - 1].layout) problems.push(`${grid[i].slug}: same layout (${grid[i].layout}) as its grid neighbour ${grid[i - 1].slug}`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
if (dry) { console.log(`${data.covers.length} cover entries OK`); process.exit(0); }

const engine = await launch();
let n = 0;
try {
  for (const c of data.covers) {
    if (only.size && !only.has(c.slug)) continue;
    const html = coverHtml(BRAND_CFG, {
      hook: c.hook, tag: c.tag, tagIconSvg: iconSvg(c.icon), badge: c.badge, layout: c.layout, number: c.number, float: c.float && { iconSvg: iconSvg(c.float.icon), title: c.float.title, text: c.float.text },
      glow: GLOW[c.wallpaper], screens: [screen(c), ...(c.layout === 'fan' ? fanWallpapers(c).map((w) => screen({ ...c, wallpaper: w })) : [])],
    });
    const { jpg, fit } = await engine.render(html);
    n++;
    if (outDir) {
      writeFileSync(join(outDir, `${c.slug}.jpg`), jpg);
      console.log(`${c.slug}  hook ${fit.hook}px  ayah ${fit.screens[0]}px  ${(jpg.length / 1024).toFixed(0)} KB`);
      continue;
    }
    writeFileSync(join(root, 'public', c.file), jpg);
    // post meta.image (+ alt) and the listing thumbnail; field-scoped text edits keep the files' formatting
    const pp = postPath(c.slug);
    let postSrc = readFileSync(pp, 'utf-8');
    const old = JSON.parse(postSrc).meta.image;
    postSrc = postSrc.replace(/^(\s*)"image": "[^"\n]*"/m, (_, ind) => `${ind}"image": ${JSON.stringify(c.file)}`);
    if (/"imageAlt": "[^"\n]*"/.test(postSrc)) postSrc = postSrc.replace(/"imageAlt": "[^"\n]*"/, `"imageAlt": ${JSON.stringify(c.alt)}`);
    JSON.parse(postSrc);
    writeFileSync(pp, postSrc);
    const at = listingSrc.indexOf(`"slug": ${JSON.stringify(c.slug)}`);
    if (at >= 0) {
      const end = listingSrc.indexOf('\n  }', at);
      const seg = listingSrc.slice(at, end).replace(/"thumbnail": "[^"\n]*"/, `"thumbnail": ${JSON.stringify(c.file)}`);
      listingSrc = listingSrc.slice(0, at) + seg + listingSrc.slice(end);
      const e = listing.find((p) => p.slug === c.slug);
      if (e) e.thumbnail = c.file;
    }
    if (old && old !== c.file && old.startsWith('/blog-thumbnails/') && !listing.some((p) => p.thumbnail === old)) {
      const base = old.replace(/^\/blog-thumbnails\//, '').replace(/\.jpg$/, '');
      for (const f of readdirSync(join(root, 'public/blog-thumbnails'))) {
        if (f === `${base}.jpg` || new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+\\.(webp|avif)$`).test(f)) rmSync(join(root, 'public/blog-thumbnails', f));
      }
    }
    console.log(`${c.slug}  Quran ${c.ayah.key}  hook ${fit.hook}px  ayah ${fit.screens[0]}px  ${(jpg.length / 1024).toFixed(0)} KB`);
  }
} finally {
  engine.close();
}
if (!outDir) {
  writeFileSync(coversPath, JSON.stringify(data, null, 2) + '\n');
  JSON.parse(listingSrc);
  writeFileSync(listingPath, listingSrc);
}
console.log(`\n${n} cover(s) rendered${outDir ? ` to ${outDir}` : ''}`);
