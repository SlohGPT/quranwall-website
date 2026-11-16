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
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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

const routes = [
  ...STATIC_ROUTES,
  ...PILLARS,
  ...COMPARISONS,
  ...posts.map((p) => `/blog/${p.slug}`),
];

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

async function prerender() {
  const template = readFileSync(join(distDir, 'index.html'), 'utf-8');
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
      const finalHtml = template
        .replace('</head>', `${helmetTags}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace(/\0/g, '');

      const outDir = route === '/' ? distDir : join(distDir, route.slice(1));
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
    writeFileSync(join(distDir, '404.html'), notFoundHtml);
    console.log(`  ✓ /404.html (${(notFoundHtml.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ /404.html: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  console.log(`\nPrerender complete: ${succeeded} succeeded, ${failed} failed (of ${routes.length}).`);
  if (failed > 0) process.exit(1);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
