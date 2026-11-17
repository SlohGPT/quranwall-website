# 05 — Blog design, Core Web Vitals and no-price pass (2026-11-17)

A manual session in the worktree `.claude/worktrees/qw-fixes-engine-120-a77d2b`, coordinated by the FaithWall session for all three sites. It shipped two tasks in one deploy: the blog design and Core Web Vitals pass, and Karol's no-price-mention order.

## Asked
- **Blog design and Core Web Vitals.** The shared three-site standard covers:
  - post typography: 18/19 px body, line-height 1.7/1.65, about 65 characters per line, H2 56 px above and 16 px below;
  - a table of contents, 4-level breadcrumbs, related and prev/next links, reading progress;
  - a compact blog index with topic chips;
  - a header Guides menu and a footer contrast fix;
  - above-the-fold text that paints without JS, responsive covers, inlined CSS;
  - a JS budget per page, plus fold acceptance: the first body block at y ≤ 760 at 390×844 and y ≤ 960 at 1440×900.
- **FaithWall's audit, added to the same pass:**
  - the hero CTA gap;
  - og:image and Article image sizes read from the real files;
  - real covers for the two posts that used `/og-image.png`;
  - no placeholder social links in the footer.
- **Social proof:** Karol, 11-17: "They're real, keep them", and keep "Trusted by 1,000+ believers". p5 is closed.
- **No price mention:** Karol, 11-17. Never mention the subscription, paywall, trial or price on the site; legal pages are exempt. "Free to download" is allowed only at download points, never in prose, and the site must never say that using QuranWall is free.

## Decided
- **Covers.** The two posts that used the generic card get their own AVIF/WebP covers. The other posts keep their art, re-encoded at 480/768/1200/1600 widths by `scripts/build-blog-thumbnails.mjs`; you run it by hand, and it is not part of the build. Sizes come from `src/data/cover-sizes.json`, so `og:image` and the Article schema carry the real width and height.
- **framer-motion is out of the bundle.** `Reveal` is now a CSS transition with an IntersectionObserver hook (`useInViewOnce`), and the prerendered HTML is visible without JS. The mockup crossfade (`FadeLayer`) is pure CSS.
- **react-markdown and remark-gfm are replaced by `src/lib/markdown.tsx`,** a small renderer that covers only what the posts use. Every route except Home and NotFound is lazy, and the prerender adds a `modulepreload` for each route's chunk from the Vite manifest.
- **Fonts.** The hero mockup's Amiri and the verse serif stay on Home. The DM Sans latin-ext subset is fetched because of the "ā" in the mockup; that costs about 18 KB, and it stays.
- **Two deploys became one.** Vercel never created a deployment for the 11:21 push of `99b0f6e`: no Vercel status on the commit, during the time the Security Checkpoint challenge was up. The Vercel usage check reads high, so instead of an empty commit, the no-price commit `8ce9cc1` went straight on top, and its deploy at 11:46 carries both tasks. The no-price commit changes no template, so the Lighthouse numbers below belong to the CWV pass.
- **No-price.** The site copy already carried no subscription, price, trial or "free"-about-QuranWall wording: 0 of 8 posts changed, and the FAQ, comparisons and components needed nothing. The work went into the machine files and the lint. No component reads `installLine` today, so no "Free to download" line was added to the install cards.
- **Not done in this pass:**
  - no `dateModified` or `lastmod` bumps, since the changes are template-only;
  - no post-body rewrites;
  - no hero-after-first-paragraph change and no search on `/blog`. Those are editorial decisions.

## Built (commits, one push each, live as `8ce9cc1`)
- `ebfdd0c` perf:
  - AVIF/WebP covers and the hero preload;
  - CSS inlined by the prerender;
  - framer-motion removed from the code;
  - a 96/224 px app icon;
  - a one-week cache for `og-image.png` and `icon-app-*.png`.
- `f7e1e4d` ui: post template. Table of contents (a rail on desktop, `<details>` on mobile), reading progress, 4-level breadcrumbs, prev/next, markdown styles.
- `e13eb5b` ui: `/blog` topic chips, compact cards and `content-visibility`; header Guides menu (`src/data/guideNav.ts`).
- `0303104`, `7e953a1` ui: footer text at white/65, nav landmarks with `<p>` titles, a "Start here" link, the placeholder socials removed, the "part of" line inside a nav.
- `c517d9a`, `59933a0` facts: the lint allows "Trusted by / Join <floor> believers" and the believers stat only at `downloadsFloor`; the grandfather list is gone; self-test 230.
- `92a9692` perf: own markdown renderer, lazy routes with modulepreload. Post-page JS went from 205 to 130 KB gzip.
- `ef53797` ui: post header spacing for the fold.
- `99b0f6e` a11y: the mobile Guides and Features submenus stay in the HTML, hidden with CSS, with `aria-controls`; links at white/70.
- `8ce9cc1` content (no price):
  - `public/pricing.md` deleted (now 404), along with the `qw-web-pricing` token;
  - `llms.txt` loses its subscription sentence, Price line and Pricing section;
  - `facts.json` `installLine` is "Free to download." and `subscriptionLine` is gone;
  - two subscription columns removed from pending queue item p9.
- **Lint flip in `8ce9cc1`:**
  - `pricing-mention` now forbids subscription, in-app purchase, trial, paywall, auto-renew and price wording;
  - the new `free-download-prose` rule allows the download phrases only as a standalone line;
  - the new `free-use-bare` rule fails "free app", "use it for free" and "all features for free";
  - only the three legal pages are exempt;
  - self-test 255.

## Verified
Lighthouse 12, 3 runs per page and strategy, median. Command: `npx -y lighthouse@12 <url> [--preset=desktop] --output=json --quiet --chrome-flags="--headless=new"`. Lab numbers only; field data (CrUX) needs traffic the site does not have yet.

**Live, before** (`d10718f`), perf / LCP s / a11y / KB transferred:

| Page | Mobile | Desktop |
|---|---|---|
| `/` | 93 / 2.96 / 94 / 513 | 100 / 0.65 / 94 / 513 |
| `/blog` | 91 / 3.23 / 95 / 1915 | 100 / 0.55 / 95 / 2342 |
| `/blog/quran-verse-iphone-lock-screen` | 93 / 3.18 / 95 / 663 | 100 / 0.63 / 95 / 664 |
| `/features` | 96 / 2.51 / 93 / 392 | 100 / 0.54 / 93 / 392 |

**Live, after** (`8ce9cc1`, live asset `index-0jMfpJab.js`, the same as the local build):

| Page | Mobile | Desktop |
|---|---|---|
| `/` | 99 / 1.89 / 100 / 344 | 100 / 0.50 / 100 / 344 |
| `/blog` | 99 / 1.84 / 100 / 258 | 100 / 0.43 / 100 / 299 |
| `/blog/quran-verse-iphone-lock-screen` | 98 / 1.98 / 100 / 303 | 100 / 0.47 / 100 / 304 |
| `/features` | 99 / 1.83 / 100 / 240 | 100 / 0.42 / 100 / 240 |

CLS 0 everywhere, TBT ≤ 3 ms, best practices and SEO 100.

The local fair comparison used the same gzip server (`serve@14.2.4`), with `origin/main` before and the branch after, mobile: `/` 85 → 93, `/blog` 83 → 96, post 86 → 95, `/features` 92 → 98.

JS gzip per page: `/` 96 KB, `/blog` 100 KB, post 130 KB, `/features` 100 KB. CSS 14 KB.

**Fold** (live, Playwright, 390×844 DPR 3 and 1440×900): the first body block is the Quick Answer callout.
- Hero posts: 726–759 on mobile and 876–925 on desktop, within 760/960.
- No-hero posts: 459 on mobile and 398 on desktop.
- The capture script's "first plain paragraph" is the one after the callout, so it reads higher (up to 848/986).
- H2: 56 px above, 16 px below. Body 18/30.6 px on mobile and 19/31.35 px on desktop, 600 px column on desktop.

**Gates (before the push):**
- typecheck: 0 errors.
- build: 16 pages and a 404.
- `lint-facts`: `--self-test` 255/255, `--all` 0 FAIL, `--diff` 0 FAIL, `--dist` 0 FAIL, `--prompts` 0 FAIL.
- `keyword-research check --staged`: 0 fail.
- `link-graph --dist`: exit 0.
- `gen-llms-guides --check`: up to date.
- The proof grep for subscription, price, trial and premium wording in `dist` outside the legal pages: 0 hits.
- The "free" grep: the Athan competitor section, "distraction-free" and "a free moment", nothing about QuranWall.

**After the deploy:**
- `link-graph --live https://quranwall.com`: every check ok.
- `/pricing.md` returns 404.
- `llms.txt` has no subscription or price words.
- IndexNow got the 13 URLs: `/`, `/blog`, `/features`, `/llms.txt`, `/pricing.md` and the 8 posts.

## Open
- **Vercel.**
  - A Security Checkpoint challenge returned 403 on every quranwall.com URL for about 25 minutes after the 11:21 push. Only this project was affected (faithwall.app and notewall.info returned 200). It cleared by itself at 11:44, and no setting was changed. If it comes back, Karol should check the project's Firewall tab.
  - The team usage check reads close to the monthly credit with 6 days left in the cycle (PACE HIGH, VERDICT WARN). That goes to Karol, and it is why this pass saved a build.
- **Instruction wording for the no-price rule** waits for Karol's OK. The exact old and new lines are drafted for:
  - `CLAUDE.md` L21 and L27 (the second still names `public/pricing.md`);
  - `SEO-STRATEGY.md` L14, 122, 141, 153, 167 and 213;
  - the blog skill L17.
  
  The scheduled-task prompts already pass `--prompts`. The pending queue notes in `seo-priorities.json` keep the stricter "never 'free to download'" wording, which is safe until the next refresh.
- `framer-motion` is still listed in `package.json`, but nothing imports it. Removing it is a lockfile-only follow-up.
- AuthorBio keeps its `aria-label`. At 375 px wide, a 4-line H1 could push the fold past 760; no post has one today.
- The marker `index-785Ypg-B.js` noted before the push came from a pre-`99b0f6e` build. The live hash is `index-0jMfpJab.js`.

## Follow-up the same day: FaithWall's verification, /support billing and lint holes (`ff1a0b0`)
FaithWall checked the live site on its own: an origin/main export, a live crawl, and Lighthouse 12.8.2 run 3× on mobile. Its numbers match the table above: / 98, /blog 99, post 98, /features 99. Desktop scores 100, a11y 100 and CLS 0 on all 14 runs. link-graph `--live` exits 0, `/pricing` and `/pricing.md` return 404, and the ct tokens are intact.

**Built (`ff1a0b0`):**
- `/support` still said "billing" in its meta, og and twitter descriptions and on the privacy card. It now reads "…supported iPhones, and privacy." and "How we handle your information."
- `lint-facts` now also fails:
  - bare "billing" and "subscribe";
  - "cancel anytime", "QuranWall+", "unlock everything", "see pricing";
  - prices with no currency symbol, such as "4.99 a week";
  - "download it free", "free on the App Store", "free forever", "free of charge".
- Sentences that name another app and not QuranWall are exempt from the "free" rules, so "Athan is free to download" passes. Billing, price and subscribe wording still fail.
- Self-test 292. typecheck, build and every lint mode pass with 0 FAIL, and the dist grep has 0 hits outside the legal pages.

**Corrections to this entry:**
- The Vercel usage WARN is the billik team's total from other client projects. QuranWall is not a billik project, so it was not this site's cost. FaithWall is passing the WARN to Karol.
- No component reads `installLine` ("Free to download."), so no live page shows it. That is compliant. The redesign either renders it at the install card or CTA, or drops the key.
- Fold: on the 6 hero posts the order is cover, collapsed TOC, then the Quick Answer. So the callout is the first text block, not the first block. The redesign moves the Quick Answer above the cover (answer-first) and re-measures.
- Annotations rows for `99b0f6e`, `8ce9cc1` and this push now live in `~/.claude/quranwall-gsc/annotations.csv`, outside the repo. They were moved out of the FaithWall file.
