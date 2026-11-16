# 01 — SEO machine setup, 2026-11-16

Public repo: qualitative only, never raw Search Console numbers.

## Ask
Karol asked whether this repo has the same automatic SEO routines as the FaithWall site. It had none. He then asked for the full setup: "study both faithwall and notewall SEO pipeline and do something like this here", and "the system must also gather traffic also as notewall".

## Found
- **Before today:** QuranWall had only the manual `quranwall-blog` skill ("Create today's content"), a sitemap generator and IndexNow. It had no scheduled tasks, strategy, queue, Search Console script or journal, and its App Store links carried no campaign tokens.
- **FaithWall and NoteWall** each run three local scheduled tasks in Karol's Claude account:
  - a daily autopilot that executes one queue item and pushes a `claude/*` branch
  - a daily merge gate that verifies the branch, merges it and pings IndexNow
  - a weekly Search Console refresh that measures results and re-ranks the queue

  FaithWall also has a cloud routine that has produced nothing since 2026-10-01.
- **Traffic gathering**, as NoteWall does it, has two parts:
  - Search Console data through a service account (`scripts/gsc-dump.mjs`, dumps kept local in `~/.claude/<site>-gsc/`)
  - per-page-type App Store campaign tokens, read monthly in App Store Connect
- **Search Console:** the service account has no access to quranwall.com. All three property forms return 403.
- **Fact drift:** the live App Store listing disagrees with the site on several points:
  - Price: the listing shows free with in-app purchases, on weekly and yearly plans. The site says "free" and shows a monthly plan.
  - Minimum iOS: 15.0 on the listing, 16 on the site.
  - Name: the store title is now "Quran Widget: QuranWall".
  - Social proof on the site can't be verified from the listing.
- **Verse quotes:** two existing posts quote verses that don't match Sahih International word for word, and no verse block names its translation.
- **Stat block:** one post has a `stat` block with the wrong field name (`value` instead of `number`), so its number renders blank.
- **Vercel:** `vercel-usage.sh` answered 403 because the CLI isn't logged in, so there's no spend reading. This site isn't on the shared billik team. The same setup that FaithWall and NoteWall already run adds at most one production build a day plus the docs commit.

## Decided
- Ported NoteWall's structure, the cleaner and newer port, with FaithWall's build details. FaithWall runs the same Vite + SSR prerender stack as this site.
- Times: autopilot daily 07:30, merge gate daily 11:15, refresh Monday 11:45. Those slots don't collide with the FaithWall, NoteWall or Synapsa runs.
- QuranWall-specific rules:
  - **Verse accuracy:** every Quran quote matches a named translation with surah:ayah, checked against a live source. No unsourced hadith, no rulings. The gate refuses a merge on a mismatch.
  - **Manual daily post:** Karol's manual post lands on main directly. The machine coordinates through the `blocked` flags in `src/data/seo-keywords.json`, skips superseded items and merges into a moved main.
  - **Search Console access:** until access is granted, the refresh exits cleanly. The TODO line for it is written once.
- **Grace window:** queue items p3–p5 change the "free" wording and remove unverifiable social proof, so they are gated to 2026-11-23. That gives Karol a week to answer `TODO-KAROL.md` first. After that the default applies.
- **Journal ownership:** the autopilot writes no journal entries. The merge gate and the refresh write them, which keeps the entry numbers collision-free.

## Built
- `946925a`: the foundation.
  - `SEO-STRATEGY.md` v1. Its install-intent page list is in §10.
  - `src/data/seo-priorities.json`: 16 items. Correctness comes first (p1 verses, p2 stats, p3–p7 product facts and schema), then depth, internal links and off-site work.
  - `src/data/seo-keywords.json`: published keywords flagged, plus reasoned blocks.
  - `TODO-KAROL.md`, `outreach/targets.json` (7 verified targets), repo `CLAUDE.md`, `scripts/gsc-dump.mjs` (`npm run gsc-dump`).
  - `src/lib/app-store.ts`: every App Store link carries `ct=qw-web-<type>`.
  - `llms.txt` and `pricing.md` aligned with the listing.
  - The blog skill uses the `qw-web-blog` link and skips blocked keywords.
- Scheduled tasks in `~/.claude/scheduled-tasks/`: `quranwall-seo-autopilot-local`, `quranwall-merge-bot`, `quranwall-seo-refresh`.

## Verified
- `npm run typecheck` is clean.
- `npm run build` prerenders 16 of 16 routes, and the built HTML carries the right `ct` per page type.
- All JSON files parse.
- The staged diff has no raw Search Console counts.
- `gsc-dump.mjs` returns the expected 403.
- The three task files hold their full prompts.
- Not verified: the git flows in the task prompts (staged merge, quarantine, worktree) weren't dry-run. The first real runs are 2026-11-17 at 07:30 and 11:15.

## Open
- **Karol:** grant `karchi@karchi-indexing.iam.gserviceaccount.com` access to `sc-domain:quranwall.com`. That's the top item in `TODO-KAROL.md`.
- **Karol:** answer the product-fact questions (free tier, monthly plan, Focus mode, verse packs, minimum iOS, privacy wording) and the social-proof question before 2026-11-23.
- **Karol:** approve the wording update to the `quranwall-blog` skill (free claim, prices, iOS 16, the 144 stat, the "only app" claim).
- **Karol:** the site's contact address is NoteWall's (`iosnotewall@gmail.com`). Keep it or replace it.
- **Karol:** set the permission mode on the three new tasks in the app. They were created without a saved mode, so a run may pause to ask.
- **Karol:** first monthly review of the `qw-web-*` campaigns in App Store Connect, around 2026-12-16.

## Later the same day: Search Console and Bing
Karol approved the Search Console grant ("Yes, add it", then "Yes, do all of it") and added "Same thing with webmasters tools. Don't forget about that."

- **Found:** quranwall.com wasn't in Search Console at all, in any property form. That was the real cause of the 403, not a missing grant.
- **Search Console, done in Karol's Chrome:**
  - added the Domain property `sc-domain:quranwall.com`
  - verified it with a `google-site-verification` TXT record on the root of quranwall.com at Porkbun. Nothing else in DNS changed, and the site still resolves to Vercel.
  - added `karchi@karchi-indexing.iam.gserviceaccount.com` as a Restricted user
  - submitted `https://quranwall.com/sitemap.xml`. Right after submission it showed "couldn't fetch", which is normal for a new property. The live sitemap answers 200 with 16 URLs.
- **Bing Webmaster Tools:** quranwall.com was already added and verified in Karol's account. Its reports were still processing (Bing says up to 48 hours) and no sitemap had been submitted. Submitted `https://quranwall.com/sitemap.xml`; it's accepted and processing.
- **Verified:** `npm run gsc-dump` now authenticates and returns data, with no rows yet. Google backfills a new property's data within a day or two, so Monday's refresh (2026-11-23) is the first run with data. That run sets the baseline.
- **Decided:** the TXT record has to stay in DNS. `TODO-KAROL.md` says so in place of the grant item. The Bing question there is closed.
- **Open now:**
  - the product-fact and social-proof answers, before 2026-11-23
  - approval of the blog-skill wording
  - the contact email
  - Request Indexing for the money pages, now possible
  - the permission mode on the three tasks
  - the monthly `qw-web-*` review, around 2026-12-16

## Later still: Request Indexing
Karol said "Yes, request now" for the home page, `/features` and the three money posts.
- **Found:** URL Inspection worked and showed where each page stands:
  - home page: indexed
  - `/features`: discovered, not indexed
  - `/blog/quran-verse-iphone-lock-screen`: unknown to Google
  - `/blog/best-islamic-lock-screen-app-iphone`: unknown to Google
  - `/blog/best-muslim-app-for-iphone-2026`: unknown to Google
- **Blocked:** Request Indexing answered "daily quota exceeded" on the home page and again on one money post, so no request went through. Stopped after the second refusal.
- **Decided:** the sitemap is submitted, so Google should crawl these pages without any requests. Request Indexing would only speed that up. The TODO item now lists the three money posts first, then `/features`, to request from 2026-11-17.

## Evening: the FaithWall review applied to QuranWall
The FaithWall session ("SEO strategy and blog traffic") relayed Karol's request to apply its SEO and conversion review here, with the urgent part due before the autopilot's first run (2026-11-17, 07:30).

- **Found:**
  - The three task prompts, the blog skill and parts of the site still carried claims the live listing doesn't make: Focus-mode install, verse packs, Premium, duas, the 60-second setup, "no account", iOS 16 and "free app".
  - Unknown URLs answered 200 with the home page (a catch-all rewrite), so Google could index junk paths. The prerender left NUL bytes in some pages.
  - `index.html` carried a MobileApplication block on every page. There were two FAQ sources.
  - The home page body didn't link to `/features` or the money posts.
  - URL Inspection over the whole sitemap (new `npm run gsc-inspect`): only the home page is indexed. A few URLs are discovered but not indexed, and most are still unknown to Google.
- **Decided:**
  - The live listing wins over the skill and the old copy. The only pricing wording is "free to download, with an in-app subscription". Every unconfirmed feature stays out until Karol confirms it in `TODO-KAROL.md`.
  - Pushes use a one-off credential helper (`git -c credential.helper=… push`), not `gh auth switch`, because other sessions depend on the active gh account. The repo `CLAUDE.md` still says to switch on a 403. I didn't edit it because the request came from a peer session. That's Karol's call.
  - Queue: p1–p4, p6 and p7 were executed by hand today and closed as done. p13–p15 (outreach) are retired. Added p17, Ramadan readiness, eligible from 2026-12-15.
  - **Disagreed with the brief on two points:**
    - p5 (the 1,000+ and 92% social proof, waitlist testimonials) stays until its 2026-11-23 window, as promised to Karol. "1,000+" may be true.
    - p3/p4 (the "free" wording and iOS minimum) were done early as conservative wording rather than waiting.
  - `SEO-STRATEGY.md` is now v3, numbered to match FaithWall; QuranWall had no v2. Outreach is retired, a new-post demand test is added, and there's no Turkish version yet.
  - The journal stays one entry per session, so this is appended here rather than opening 02.
- **Built:**
  - `46b9109`: listing facts in the task prompts and the blog skill; overlapping queue items closed; outreach retired.
  - `961cfdc`:
    - real 404 with noindex, rewrite removed, NUL fix
    - home links to `/features` and the money posts (ExploreMore)
    - one MobileApplication node on Home with no rating; one FAQ source
    - listing facts site-wide, legal pages included; all 8 posts with exact Sahih International verses and the translation named
    - the hero's App Store row above the video on phones; slide1 preload removed
    - strategy v3; `scripts/gsc-inspect.mjs`
  - The three scheduled-task prompts outside the repo:
    - listing facts and the credential-helper push
    - outreach retired
    - the refresh gains an indexing check that reads the inspection CSV at day 14 and day 28
- **Verified:**
  - Locally:
    - typecheck clean; build 16/16 plus `404.html`; no NUL bytes
    - JSON-LD: Home has Organization, WebSite, HowTo, FAQPage and MobileApplication; other pages carry no MobileApplication
    - the sitemap diff only bumps lastmod on the 14 pages that changed
    - a local serve returns 404 for unknown paths and 200 for every sitemap URL
    - a 390px headless screenshot shows the App Store row above the video
  - The live check after the deploy is the next section.
- **Open:**
  - Request Indexing for the three money posts and `/features` (2026-11-17 or later, once each)
  - the six product-fact questions and the social-proof answer before 2026-11-23
  - the leftover "60 seconds" stat in SocialProof (p5 window)
  - the legal clauses on free trials and lifetime access, and the EULA Shortcut line
  - dead code in `AppShowcase.tsx` quoting Proverbs 3:5
  - the repo `CLAUDE.md` push rule

## Live check after `961cfdc`
- **Deploy:** live on Vercel about 30 seconds after the push.
- **Status codes:** `/nope` and `/blog/nope` answer 404 with a single noindex robots tag. All 16 sitemap URLs answer 200.
- **`/features`:** serves its own title.
- **Home page:**
  - carries Organization, WebSite, HowTo, FAQPage and one MobileApplication node, with no aggregateRating
  - no slide1 preload
  - links to the three money posts in its body
- **No MobileApplication** on `/features`.
- **IndexNow:** accepted the 14 changed pages plus `llms.txt` and `pricing.md`.
