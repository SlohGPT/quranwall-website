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

## Night: the conversion and measurement layer (FaithWall brief, part 2)
The FaithWall session sent part 2: port its install-card and fact-gate commit (`b73c084` on faithwall.app) to QuranWall. It came with the instruction to finish part 1 first: the home-page links, the phone CTA order and Request Indexing.

- **Part 1 leftovers:**
  - The home links and the phone CTA order already shipped in `961cfdc`.
  - Request Indexing: retried once on the first money post, and Google still answered "quota exceeded". By then that post had moved from unknown to "discovered", so Google is finding the pages on its own. The TODO stays for 2026-11-17 or later.
- **Built (`26a756a`):**
  - `src/data/facts.json`, one source for product facts: store name, iOS minimum, the install line, and the rating with `show: false` because the listing has only two ratings. The home schema reads it.
  - Campaign tokens are a fixed list capped at 30 characters (Apple's limit):
    - new `qw-web-blog-mid`, `qw-web-blog-end` and `qw-web-blog-sticky`
    - new `qw-web-smart-banner` (the Smart App Banner now carries pt and ct) and `qw-web-handoff`
  - Apple's official badge everywhere, with Apple's credit line in the footer. The two home-made badge images were removed.
  - Install cards on all 8 posts:
    - one mid card, placed by FaithWall's four rules
    - the end card, built from the post's own CTA
    - a desktop QR code plus Copy link, using Apple's short link (checked: it 301s to the listing with pt and ct kept, and the QR decodes to exactly that URL)
    - a phone sticky bar that hides over cards and the footer
    - on Android, a "made for iPhone" line and no sticky bar
  - Post typography: 17 px on phones and 18 px on desktop, with paragraphs and lists the same size, and a measure of about 68 characters.
  - Gates:
    - `scripts/lint-facts.mjs`: `--diff`, `--dist`, `--prompts` and `--all`
    - `scripts/check-facts.mjs`: compares the live listing with `facts.json`, and may rewrite only `rating.*`
    - IndexNow `--changed` and `--dry-run`
    - `gsc-inspect` turns API errors into ERR rows and exits 1 when every row fails
  - Three posts said "attach your QuranWall lock screen to an iOS Focus mode". They now describe linking a Lock Screen to a Focus as the iOS 16 feature it is.
- **Machine:**
  - The merge bot treats a lint-facts FAIL (`--diff` and `--dist`) as blocking and may derive IndexNow URLs with `--changed`.
  - The refresh runs `check-facts`, then `lint-facts --all` and `--prompts`, and skips the indexing comparison when inspection fails.
  - The autopilot lints its own diff.
  - The ship date and token list are recorded privately in `~/.claude/quranwall-gsc/`. There's no control group, because there were no impressions to compare.
- **Decided, where it differs from the brief:**
  - The link base keeps the slug the repo `CLAUDE.md` documents (`quran-verse-lock-screen`). Apple 301s it to the current slug (`quran-widget-quranwall`) and keeps pt and ct. Switching means changing `CLAUDE.md`, which is Karol's call.
  - The in-body blog token stays `qw-web-blog` rather than `qw-web-blog-body`. It keeps the history, and `CLAUDE.md` and the blog skill name it.
  - QuranWall posts have no illustrations, so the hero photo counts as the illustration for mid-card rule (a). Otherwise no post would get a card.
  - The end card drops the price line when the post's own CTA already says both "free to download" and "subscription". FaithWall's rule would have printed the subscription half twice.
  - The measure is set in rem, because a literal `68ch` in this font fills the whole column.
- **Verified:**
  - typecheck clean; build 16/16
  - `lint-facts` `--dist`, `--diff`, `--prompts` and `--all`: 0 FAIL; `check-facts`: no change
  - headless screenshots at 390x664 (CDP device emulation) and 1440x900 of home, a post and `/features`, with no console errors
  - Copy link puts the handoff URL on the clipboard, and the fallback input works
  - Live after the deploy: home, `/features` and a post carry the Smart App Banner token and the official badge; the post has its mid and end cards; the QR and badge files answer 200; `/nope` answers 404
  - IndexNow: accepted the full sitemap.
  - Indexing has improved since the morning (URL Inspection: a few more pages indexed, most still unknown). Monday's refresh tracks it.
- **Open:**
  - Request Indexing, 2026-11-17 or later
  - Karol's first Campaigns read around 2026-12-16, including whether `qw-web-smart-banner` shows up at all
  - the contact email
  - the slug and push lines in `CLAUDE.md`

## Late: context from the ASO revenue audit
The ASO session ("November 2026 iOS revenue and funnel investigation") sent QuranWall's findings as context, not as a task. Its figures stay out of this public repo; the source is the ASO repo, `docs/journal/04` and `docs/journal/04-audit-record/07-country-value-for-web-languages.md`.

- **Found, relevant to the site:**
  - QuranWall's US App Store search ranks stepped down on 2026-10-08 with no edit on our side. Judge the site on Campaigns and Web Referrer, not on search ranks.
  - A gap in new subscriptions in late October happened with normal traffic, so it isn't a site effect. Its cause is still open on the ASO side.
  - The web channel is small so far. Turkey is its largest source.
  - The App Store listing has no Portuguese, Malay or Urdu locale.
  - Reading the `qw-web-*` campaigns needs Karol to accept Apple's updated agreement first, and App Store Connect data stops at 2026-11-11 until he does.
- **Decided:**
  - `SEO-STRATEGY.md` now carries the audit's money test for translated posts, in words and without figures: a translated post must beat the English post's clicks by more than the value ratio times the effort ratio. It also says to judge the site on Campaigns and Web Referrer.
  - `TODO-KAROL.md`'s campaign item now starts with the Apple agreement.
  - "English only for now" stands.

## Later that night: the FaithWall verification round (`3640fca`, `dde8b62`)
The FaithWall session checked the night's work and sent a list of fixes, plus language and rights decisions for Karol. It is a peer request: the site, queue, prompt and TODO changes below were made; `CLAUDE.md` was not edited (routed to `TODO-KAROL.md`). The numbers in that message are private and stay out of this repo.

- **Copy:**
  - The home stat "60s, seconds to set up" is now "114 surahs, all searchable".
  - "Set up in under 2 minutes" is now "From the App Store to your Lock Screen", on both How-it-works variants.
  - The FinalCTA headline has no count. Its "Join 1,000+ believers" line stays until p5.
  - The two posts that said "Premium is a subscription" now use the install line.
  - The strategy's pricing line and an old outreach line drop "Premium".
- **Gates (`scripts/lint-facts.mjs`, written by a subagent and reviewed here):**
  - New `setup-time` rule, which also catches stats split across value, suffix and label, and the visible text of built pages.
  - New `premium-name` rule.
  - The DENY list holds real negations only, so "not only" is no longer a denial.
  - `--all` and `--dist` check every email address against `facts.contactEmail` (third-party domains allowlisted by name).
- **Links:**
  - In-body App Store links in posts are rebuilt in code with `qw-web-blog`.
  - The cta `buttonUrl` is no longer rendered (it was dead data). The end card links with `qw-web-blog-end`, and guide pages use `qw-web-pillar`.
  - The data stays in the posts: dropping it would touch 8 files for no visible change, and the blog skill still writes it.
- **Other:**
  - `/blog` and `/about/karol-billik` lastmod 2026-11-16.
  - The Search Console key path reads `GOOGLE_APPLICATION_CREDENTIALS`, with a home-directory fallback (new commit, no history rewrite).
- **Prompts:** all three scheduled tasks now keep App Store Connect and RevenueCat numbers out of the repo (installs, downloads by country, conversion, revenue, € amounts, cohort stats; direction words only). The refresh gained step 2d, the Turkish gate.
- **Queue:**
  - p5 (still 2026-11-23): "1,000+" is backed by downloads, so it becomes "Downloaded 1,000+ times". The 92% and the testimonials go unless Karol records the survey and the people's consent.
  - New p18 "Turkish go/no-go", status `gated`, from 2026-12-15. It goes only when all three hold: (a) at least 8 of 16 URLs are indexed, (b) Karol has a Turkish reviewer who knows Islamic terminology, (c) Karol picks the quote policy.
  - When it goes, the refresh sets it to `go`, not `pending`, so the pilot runs in a manual session with the reviewer rather than through the autopilot and merge bot. This is a deviation from the brief, which didn't say who runs the pilot.
- **Strategy:** "Re-decide around February 2027" is replaced by the trigger. Verdicts for the other languages: Arabic no (revisit 2027-04), Indonesian after Turkish, Malay and Urdu blocked on listing locales, French no.
- **TODO-KAROL:**
  - the `CLAUDE.md` line 25 public-repo rule
  - translation rights: the Tanzil non-commercial editions, which Saheeh International edition the app uses, and the CC BY credit for the Arabic text in the app
  - "ASO, not web": Turkey listing conversion, an Urdu listing, a Turkey price tier
  - what `qw-web-blog` now means
  - the email is linted
- **Tanzil credit on the website:** not added. No page shows Arabic ayah text: there are no Arabic characters in the built pages, and the slideshow images show English only. The credit goes in the day a page does.
- **Verified:**
  - typecheck, and build 16/16
  - `lint-facts` `--all`, `--dist`, `--prompts` and `--diff`: 0 FAIL
  - `check-facts`: no change
  - the live check after the deploy (below)
- **Live after the deploy (~45 s):**
  - Home: the 114 stat, the new heading and the new FinalCTA line are there, and no setup-time text.
  - Both posts: the new FAQ answer, no "Premium is a", and the end card on `qw-web-blog-end`.
  - The sitemap carries the two new lastmods.
  - IndexNow `--all` (site-wide components changed) was accepted.
- **Open:**
  - p5 on 2026-11-23
  - p18 from 2026-12-15
  - Karol's calls on translation rights, the Saheeh edition, the in-app Tanzil credit and the `CLAUDE.md` lines

## Last round: FaithWall's review of the verification fixes (`2cf47e8`)
FaithWall checked `3640fca`, `dde8b62` and `eb98fa8` in a scratch clone, against the live site and the listing. It confirmed the copy fixes ("114 Surahs, all searchable" is backed by the listing) and accepted the five choices above. It found one wrong live page and four lint gaps.

- **Correction to the round above:** my report said the closing CTA no longer gives a user count. Only its headline lost the count. "Join 1,000+ believers" under it is still live on `/` and `/features`, along with the Hero's "Trusted by 1,000+ believers" and the SocialProof 1,000+ and 92% stats. That is the documented state until p5 on 2026-11-23. p5's notes now name all four places.
- **EULA:** section 1 described NoteWall: goals, notes, habits and reminders, an iOS Shortcut, and "optional premium features". The product description now states the listing's facts:
  - an ayah on the Lock Screen wallpaper and a Home Screen widget
  - Uthmani Arabic beside a translation in one of 10 languages
  - a new ayah each day or a pinned one
  - the user's own background, font and colours, or their own photo
  - search of all 114 surahs
  - offline use, no ads
  - an in-app subscription

  The legal clauses are untouched. Legal substance (the trial and lifetime clauses in Terms) stays with Karol.
- **Lint** (`scripts/lint-facts.mjs`, a subagent built it, reviewed here):
  - **social-proof:** fails user counts, "trusted by N", "join N" and stats labelled with users.
  - **social-proof-downloads:** only "Downloaded <downloadsFloor> times" passes. `downloadsFloor` is a new field in `facts.json`, a lower bound from App Store Connect.
  - **Grandfather list:** the four live p5 strings are a WARN until 2026-11-23 and a FAIL from then, tested with `LINT_FACTS_TODAY`.
  - **setup-time:** now also catches "sets up", "setup takes a minute", "ready in", "get started in", "up and running in" and setup-time stat labels.
  - **NEG/DENY:** on site content it applies only to the clause that holds the match, so "Never miss a verse: set up in 60 seconds" fails. Prompts, skills and the queue keep whole-sentence NEG.
  - **premium-plan-word:** fails "QuranWall Premium", "upgrade to / go / get Premium" and "Premium needs / requires / costs …".
  - Every probe the reviewer listed now fails, and the must-pass probes pass.
- **Queue and docs:**
  - p3 and p14 use the install line.
  - p5's reason is reworded so it doesn't trip the new rule after the grandfather date.
  - TODO-KAROL now suggests changing `CLAUDE.md` line 21 as well ("Premium is an in-app subscription"), and quotes the install line in the six-questions item.
  - The autopilot and merge-bot prompts now say that on product facts, `facts.json` and the lint win over `CLAUDE.md`.
  - The merge bot's journal step now also keeps App Store Connect and RevenueCat numbers out of the repo.
- **Accepted as is:** the `/Users` path in old history (`946925a`, `961cfdc`); HEAD is clean. The contact email question was already in TODO-KAROL.
- **Verified:**
  - typecheck, and build 16/16
  - `lint-facts` `--all` 0 FAIL / 4 WARN and `--dist` 0 FAIL / 5 WARN (the grandfathered p5 strings only)
  - `--prompts` and `--diff`: 0 FAIL
  - `check-facts`: unchanged
  - with the date forced to 2026-11-23, `--all` fails exactly the four live strings
- **Live:** `/eula` shows the new section 1, without the NoteWall lines, and its HIPAA clause is unchanged. IndexNow pinged `/eula`.

## Night: the ASO session's web-referrer question (read-only)
The ASO session asked whether quranwall.com's traffic or App Store clicks changed around 2026-11-11/12. App Store Connect shows QuranWall's "Web referrer" downloads spiking in late October and early November, then falling after 11-11. Its counts live in its private files, not here.

- **Found:**
  - We have no data for that window:
    - the site has no analytics
    - the Search Console property (verified today) returns no rows for September to today
    - Bing shows no performance or backlink data yet
    - the Vercel project isn't in the BILLIK team that Karol's Chrome is signed into (it deploys from the SlohGPT account)
  - The site didn't change between 2026-07-13 and today.
  - Until today, its App Store links were bare (no `pt`, no `ct`), so App Store Connect Campaigns can't attribute anything before 11-16 to the site.
  - Web search finds no outside mention of "QuranWall".
- **Suggested to the ASO session:**
  - In its own numbers, Web referrer and App referrer move as mirror images. The spike and the drop may be attribution shifting (for example, links opened from the ChatGPT app's in-app browser), not demand. It can test this with daily source breakdowns.
  - The drop starts the day after App Store Connect data reportedly stops pending Apple's agreement, so those days should be re-pulled before they're read.
- **Changed:** nothing in the repo besides this note.

## Late night: FaithWall round-2 verification (`a34c536`)
FaithWall checked round 2 at `030c8f5` and asked for five lint gaps to be closed, one TODO line to be fixed, the optional clause breaks, and self-test cases. Then it wanted the commit hash.

- **Built (`a34c536`):**
  - `setup-time` and `setup-60s` now allow an object between "set" and "up" ("Set it up in under a minute").
  - `social-proof` catches counts written in words ("Over a thousand downloads", "A million users worldwide").
  - `social-proof-downloads`: any download count other than `facts.downloadsFloor` fails, so "1,000+ downloads" no longer slips through as a new claim.
    - **Decided:** "<floor> downloads" is allowed beside "Downloaded <floor> times". It says the same thing, and it only passes with the floor itself.
  - `premium-plan-word` catches "QuranWall+ Premium" and a capitalised "Premium Plan/Subscription/Tier".
  - Stat labels:
    - "Minutes to get started" and its variants fail.
    - A Downloads stat is checked against the floor.
  - The per-clause NEG check now also breaks at ", but", ", yet", ", while" and ", although".
  - `npm run lint-facts -- --self-test` runs 63 cases for these rules.
  - TODO-KAROL: the Terms of Use line is rewritten. That fixes a comma splice and drops the stale "or Shortcut".
- **Coordination:** the homepage session merged `design/homepage-v2` into main in this same checkout while these edits were in the working tree. Its merge (`1eb4f88`, with the new `pricing-mention` rule) kept the edits intact.
  - `a34c536` sits on top of that merge.
  - Pushing waits for the homepage session, because its merge was still unpushed.
- **Verified on merged main plus these edits:**
  - typecheck passes; build 16/16
  - `--self-test`: 63/63
  - `--all`: 0 FAIL / 4 WARN (the grandfathered p5 strings)
  - `--dist`: 0 FAIL / 4 WARN
  - `--prompts` and `--diff origin/main --worktree`: 0 FAIL
  - with the date forced to 2026-11-23, `--all` fails exactly those four strings
  - `check-facts` unchanged
- **Pushed (homepage session):** `a34c536` and `ce0f3f6` went out with the homepage-v2 merge. origin/main is `6c7f69c`, and that session ran every gate on it, `--self-test` included. The live home page shows the new hero.

## Night: the ASO session's answer on the web-referrer spike
The ASO session tested the reclassification idea from the note above, and a second agent recomputed it independently. Its counts stay in its private files.
- **Result:** from about 10-24, for three weeks, the same demand reached the App Store by a different route. Web referrer rose while App referrer (mostly the ChatGPT app) fell, their sum held, and App Store search stayed flat. So there was no extra demand, and the site played no visible part.
- **It wasn't a simple relabel:** most of the web gain was downloads with no product-page view. Apple hides most referring domains below its display threshold, so the route itself can't be seen.
- **For this site:** the Web referrer line in App Store Connect can't show whether quranwall.com works. The `ct=qw-web-*` campaign tokens added on 2026-11-16 are the measure. Apple lists a token only after it passes a threshold, so expect days or weeks with nothing showing.
- **Changed:** this note, and the memory pointer.

## Night: FaithWall's round-3 check (`1f28292`)
FaithWall verified round 2 on `6c7f69c`, with two skeptics checking each claim. It found five more lint gaps and three docs items, and asked for the llms.txt wording and a website-quotes line in the licence item.
- **Lint (`scripts/lint-facts.mjs`):**
  - Counts with k or m now fail: "10K downloads", "Join 1K+ users".
  - Install counts fail in prose and in stats ("5,000 installs", "Installed 5,000 times", a stat labelled Installs). **Decided:** install counts fail even at the floor, because the floor counts downloads. Only "Downloaded 1,000+ times" and "1,000+ downloads" pass.
  - Counts in words now cover twenty to ninety and hundred(s): "Join twenty thousand believers" fails.
  - Setup claims now cover "installs in seconds", "Done in 2 minutes with QuranWall", and the stat labels "Seconds to start" and "Taps to get going".
  - Plan names now cover "Premium Membership", "QuranWall Pro" and "QuranWall Plus plan". "Pro tip" still passes.
  - `--self-test` now runs 103 cases, up from 63.
- **Correction to the round-2 section above:** the per-clause NEG check also splits at a bare " but" and a bare " although" (no comma), as well as at ":" and ";". The full `CLAUSE_BREAK` is `/[:;]|,\s*(?:but|yet|while|although)\b|\s(?:but|although)\b/gi`. A bare " yet" or " while" doesn't split. The hub's "Round 3" for `a34c536` should have said the round-2 check; it's fixed there.
- **`public/llms.txt` follows the app until Karol decides:**
  - each ayah shows in Uthmani Arabic *or* a translation
  - the wallpaper keeps the chosen ayah, and only the widget rotates
  - offline is qualified: the iOS project bundles all twelve text databases, so browsing, search and the widget work offline
  - it no longer says "no audio recitation": the app streams read-along recitation from quran.com and caches it per ayah (`Recitation.swift`)
- **Legal pages:** Terms of Use and Privacy Policy now name the app as the listing does ("Quran Widget: QuranWall"). Nothing else in their text changed.
- **TODO-KAROL:**
  - New question 7: the site and FAQ, the listing and the EULA disagree on what the wallpaper shows. The audio wording is in the same question. The EULA gets aligned after Karol answers, and FaithWall takes the listing side to the ASO session.
  - The licence item now lists the website's own quotes (94:6 in seven translations, plus five ayat in Saheeh International, all copied from quran.com) for Karol to clear. Its "the site shows no Arabic" sentence is corrected.
  - Two stale pricing sentences are updated for the no-pricing site.
- **Cohort record (private):** I added annotation rows for the eight install-card posts, `/` and `/features`, all changed by the homepage-v2 merge (`6c7f69c`). This round changed no cohort page.
- **Verified:**
  - typecheck passes; build 16/16, sitemap unchanged
  - `--self-test`: 103/103
  - `--all` and `--dist`: 0 FAIL / 4 WARN (the grandfathered p5 strings)
  - `--prompts` and `--diff`: 0 FAIL
  - with the date forced to 2026-11-23, `--all` fails exactly those four strings
  - `check-facts` unchanged

## Night: keyword engine port (`8eeff78`)
FaithWall sent round 3 of the shared system: port its keyword engine (FaithWall `b011e21`, engine 1.0.0). Karol's ask, relayed: "the system will be the same on all of the apps Just unique with the keywords cluster and stuff."
- **Built (`8eeff78`):**
  - `scripts/keyword-research.mjs` is a byte-for-byte copy; its sha256 starts `4e9997c222f4`.
  - The QuranWall config is `src/data/kw-config.json`:
    - autocomplete: 11 requests a day for the US, 2 for Turkey, 2 for Indonesia (the last two are signals for the p18 decision, never content)
    - holds: p18 until 12-15; the home page until p5 on 11-23; tool and mood pages until Karol names a licence-clear translation and a meanings reviewer
  - `src/data/keyword-clusters.json` has 13 clusters. They come from the keyword bank plus today's autocomplete, and they're number-free.
  - `keyword-research/` holds the rubric and the first run note.
  - `npm run kw`, `npm run kw:check`, and the `.gitignore` lines.
  - SEO-STRATEGY §5: autocomplete only through the engine; the engine and cluster-map bullet.
  - A TODO item for the translation and the reviewer.
  - Scheduled prompts:
    - the refresh runs doctor, gsc and geo-probe after the data pull, takes autocomplete only through `kw expand`, curates the draft clusters, gives new items a `cluster_id`, and runs `kw check --staged` before committing
    - the autopilot reads the item's cluster and never runs the engine
- **Decided:**
  - **Run notes location:** they go in `keyword-research/` at the repo root, not `docs/keyword-research/` as on FaithWall, because this repo's CLAUDE.md keeps the SEO machine out of `docs/`.
  - **Open-ended hold:** the tool and mood page hold has no URL to enforce, so it's recorded with a far-future date; the cluster `hold` decisions and §5 carry it.
- **Ran:**
  - `kw check --self-test` passes in full.
  - `doctor --online` reaches the property with the shared default key, so the config names no key.
  - `gsc` exits 3, insufficient data, as expected one day after verification. No demand conclusion is drawn; the first useful pull is the 11-23 refresh.
  - Autocomplete answered normally and used the whole day's allowance. Seven US seeds wait for the next run, so the dhikr, dua, morning-routine, reading-plan and focus-mode posts have no cluster yet.
  - `geo-probe`: every AI search and training bot is allowed. The live robots.txt matches the repo, and all probed bots got a normal page.
- **Verified:**
  - typecheck passes; build 16/16
  - lint-facts: all modes 0 FAIL, self-test 103/103
  - `kw:check` and `kw check --staged`: 0 fail, 0 warn
- **Open:**
  - The refresh prompt still writes weekly journal entries to `docs/journal` (step 7b, from the setup), which disagrees with the CLAUDE.md line about `docs/`. That's Karol's call; it's left as it is.
  - Script suggestions went to FaithWall: a neutral host line instead of "Cloudflare", and a header note that `regex_families` take no lookarounds.

## Night: the machine's log moves out of `docs/`
- **Asked:** I asked Karol whether the weekly refresh should keep writing its journal entries in `docs/journal`, given that `CLAUDE.md` says the SEO machine never touches `docs/`. Karol: "I'm gonna leave everything up to you."
- **Decided:** the machine moves out. `CLAUDE.md` wins over the prompts, and a prompt that contradicts it leaves the scheduled run to pick one rule. The machine now writes its own log in `seo-log/`, which has its own hub, numbering and status. Manual sessions keep writing `docs/journal`, and the hub points to `seo-log/`.
- **Changed:**
  - The refresh prompt's step 7b now writes `seo-log/NN-weekly-seo-refresh-…`, updates `seo-log/README.md` and never touches `docs/`. Its commit list now names `seo-log/`, `keyword-research/` and the cluster map.
  - The merge gate's step 6 now writes `seo-log/NN-merge-gate-…`, with commit subject `seo-log: NN - …`.
  - The autopilot's step 11 now names both folders.
  - The repo got `seo-log/README.md` and a line in this hub.
  - The prompts before this change are backed up locally.
- **Verified:**
  - `lint-facts --prompts`: 0 FAIL
  - no `docs/journal` write is left in any of the three prompts

## Handover: the session closed on 2026-11-16, late night
Karol closed this session. This is everything a new session needs to pick up. The repo is clean and pushed (origin/main `0d0fb01` at close).

- **Waiting on others:**
  - **FaithWall's verdict on round 3** (`1f28292`, `f4bcbc9`) arrives after this session closed. A new QuranWall session takes it. Fix only what FaithWall's two skeptics both keep, then run every gate: typecheck, build, every `lint-facts` mode including `--self-test`, `check-facts`, and `kw:check`.
  - **Changes to the shared keyword script:** I proposed three: a host-neutral geo-probe line, a header note that `regex_families` take no lookarounds, and open-ended holds. If FaithWall ships a new `scripts/keyword-research.mjs`, copy it byte for byte and check the sha256 it sends. Never edit it here.
- **Waiting on Karol** (`TODO-KAROL.md` holds the details):
  - The seven product questions, including question 7: the wallpaper shows Arabic *or* a translation and never changes by itself, and the app does play recitation audio. The EULA's section 1 is aligned after the answer.
  - Social proof (p5).
  - The skill fact edits.
  - Translation rights, including the website's own quotes.
  - A licence-clear translation and a meanings reviewer before any tool page or mood page.
  - The ASO items.
  - Request Indexing, from 2026-11-17.
  - The contact email.
  - The Smart App Banner check.
  - The `CLAUDE.md` lag (push auth, the public-repo line, "no audio recitation").
- **Dates the machine and the next session should watch:**
  - **2026-11-23 (Monday):** the first refresh with Search Console data sets the baseline. `kw gsc` may still exit 3, because it needs 28 days. p5 rewords the social proof, and the four grandfathered strings turn into lint FAILs that day.
  - **2026-12-01 and 2026-12-15:** read the Request Indexing outcome from `gsc-inspect`.
  - **2026-12-07:** the wallpaper cluster's hold ends (queue p16).
  - **2026-12-15:** the p18 Turkish gate check starts weekly, and p17 (Ramadan readiness) becomes eligible.
  - **About 2026-12-16:** the first campaign-token read in App Store Connect (cohort record, private).
  - **The ASO session's reads on 12-08 and 12-14:** no US metadata change and no app build before 12-14. The App Store Connect API stays 403 until Karol accepts Apple's updated agreement.
- **Where things live:**
  - doctrine: `SEO-STRATEGY.md`
  - queue: `src/data/seo-priorities.json`
  - facts: `src/data/facts.json` and `npm run lint-facts`
  - keywords: `npm run kw`, `src/data/kw-config.json`, `src/data/keyword-clusters.json`, `keyword-research/`
  - the machine's log: `seo-log/`
  - Karol's manual-session journal: `docs/journal`
  - private numbers, outside the repo: the quranwall-gsc folder under `~/.claude` (Search Console dumps, inspect CSVs, the cohort record with its annotation rows, the keyword engine's private data)
  - scheduled prompts: the three quranwall-* tasks under `~/.claude/scheduled-tasks`
- **Rules that bit tonight:**
  - Two sessions shared this checkout. Don't commit or push another session's merge without asking it first.
  - Push with the one-off credential helper, not `gh auth switch`.
  - Run `npm run build` before every push.
- **FYI:** the BILLIK Vercel team showed most of its monthly credit used, with days left in the cycle; I passed that on to Karol. quranwall.com deploys from the SlohGPT account, not that team.
