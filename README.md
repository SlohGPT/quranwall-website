# quranwall-website

Marketing site for **QuranWall** — a free iOS app that puts a daily Quran verse on your iPhone lock screen using wallpapers and widgets.

Vite + React + TypeScript, Tailwind, with custom SSR prerendering, a sitemap generator, and IndexNow submission. Deployed on Vercel at [quranwall.com](https://quranwall.com).

## Develop

```bash
npm install
npm run dev          # local dev server (http://localhost:5173)
npm run build        # generate sitemap -> client build -> SSR build -> prerender
npm run preview      # preview the production build
npm run typecheck
```

## Structure

- `src/pages` — routed pages (Home, Blog, legal, author). `Pillar`/`Compare` page
  components remain for when topic-hub and comparison pages are added back.
- `src/components` — UI sections (Hero, Features, Pricing, FAQ, Footer, …).
- `src/data` — `blogPosts.json`, `pillars.json`, `comparisons.json`. **Empty at launch** —
  add posts/pillars/comparisons here, then wire matching routes in `src/App.tsx`,
  `scripts/prerender.mjs`, and `scripts/generate-sitemap.mjs`.
- `public` — static assets. Images are **placeholders** (indigo + gold); swap with final art.

## Brand

Indigo surfaces (`#1E1338` / `#2C1C58` / `#362266`) + gold accent (`#D9B968`), matching
the iOS app. Defined in `tailwind.config.js`.

## Environment

No secrets are committed. Configure any required env vars (e.g. Supabase, if re-enabled)
in the Vercel project settings.
