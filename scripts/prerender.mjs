/**
 * Post-build prerender.
 *
 * Renders every route via React 18's renderToPipeableStream from a Vite SSR
 * bundle (dist-ssr/entry-server.js), captures react-helmet-async tags, and
 * writes per-route static HTML to dist/<route>/index.html.
 *
 * No headless browser, no system Chromium dependency. Works identically on
 * macOS and Vercel's Linux build image.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { gzipSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');

const STATIC_ROUTES = ['/', '/features', '/support', '/privacy-policy', '/terms-of-use', '/eula', '/about/karol-billik', '/blog'];
// Topic-hub (pillar) and competitor-comparison routes are added back here once
// pillars.json / comparisons.json are populated. Empty for the initial launch.
const PILLARS = [];
const COMPARISONS = [];

const posts = JSON.parse(
  readFileSync(join(root, 'src/data/blogPosts.json'), 'utf-8'),
).filter((p) => p.isPublished !== false);

/** Lazy page chunk per route (the page components App.tsx loads with React.lazy). Home and the 404 are in the entry. */
const ROUTE_PAGE = {
  '/features': 'src/pages/FeaturesPage.tsx',
  '/support': 'src/pages/Support.tsx',
  '/privacy-policy': 'src/pages/PrivacyPolicy.tsx',
  '/terms-of-use': 'src/pages/TermsOfUse.tsx',
  '/eula': 'src/pages/EULA.tsx',
  '/about/karol-billik': 'src/pages/AuthorKarol.tsx',
  '/blog': 'src/pages/Blog.tsx',
};
const POST_PAGE = 'src/pages/BlogPost.tsx';

const routes = [
  ...STATIC_ROUTES,
  ...PILLARS,
  ...COMPARISONS,
  ...posts.map((p) => `/blog/${p.slug}`),
];

const manifestPath = join(distDir, '.vite', 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf-8')) : null;

/** Files to modulepreload for a route: its lazy page chunk plus the chunks that chunk imports, minus what the template already loads. */
function routeChunks(route, template) {
  if (!manifest) return [];
  const page = route.startsWith('/blog/') ? POST_PAGE : ROUTE_PAGE[route];
  if (!page) return [];
  const entry = manifest[page];
  if (!entry) throw new Error(`${page} is not in the Vite manifest (route ${route})`);
  const files = [];
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) return;
    for (const dep of chunk.imports ?? []) visit(dep);
    if (!chunk.isEntry && !template.includes(`/${chunk.file}`)) files.push(`/${chunk.file}`);
  };
  visit(page);
  return files;
}

function helmetToString(helmet) {
  if (!helmet) return '';
  return [
    helmet.title,
    helmet.priority,
    helmet.meta,
    helmet.link,
    helmet.script,
    helmet.style,
    helmet.base,
  ]
    .map((piece) => (piece && typeof piece.toString === 'function' ? piece.toString() : ''))
    .filter(Boolean)
    .join('\n');
}

/** Inline the built stylesheet only up to this size (gzip); above it, load it without blocking render. */
const INLINE_CSS_MAX_GZIP = 16 * 1024;
let inlined = false;

/**
 * Take the render-blocking <link rel="stylesheet"> out of the template. Small stylesheet: inline it as <style> so first
 * paint needs no CSS request (the /assets file stays in dist for client-side route changes). Larger than the limit:
 * keep the file but load it with media="print" + onload, with a <noscript> link.
 */
function inlineStylesheet(html) {
  const re = /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/;
  const m = re.exec(html);
  if (!m) throw new Error('no /assets stylesheet link in dist/index.html');
  const css = readFileSync(join(distDir, m[1]), 'utf-8');
  const gz = gzipSync(css).length;
  if (gz <= INLINE_CSS_MAX_GZIP) {
    console.log(`  CSS inlined (${(gz / 1024).toFixed(1)} KB gzip, ${m[1]})`);
    inlined = true;
    return html.replace(re, () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
  }
  console.log(`  CSS ${(gz / 1024).toFixed(1)} KB gzip is over the inline limit: print/onload swap (${m[1]})`);
  return html.replace(
    re,
    () => `<link rel="stylesheet" href="${m[1]}" media="print" onload="this.media='all'">\n  <noscript><link rel="stylesheet" href="${m[1]}"></noscript>`,
  );
}

async function prerender() {
  const template = inlineStylesheet(readFileSync(join(distDir, 'index.html'), 'utf-8'));
  const { render } = await import(pathToFileURL(ssrEntry).href);

  let succeeded = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const { html: appHtml, helmet } = await render(route);
      const helmetTags = helmetToString(helmet);

      // React 18.3.1's stream writer can flush its whole 2048-byte buffer when a
      // multi-byte char (Arabic, em dash) straddles a chunk, emitting unused NUL
      // bytes. Real content never contains NUL, so strip them before every write.
      const preloads = routeChunks(route, template)
        .map((f) => `<link rel="modulepreload" crossorigin href="${f}">`)
        .join('\n');
      const finalHtml = template
        .replace('</head>', () => `${preloads ? `${preloads}\n` : ''}${helmetTags}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace(/\0/g, '');

      const outDir = route === '/' ? distDir : join(distDir, route.slice(1));
      if (inlined && finalHtml.includes('rel="stylesheet"')) throw new Error('render-blocking stylesheet left in the page');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), finalHtml);

      succeeded += 1;
      console.log(`  ✓ ${route} (${(finalHtml.length / 1024).toFixed(1)}KB)`);
    } catch (err) {
      failed += 1;
      console.error(`  ✗ ${route}: ${err.message}`);
      if (err.stack) console.error(err.stack);
    }
  }

  // dist/404.html: Vercel serves it with status 404 for any path with no file.
  // Rendered from the NotFound route; data-not-found tells main.tsx to client-render.
  try {
    const { html: appHtml, helmet } = await render('/__not-found__');
    // Helmet emits `<meta data-rh="true" name="robots" ...>`; swap it for the plain tag.
    const helmetTags = helmetToString(helmet).replace(/<meta [^>]*name="robots"[^>]*>/g, '');
    const notFoundHtml = template
      // Drop the site-wide "index, follow" default so only the noindex tag remains.
      .replace(/<meta name="robots" content="index, follow[^"]*"\s*\/?>\s*/, '')
      .replace('</head>', `${helmetTags}\n<meta name="robots" content="noindex" />\n</head>`)
      .replace('<div id="root"></div>', `<div id="root" data-not-found="1">${appHtml}</div>`)
      .replace(/\0/g, '');
    if (!notFoundHtml.includes('data-not-found="1"') || !notFoundHtml.includes('<meta name="robots" content="noindex"')) {
      throw new Error('404 page missing data-not-found or noindex meta');
    }
    if (inlined && notFoundHtml.includes('rel="stylesheet"')) throw new Error('render-blocking stylesheet left in 404.html');
    writeFileSync(join(distDir, '404.html'), notFoundHtml);
    console.log(`  ✓ /404.html (${(notFoundHtml.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ /404.html: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  // The manifest is a build input only; keep it out of what gets deployed.
  rmSync(join(distDir, '.vite'), { recursive: true, force: true });

  console.log(`\nPrerender complete: ${succeeded} succeeded, ${failed} failed (of ${routes.length}).`);
  if (failed > 0) process.exit(1);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
