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
- IndexNow: `/support` was pinged after `08778e8` went live, and it was accepted.

## Follow-up the same day: visual redesign push 1, instruction wording, 13 more lint evasions
**Asked.** Karol, 11-17, through the shared visual-redesign brief: the blog, guide and help pages are "too text heavy", with "no visuals, there's no vector things". Every page type should break up its text with meaningful vector visuals, a few of them moving. The text stays. Push 1 covers posts, the hub and help. The homepage comes later, after Karol approves its captures. QuranWall has no pillar or FAQ route, so the brief's pillar part lands on `/blog` (the hub) and its FAQ part on `/support`.

**Art direction (decided):**
- **The frame.** The pointed arch, a mihrab outline, frames every spot scene instead of a rectangle. It is the one memorable device; everything else is quiet line art.
- **Palette.** Existing tokens only:
  - night `#1E1338`, dusk `#2C1C58` and plum `#362266`;
  - gold `#D9B968`, with `#C2A451` for secondary strokes;
  - ink `#0C0D24` on gold.

  The one gradient is the sky inside the arch.
- **Strokes.** Icons on a 24 grid at 1.5 px, and scenes at viewBox 320×240 at 2 px, with round caps and no shadows.
- **Motifs:**
  - crescent, 8-point star, iPhone (round corners and a Dynamic Island, never the squircle);
  - the lock-screen ayah as abstract lines only, never drawn Arabic or Quran text;
  - tasbih beads, an open mushaf on a rehal, a fajr horizon, a moon for Focus, app tiles, an envelope.
- **Motion.** One slow loop per scene, 6 s or longer. It is paused until a shared IntersectionObserver marks the scene in view, and turned off under reduced motion.

**Built:**
- `6507fbd`, the visuals library and post block visuals:
  - 9 inline SVG scenes of 1.4–3.6 KB each, picked by slug with cluster fallbacks;
  - steps as a numbered rail;
  - stats drawn truthfully, in the built HTML: 186 dots, 10 dots, 4 segments;
  - icon callouts;
  - the verse as an iPhone card, with the same text and reference, still HTML;
  - tables stacked under 640 px;
  - the Quick Answer moved above the cover (answer-first);
  - each post's scene before its first H2.
- `88b8681`, `/blog` and `/support`:
  - `/blog` gets a cluster map after the first topic, with real links. From 1024 px it is radial; below that it is a row of topic cards.
  - `/support` gets an illustrated header, topic icons, and a 4-step diagram in "How does QuranWall work?".
  - The FAQ answers stay in the DOM: the old `max-h-48` clip is replaced by a grid-rows collapse.
  - Small contrast and underline fixes take `/support` accessibility from 91 to 100.
- `59879f8` removes the leading ", " before the verse reference. It was live before this pass too.
- `251df06` puts the no-price rule into `CLAUDE.md`, `SEO-STRATEGY.md` and the blog skill. Karol approved it on 11-17, in this session and again through FaithWall. `lint-facts --prompts` shows 0 FAIL.
- **Outside the repo,** with Karol's OK the same day: the `quranwall-merge-bot` and `quranwall-seo-autopilot-local` prompts no longer name `pricing.md`. Their install-line sentence now reads: legal pages only, and "Free to download" only at download points.
- `044bc1a` closes FaithWall's 13 further evasions:
  - one-time purchase or pay once;
  - lifetime access or plans, "upgrade to unlock", remove ads or support the developer;
  - prices in dollars or cents, a bare "trial" about QuranWall, gratis, "at no charge";
  - "ad-free and free", "free for a week", a lowercase plan-word "premium".

  A sentence that points back at QuranWall ("unlike Athan, it is…") is no longer exempt. Self-test 422.

**Verified, local, before push:**
- Lighthouse mobile, median of 3, on a gzip static server. The machine load was 70–100, so read it as noise-level. Each cell is perf / LCP s:

  | Page | Before | After |
  |---|---|---|
  | `/` (untouched) | 89 / 3.28 | 89 / 3.08 |
  | `/blog` | 97 / 2.29 | 100 / 1.61 |
  | post | 94 / 2.62 | 94 / 2.58 |
  | `/features` | 97 / 2.20 | 98 / 2.12 |
  | `/support` | 99 / 1.97 | 98 / 2.10 |

  CLS 0 everywhere. The first build's `/blog` map shift (0.156, from `content-visibility` on the first topic) was fixed.
- Added weight is 5–7 KB gzip per page.
- Quick Answer top on the 6 hero posts: 373–405 px on mobile and 402–472 px on desktop.
- Gates: typecheck, build, `lint-facts` (every mode), `link-graph --dist`, `gen-llms-guides --check`, and the block-sequence check (install cards unmoved in all 8 posts) all pass.
- Captures (390×844 and 1440×900) are with the coordinating FaithWall session for review before the push.

**Open:**
- No icons inside the step rail, because the step texts don't map to clear icons.
- The stacked tables are tested on a synthetic table only; no post has a table yet.
- The homepage is push 2, after Karol's OK.
- `installLine` is still unrendered.

### Follow-up: redesign push 1 live (2026-11-17, later)

**Review fixes before the push** (FaithWall reviewed the captures): `96fd64a`.
- The verse card is now a portrait phone (9:19.5) with curly quotes. Verses over 120 characters drop to 16 px so the whole ayah fits.
- The stat figure's SVG is `aria-hidden`, so a screen reader reads the number once, from the HTML text.
- The `/blog` cluster map sizes its nodes to the container (container query) and widens the rings. The smallest gap between nodes is now about 15–18 px at 1024 and 1100 px.
- The mid and end install cards now print `facts.installLine` ("Free to download.") once each. This closes the "`installLine` is still unrendered" item above.
- `9c5cb2f`: `TODO-KAROL.md` retires the `qw-web-pricing` campaign token along with `pricing.md`.

**Live** (`96fd64a`, deploy confirmed by commit status and asset hash):
- On 3 posts the stray ", " before the verse reference is gone, and "Free to download." appears twice (mid and end card). The scene is present, and the `/blog` map is live.
- `link-graph --live` exits 0, with 17 pages ok.
- Lighthouse mobile, live, median of 3:

  | Page | Perf / LCP s | TBT ms | CLS | a11y |
  |---|---|---|---|---|
  | `/blog` | 99 / 1.83 | | 0 | 100 |
  | dhikr-reminders post | 97 / 2.13 | 25 | 0 | 100 |
  | `/support` | 99 / 1.72 | | 0 | 100 |

- **Lazy images:** after a scroll-through, every `src` on the page returns 200. The QR code is `hidden lg:flex`, so phones never request it.
- **Captures:** the open "How does QuranWall work?" answer is a 2×2 step grid on phones and 4 in a row on desktop. These sit with the FaithWall review captures.
- IndexNow got 200 for `/blog`, `/support` and all 8 posts. The GSC annotation row for `96fd64a` is outside the repo.

**Process note:** during the local Lighthouse runs, the implementer ran `pkill -f lighthouse` once. That breaks the "kill only your own PIDs" rule. Nothing else was running Lighthouse at the time, but future briefs repeat the rule.

**Open, for push 2 (not blocking):**
- best-islamic stacks cover, stat and scene too close together.
- Tables need ARIA roles.
- The stat-shape regex needs tightening.
- The ring needs a `<g transform>`, and the dot stagger must stay ≤ 1.2 s.
- Scene SVGs should use `useId`, and the duplicate `useInView` in `lib/inview.ts` needs a rename.
- The FAQ answers carry too many `role=region` landmarks.
- The map should be `role=list`.
- The scenes should be more distinct; the quran-verse one is the plainest.
- The homepage redesign waits for Karol's OK on captures.
- `framer-motion` is unused but still in `package.json`.

### Follow-up: homepage redesign push 2 live (2026-11-17, afternoon)

**Asked:** FaithWall relayed Karol's "speed up" with four rules:
- no local or repeated Lighthouse runs; static budgets before the push, then 1 live run per page after it;
- build the homepage now and ask Karol "Ship?" with 390 and 1440 captures;
- one adversarial review round, must-fixes only;
- template pushes need no wait once the gates pass.

Karol saw the captures and said **"Ship it"**.

**Built:**

| Commit | What it does |
|---|---|
| `c33c063` | The 11-16 homepage keeps its hero and mockups; only the gaps are filled. Arch badges with icons on the 3 stats, a line icon on each feature tile, a 5-step diagram in How it works (draws once, slow spark loop, off under reduced motion), the support scene next to the FAQ from 640 px, a scene on each Explore More card. Two sentences that repeated other sections are trimmed. Fixed: the Features grid was ~487 px wide on a 390 px phone and cut off tile text. |
| `553c13f` | The review's must-fix: the five scenes on `/` shared the `qa-sky`/`qa-arch` ids, so `SceneSvg` now takes ids from `useId` and has a `clipped` slot. Also the first try at FaithWall's `label-content-name-mismatch` finding on posts (the avatar link's visible "KB" vs its label). |
| `87d4a61` | `scripts/link-graph.mjs` 1.1.0, copied byte for byte from the shared engine. |
| this commit | `AuthorBio`: the avatar link is `aria-hidden` and `tabIndex=-1`. Hiding only the "KB" text didn't help: axe still counted it as visible text. The "Karol Billik" text link beside it goes to the same page. Checked with axe locally on 2 posts: 0 violations for `label-content-name-mismatch`, `aria-hidden-focus` and `link-name`. |

link-graph 1.1.0 adds two warn-only checks, and both fire:
- title vs H1 mismatch on `/features`, `/blog` and 2 legal pages;
- one `og-image.png` shared by 8 pages.

**Checks before the push** (static, no Lighthouse):
- typecheck and build (16 pages) pass. `lint-facts` gives 0 FAIL in every mode; the 2 WARNs are the old EULA ones.
- `link-graph --dist` exits 0, and `gen-llms-guides --check` is up to date.
- App Store links on `/`: 7 before, 7 after. JSON-LD is byte-identical.

| Budget | Result |
|---|---|
| JS gzip on `/` | +3.8 KB |
| Image bytes | unchanged |
| DOM nodes | 2318 → 2506 |
| CLS (scroll-through) | 0.016 at 390, 0.007 at 1440 |
| Duplicate ids | none |
| Horizontal overflow | none |
| Console or hydration errors | none |

**Live** (`87d4a61`):
- The commit status reads success, and the live HTML for `/` is identical to the local build.
- `link-graph --live` exits 0. IndexNow got 200 for `/`. The annotation row is outside the repo.
- One Lighthouse mobile run each, after a warm-up:

  | Page | Perf / LCP s | TBT ms | CLS | a11y |
  |---|---|---|---|---|
  | `/` | 95 / 1.99 | 222 | 0.001 | 100 |
  | dhikr post | 99 / 1.90 | 10 | 0 | 100 |

- The `/` TBT is over the 200 ms budget. Its biggest long task (344 ms) is not attributed to any script, and the machine's load average was about 20 during the run, so I read it as load. Per Karol's rule I didn't repeat the run. Check it again on a quiet machine.

**Captures:** `home-fold-m/d.png` and `home-full-m/d.png` are with the FaithWall review captures. They are viewport slices with the header shown once.

**Open:**
- The push-2 nits from the earlier follow-up are still open.
- Titles vs H1 on `/features` and `/blog`, and the shared og:image, are for the SEO machine or Karol.
- The "92%" stat and the "first waitlist member" testimonials are older copy. This pass didn't touch them.

### Follow-up: smooth reveals, counters and mockup corners (2026-11-17, ~14:25 → 15:30)

**Asked** (Karol, relayed by FaithWall): some elements "don't load" while scrolling, the "1,000+" numbers don't animate smoothly, and phone-mockup screen corners must never show past the rounded screen, on all three sites. "Do this yourself, everything yourself": push once the gates pass.

**Found on QuranWall:**
- **Reveals:** `Reveal` started 60 px inside the viewport and faded over 0.6 s with up to 0.2 s of stagger per item, so a block could sit blank on screen while you scrolled.
- **Counters:** `SocialProof` counters waited for 50 % visibility and counted over 1.6 s. In Chromium the 92 % counter first showed its final value, then jumped down to 30 %.
- **Mockup clipping:** screens clipped with `overflow:hidden` plus a radius only, which iOS Safari can ignore for composited children.
- **Scroll cost:** large `blur()` glows, and `backdrop-filter` on repeated cards on phones.

**Built** (`bf929e9`):
- `src/lib/reveal.ts` is one shared observer for every reveal and counter.
  - It fires when an element comes within 15 % of the viewport bottom.
  - Its fallback, on `scrollend` or 150 ms after the last scroll, shows every pending block above the viewport bottom.
  - Back/forward restores and #hash entries show everything at once.
- `Reveal` now fades in 0.5 s with a rise of at most 16 px, and stagger is capped at 60 ms per item and 180 ms per group.
- Counters run 1.1 s with an ease-out, use `tabular-nums` and reserve their final width. The server HTML keeps the final value.
- The hero "Trusted by 1,000+" stays static text: it is above the fold, and counting it would flash.
- Phone screens (`PhoneFrame`, `AppShowcase`, the Features preview, the blog verse card) add `clip-path: inset(0 round R)` and `isolation: isolate`. The verse card has a separate inner screen with radius `calc(2.75rem - 6px)`.
- Glows are radial gradients now, and cards have no `backdrop-filter` below `md`.
- The nav no longer animates `box-shadow` or `backdrop-filter`.
- The unused `useInViewOnce.ts` is deleted.

**Verified:**
- **Scroll test** (Playwright WebKit as iPhone 15, and Chromium mobile; stepped at about 1,500 px/s and as a flick; on `/`, two posts and `/features`):
  - On `/`, elements stuck for over 650 ms in view went from 2 to 0 in WebKit and from 3 to 0 in Chromium.
  - Elements blank for 300 ms or more on `/`: 32 → 14 in WebKit and 29 → 8 in Chromium. The rest are 0.5 s fades caught mid-way.
  - The rerun against the live site after the deploy also gives 0 stuck on every page in both browsers.
- **Counters live** (WebKit, first visible, then +300 ms): 47 % → 83 %, 400+ → 877+, 55 → 103, ending at the final 92 %, 1,000+ and 114.
- **Corners:** Playwright WebKit drew the old mockups rounded too, so it can't show the leak. The real check was Mobile Safari in the iOS Simulator (iPhone 17e, iOS 26.5).
  - Before, on the live site: the hero phone, Features phone, How it works phones and the verse card showed no leak at rest.
  - After, on the local build: none either.
  - The change is preventive, following FaithWall's reproduction on faithwall.app.
  - Shots and corner crops are with the FaithWall notes.
- **Gates:**
  - typecheck and build (16 pages, sitemap unchanged) pass;
  - `lint-facts` gives 0 FAIL;
  - `link-graph --dist` and `--live` exit 0;
  - JSON-LD and the App Store link count on `/` are unchanged;
  - JS on `/` grew by 364 B gzip;
  - CLS on a scroll-through stays at or below 0.0084;
  - there are no console or hydration errors.
- **Lighthouse mobile live** (one run each; the machine's load average was about 300):

  | Page | Perf / LCP s | TBT ms | CLS | a11y |
  |---|---|---|---|---|
  | `/` | 96 / 2.38 | 71 | 0 | 100 |
  | verse post | 98 / 1.98 | 0 | 0 | 100 |

  The earlier `/` TBT of 222 ms is now 71.
- IndexNow got 200 for `/`. The annotation row is outside the repo.

**Open:**
- `/features` has no phone mockup for the corner test.
- The corner fix can only be proven on a device that showed the leak. QuranWall's mockups didn't show it in the simulator, before or after.
