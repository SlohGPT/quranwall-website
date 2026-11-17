# 04 — Internal links and SEO/GEO pass (2026-11-17)

A manual session continued in the worktree `.claude/worktrees/qw-fixes-engine-120-a77d2b`, on branch `claude/qw-seo-geo-pass` cut from `35e4b4a`. It was coordinated by the FaithWall session for all three sites.

## Asked
Karol, 2026-11-17: do "everything that you need to do to actually really maximize the GEO and SEO impact of these websites". That means more links between existing pages and more blog links in the navigation. The shared brief lives in the FaithWall repo (`docs/seo-geo-pass-2026-11.md`). QuranWall has no control-group hold, so it gets the whole menu:
- an evenly spread related block, plus a link up to the hub;
- a hub that links every post;
- breadcrumbs;
- 2–4 in-body links per post;
- titles of 65 characters or fewer;
- answer-first openings;
- a generated llms.txt Guides section;
- footer cluster columns.

No new posts.

## Tool
`scripts/link-graph.mjs` 1.0.0 is a byte copy of FaithWall `6a38294` (sha256 prefix `ba7513f71128`). Never edit it here. Usage:
- `node scripts/link-graph.mjs --live https://quranwall.com` checks the live site.
- `node scripts/link-graph.mjs --dist dist --base https://quranwall.com` checks the local build before a push.

## Found (live, before)
- 16 pages, max depth 2, median 4 contextual links in. No orphans, nothing broken.
- FAIL, under 3 contextual links in:
  - `/blog/quran-reading-plan-app-iphone` (1)
  - `/blog/best-dhikr-app-for-iphone` (2)
- WARN:
  - two titles over 65 characters (the reading-plan post at 74 and the morning-routine post at 67);
  - no BreadcrumbList on `/features` and `/about/karol-billik`;
  - `llms.txt` didn't list 9 pages: the 8 posts and the author page.
- The `kw geo-probe` showed every AI crawler allowed and served 200. That is still true.

## Decided
- **The related block walks one list.** QuranWall's five clusters hold only one or two posts each, so "the next 3 in the cluster" would repeat posts. Instead, all published posts are ordered by cluster, and each post links the next 3 in that order, wrapping around. Same-cluster neighbours come first, and every post gets exactly 3 related links in.
- **The hub is `/blog`.** It has one H2 with an id per cluster, and every post is a server-rendered link. The related block's hub link goes to `/blog#<cluster>`. No pillar route exists, so none was added.
- **The footer links every post, in cluster columns.** This is Karol's "more blog links in the navigation". There is a side effect: link-graph counts a target linked from more than half the pages as a template link and exempts it from the contextual check. With the footer on every page, every post becomes a template target, and the tool's median contextual-in drops to 0. That number does not mean the links got worse. To measure the real gain, the build was checked again with every `<footer>` stripped (see Verified).

## Built (commits)
- `f9e9b6c` (merged to main as `3c7c459`, one push):
  - **Related block:** the next 3 posts in cluster order, plus "More <cluster> guides" → `/blog#<cluster>`. The helpers are in `src/lib/clusters.ts`, kept apart from `posts.ts` so the footer doesn't import every post body.
  - **`/blog`:** grouped by cluster with anchors.
  - **Footer:** a Guides row with one column per cluster, each heading linking `/blog#<cluster>`. One column on phones, two at sm, five at lg.
  - **Breadcrumbs:** visible breadcrumbs and BreadcrumbList on `/features` and `/about/karol-billik`. The author page now reads Home › Karol Billik, the same as its JSON-LD.
  - **In-body links:** 3–4 guide links in each post's body, added to existing sentences, with the target's keyword phrase as the anchor. Quran quotes were not touched.
  - **Answer-first openings:** six posts got a 40–60 word opening (53–60 words) that names QuranWall and uses only the facts file. The other two already had one: the Islamic lock screen ranking (51 words) and the lock-screen guide (52).
  - **Titles:**
    - "Quran Reading Plan App for iPhone: How to Pick One That Sticks" (62)
    - "Muslim Morning Routine on iPhone: A 2026 Setup That Sticks" (58)
  - **`dateModified`** is now 2026-11-17 on every post.
  - **`llms.txt`:** the "Guides" section is now generated from `blogPosts.json` by `scripts/gen-llms-guides.mjs`. It runs first in `npm run build`, rewrites only the part between its markers, and has a `--check` mode. It drops any sentence that names an iOS version, because lint-facts allows only 15.0 in llms.txt. The author page was added to the curated Key pages.
  - **Sitemap:** lastmod updated for the changed pages.

## Verified
- **Before the push:**
  - typecheck OK;
  - build prerenders 16 of 16;
  - lint-facts: `--self-test`, `--diff origin/main` and `--prompts` give 0 FAIL. `--all` and `--dist` give 0 FAIL and the 6 known WARN (four grandfathered p5 strings, `EULA.tsx:69` twice);
  - `check-facts` OK;
  - kw `check` on the changed data files: 0 fail;
  - `gen-llms-guides --check` reports the section up to date;
  - `link-graph --dist` exits 0.
- **Footer-stripped check** of the same build: median contextual links in 6 (live before: 4), and no page under 3. The only FAILs are `/terms-of-use` and `/eula`, which only the footer links to, as expected. The implementer counted per post with header and footer stripped. Every post has at least 6 links in, the two weakest are the reading-plan and dhikr posts, and the median per post is 7.
- **Visual check** with headless Chromium at 1512×982 and on an iPhone 13: the footer cluster columns, the phone stacking and the "Keep reading" block render cleanly.

| | Live before | After (build) |
|---|---|---|
| Pages in sitemap | 16 | 16 |
| Max click depth from home | 2 | 1 |
| Median contextual links in (tool) | 4 | 0 (every post is a footer template target) |
| Median contextual links in, footer stripped | 4 | 6 |
| Under 3 contextual links in | 2 | 0 |
| Orphans / unreachable / broken | 0 / 0 / 0 | 0 / 0 / 0 |
| Titles over 65 characters (WARN) | 2 | 0 |
| Non-home pages without BreadcrumbList (WARN) | 2 | 0 |
| Pages `llms.txt` doesn't list (WARN) | 9 | 0 |
| AI crawlers | 200 to all | 200 to all |

**Live, after the deploy** (about 30 s after the push):
- `link-graph --live` exits 0 with no FAIL and no WARN. Max depth is 1, so all 15 pages are one click from home, and there are 16 template targets.
- IndexNow `--all` returned 200 OK. The footer and related block changed on every page, so all 16 URLs were pinged.
- `kw geo-probe`: OAI-SearchBot, ChatGPT-User, PerplexityBot, GPTBot and ClaudeBot all get 200 on `/`, and `llms.txt` returns 200.

## Open
- If link-graph should still guard body links once posts sit in a footer, it needs a template-aware mode, for example counting contextual links with the footer excluded. That is a change for the shared tool in FaithWall, not here.
- No WARN is left on QuranWall.

## Follow-up the same day: og:image on four pages (`a094b86`)
- **Found:** FaithWall's live page audit flagged four pages with no `og:image`. A curl of every sitemap URL confirmed `/blog`, `/privacy-policy`, `/terms-of-use` and `/eula`. They had no `twitter:image` either. The other 12 pages already had one.
- **Built:** the site card `og-image.png` (1200×630) went in as `og:image` and `twitter:image` in each page's Helmet block. `twitter:card` was already `summary_large_image` on every page.
- **Verified:**
  - Typecheck passes and the build prerenders 16 of 16.
  - Every built page has exactly one `og:image` and one `twitter:image`.
  - lint-facts gives 0 FAIL, and `link-graph --dist` exits 0.
  - Live, the four pages carry one of each tag, and `og-image.png` returns 200 as image/png.
  - `link-graph --live` exits 0, and IndexNow accepted the four URLs.

## Follow-up the same day: review avatars and the zoomed header (`4ad6d67`)
- **Asked** (Karol, passed on by the FaithWall session):
  - Change the three people in the "Trusted by 1,000+ believers" pill to the review images in the app folder ("we added like arabic people there").
  - When zoomed in, "the top bar also gets there zoomed in … it looks really weird … make it really nice and not so weird behavior".
  - The shared spec covers all three sites (FaithWall's side-session notes, `zoom-check/README.md`). While pinch-zoomed (`visualViewport.scale > 1.01`) and at `max-height: 480px`, the header stops being fixed. Behaviour at 100 % doesn't change.
- **Root cause of the 626 px nav:** `Navigation.tsx` sets `--browser-top-inset` as `innerHeight − visualViewport.height − offsetTop`. That correction is meant for the iOS Chrome URL bar overlay, and `.nav-safe-pt` adds the variable to the nav's top padding. Pinch zoom shrinks `visualViewport.height` too. At 2.5× on 1512×890 that is 890 / 2.5 = 356, so the "inset" became 534 px, and 534 + 24 px padding + the bar ≈ 626 px of fixed nav covering 70 % of the screen.
- **Built:**
  - **The inset fix:** the inset is measured only while not pinch-zoomed, so it is 0 while zoomed.
  - **A new hook, `src/lib/useStaticChrome.ts`.** It is true while pinch-zoomed or when `(max-height: 480px)` matches. It listens to `visualViewport` resize and to the media query, toggles `vv-zoomed` on `<html>`, and is SSR-safe: false on the server and on the first render.
  - **CSS:** `.chrome-pin` (`html.vv-zoomed .chrome-pin` and the short-viewport media query) makes the nav `position: absolute` at the document top, so it scrolls away.
  - **The floating pill:** background, blur, shadow and progress ring show only while the nav is pinned.
  - **The sticky install bar** (phones) stays off in both cases.
  - **Untouched:** the mobile menu, the focus order and the 100 % behaviour.
- **Avatars:** the hero stack now uses `image-3-review`, `image-2-review` and `image-1-review` from the app's asset catalogue, the order onboarding shows them in. They are exported as 96 px JPGs (3× the 32 px rendered size, 3.5–5.4 KB). `alt=""` stays as it was. `avatar-1…3.jpg` were removed because nothing referenced them. `avatar-4…6` are the testimonial photos and stay.
- **Verified** with the spec's two CDP scripts, using their own headless Chrome; the nav height is measured as fixed, sticky or absolute:

| Header | Before (live) | After (build and live) |
|---|---|---|
| Pinch 2.5× at 1512×890, top and scrolled 700 px | fixed, 626 px (70 % of the viewport) | absolute, 92 px (same as scale 1); content visible |
| Browser zoom 100 % | fixed, 92 px | fixed, 92 px (unchanged) |
| 150 % | fixed, 88 px (15 %) | fixed, 88 px (unchanged, viewport 593 px tall) |
| 200 % | fixed, 76 px (17 %) | not pinned |
| 300 % | fixed, 76 px (26 %) | not pinned |
| 400 % | fixed, 76 px (34 %) | not pinned |

- **Gates:**
  - Typecheck passes and the build prerenders 16 of 16.
  - lint-facts gives 0 FAIL on `--diff` and on `--dist` (only the 6 known WARN).
  - `link-graph --dist` and `--live` both exit 0.
  - `kw check --staged` had nothing in scope.
  - The live avatars return 200, and the old `avatar-1.jpg` returns 404.
- **Open:**
  - FaithWall and NoteWall get the same behaviour in their own sessions.
  - The pill still reads "Trusted by 1,000+ believers", which is one of the p5 social-proof strings that turn into FAILs on 2026-11-23.
