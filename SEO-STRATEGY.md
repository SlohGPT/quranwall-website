# QuranWall SEO Strategy — v1 (2026-11-16)

**Who reads this:** the autonomous daily content agent, the merge gate, the weekly refresh task, and Karol. This file sets direction; `src/data/seo-priorities.json` sets the day-to-day work order. This repo is public — describe search performance qualitatively and never paste raw Search Console clicks, impressions, or CTR numbers into this file, commit messages, queue notes or post content. Positions described in words ("bottom of page 1", "mid page 1") are fine.

**What this version is:** the first strategy for quranwall.com, ported from the NoteWall and FaithWall SEO machines and re-aimed at a Quran-on-the-Lock-Screen app. It is built from the site inventory, the live App Store listing and live SERP, competitor and Google-autocomplete research done on 2026-11-16. **There is no Search Console baseline yet:** the service account has no access to `sc-domain:quranwall.com` (TODO-KAROL.md, top item). Until the first successful `npm run gsc-dump`, nothing in this file or the queue is ranked on clicks or impressions, and nothing here claims the site is gaining or losing traffic. The first weekly refresh after access is granted establishes the baseline and re-ranks the queue.

---

## 1. Positioning & Moat

QuranWall is an iPhone app by Karol Billik (App Store id 6781802080; the live listing is titled "Quran Widget: QuranWall", subtitle "Muslim Dua, Ayat & Daily Islam") that places an ayah from the Quran on the Lock Screen wallpaper and in a Home Screen widget, with the Arabic (Uthmani) text beside a translation (10 languages), customisable backgrounds, fonts and colours (or your own photo), all 114 surahs searchable, no ads, and offline use. The download is free; Premium is an in-app subscription. It is not a prayer-times app, an audio-recitation app, a tafsir app or a memorisation tool. The site's search moat is the intersection {Quran, ayah, verse, dua, dhikr} × {lock screen, wallpaper, widget} × {iPhone}.

Why we can win, structurally:

- **Query-product fit.** For "quran verse on iphone lock screen" and the widget phrasings, QuranWall is the literal answer, not an adjacent one.
- **Thin editorial competition.** On 2026-11-16 the results for the lock-screen and widget phrasings ("quran lock screen widget", "quran verse lock screen iphone", "daily ayah wallpaper iphone") were almost entirely App Store listings and their aggregator mirrors; no editorial how-to or roundup page ranked for them. The independent Muslim-app roundups that exist (Ayah, Quran.com, Tarteel, Muslim Pro, Athan) cover reading, memorising and prayer times and never mention a Lock Screen verse app. An honest developer's page with real setup detail can win on trust.
- **A real author.** Karol's Person schema, the About page and the AuthorBio are load-bearing; nothing publishes under a house name.
- **AI answers are a brand channel first.** Self-contained, quotable passages near the top of every page are an asset; third-party validation (§8) is what wins the recommendation.

Structural ceilings and honest constraints:

1. **App Store listings occupy the money queries**, and the category is crowded: a dozen-plus Quran widget apps (for example Quran Widgets: Verses & Duas with roughly six thousand ratings, Wird, nur, Ayat, Quran Quotes Widget, Quran Focus) against a listing with two ratings. Target: the top editorial result, not the top listing. Never claim QuranWall is the only app that does this (§5, §7).
2. **The site is new and unmeasured.** The 8 existing posts date from June and July 2026; whether Google has indexed or ranked them is unknown until Search Console access exists. Indexing speed, not content, may be the first bottleneck.
3. **Free intent mismatch.** The app is a free download with a subscription behind it. Queries such as "quran wallpaper for iphone free" are answered honestly (name that many wallpaper apps are free, say what QuranWall's model is), and those pages are judged on clicks to the money pages, not on installs from the "free" query.
4. **Religious-accuracy exposure.** A wrong ayah, a misquoted translation or an unsourced hadith does more damage on this site than a thin page does. The accuracy rules in §7 are hard gates, not style advice.
5. **Legacy claims debt.** The 8 existing posts, the site components and the old skill text carry claims that the live listing contradicts or cannot back (free, a monthly plan, "the only app", invented-looking social proof, a mislabelled phone-checks statistic, two verse blocks that are not word-for-word). That debt is cleaned up before anything is built on it (§9, queue p1–p7).

Strategy in one sentence: **fix what the site states wrongly, turn the install-intent pages we already have into the best editorial answer for Quran-on-the-Lock-Screen queries, build one honest comparison layer instead of per-competitor pages, and start the off-site layer the site has never had.**

## 2. Content Pillars, Ranked by Strategic Value

Cluster slugs (used by `seo-keywords.json`, `src/types/blog.ts` and the blog skill) are unchanged. No topic-hub pillar pages are routed yet (`pillars.json` and `comparisons.json` are empty); this version does not add them. Revisit when a cluster holds four or more posts worth linking from one page.

1. **daily-quran-lock-screen — the moat and the install-intent core.** Hosts /blog/quran-verse-iphone-lock-screen (the product itself), /blog/quran-focus-mode-iphone, the home page and /features. Demand evidence (autocomplete, 2026-11-16): "quran lock screen widget", "quran verse widget iphone", "daily quran verse widget iphone", "quran verse lock screen app", plus a separate wallpaper family ("quran wallpaper iphone", "quran verse wallpaper iphone"). Status: defend and deepen (queue p8, p11), one new wallpaper-intent post only after the correctness and depth items (p16).
2. **muslim-app-comparisons — the money layer.** /blog/best-islamic-lock-screen-app-iphone, /blog/best-muslim-app-for-iphone-2026. The format (QuranWall first, with disclosure) is house rule, but today these pages compare QuranWall only with apps that do other jobs. Next: a same-job comparison with real Quran widget apps read from live listings (p6, p9, p12). No per-competitor pages (§7, §9).
3. **dua-and-dhikr-iphone — adjacent demand, product fit unconfirmed.** /blog/best-dhikr-app-for-iphone and /blog/how-to-set-dhikr-reminders-iphone. "dhikr widget iphone" has named demand, but the live listing does not mention a dhikr or tasbih widget, so no new dhikr-widget page until Karol confirms the feature (TODO-KAROL.md). Status: refresh and internal links, not volume.
4. **muslim-productivity-iphone — soft-sell trust content.** /blog/muslim-morning-routine-iphone. Low sales temperature; it carries the most sensitive wording (a Prophetic-practice claim with no source, queue p1).
5. **quran-study-tools-ios — mostly a product mismatch.** /blog/quran-reading-plan-app-iphone. QuranWall has no audio, tafsir, tajweed, hifz or learning tools, so bank keywords in that family are `blocked` with a reason and are not written.

**Evidence the install-first ranking rests on (public App Store side, 2026-11-16):** the App Store results for "quran lock screen" and "quran widget" are dominated by widget apps with thousands of ratings, which shows the demand is real and contested; the brand query "quranwall" returns QuranWall's own listing first. No Apple Ads or Search Console evidence exists yet.

## 3. The Strategic Plays

### Play 1 — Own the "Quran on the Lock Screen" install intent
/blog/quran-verse-iphone-lock-screen is the page that is the product. Depth-pass it toward the widget phrasings (p8), with an answer-first passage, a widget-versus-wallpaper explanation sourced to Apple's iPhone User Guide, listing-backed facts about what QuranWall shows, and an honest "other apps do this too" paragraph. The widget phrasings share 9 of about 19 top results with the lock-screen phrasing in the 2026-11-16 spot-check, so they belong on this page, not on new URLs.

### Play 2 — The comparison layer, built honestly
One roundup (/blog/best-islamic-lock-screen-app-iphone, p9) owns the "best / alternatives" intent so there are never per-competitor pages; the broader /blog/best-muslim-app-for-iphone-2026 (p12) is kept factually current. Every competitor fact is read from the live US listing the same day. QuranWall ranks first with a bias-disclosure line near the Quick Answer. The false "only app" superlatives come out first (p6).

### Play 3 — Correctness before ranking
Queue p1–p7 fix what the site gets wrong: verse accuracy and translation naming (p1), the phone-checks statistic (p2), "free" and plan claims on the site and in the posts (p3, p4), unverifiable social proof (p5), the false uniqueness claim (p6) and the structured data (p7). These outrank every ranking item; a page that is wrong should not be promoted.

### Play 4 — Answer-first passages for AI answers and snippets
The home page and /features get one quotable, listing-backed positioning passage each (p11). This is the cheap way to be citable for "quran widget iphone" while the off-site layer is built.

### Play 5 — Brand and off-site layer (§8)
The brand query "quranwall" is the KPI; every placement and review feeds it. The agent researches and drafts; Karol sends.

## 4. Internal Linking Doctrine

**Money pages, in order:** 1. / (home) · 2. /blog/quran-verse-iphone-lock-screen · 3. /blog/best-islamic-lock-screen-app-iphone · 4. /blog/best-muslim-app-for-iphone-2026 · 5. /features · 6. /blog/best-dhikr-app-for-iphone

**Rules (all idempotent — "ensure exactly one", add only if absent):**
1. Every post keeps the blog-skill baseline: 2–3 in-body links to other posts, relative paths starting with `/`, no `/{cluster}` or `/compare` URLs (not routed).
2. Lock-screen how-to posts link /blog/quran-verse-iphone-lock-screen once in the first half; comparison posts link the how-to they depend on once. Rotate at least four anchor texts; no single anchor above 40% of a page's incoming internal links.
3. Cap: at most 5 in-body links per post (the App Store CTA is separate). At cap, replace the weakest generic link; never go below 2.
4. Money pages are never dead ends: every post ends with the CTA block and links onward; the home page links the money posts (p10).
5. Pillar and money-page links go in the first half of the body for how-to posts. Never inside a Quick Answer, the first paragraph or the CTA block.
6. One canonical URL per query. No redirects exist yet; if one is added, never link the redirected slug.
7. Baseline on 2026-11-16 (in-body inbound links between posts): best-dhikr-app-for-iphone, best-muslim-app-for-iphone-2026 and quran-reading-plan-app-iphone have none; best-islamic-lock-screen-app-iphone has one; the home page links no post. p10 fixes that.

## 5. Content Standards

- **Depth doctrine: consolidate and deepen before creating.** Before any new URL, ask whether an existing page should own the intent. The site has 8 posts; the queue deepens and corrects them before adding URLs.
- **Cadence: the daily run produces work, not necessarily a URL.** New posts at most 2 per week machine-wide (Karol's manual daily post counts; see §9) and only when the queue holds nothing ranked higher. Most days go to correctness fixes, depth-passes, refreshes, internal links and off-site drafts.
- **Formats that win, in order:** dated ranked-list roundups with a comparison table; how-to posts for the Lock Screen; trust-building explainers (low sales temperature).
- **Decision-page furniture** on every comparison/roundup: dated title, bolded Quick Answer naming QuranWall in sentence one, comparison table, visible FAQ block, visible updated date, bias-disclosure line ("QuranWall is our app, so it is ranked first; this is the honest case").
- **Length:** the blog skill's 800–1,100 words for new posts; depth-passes may exceed it (depth = more real sub-questions answered, never padding).
- **Effort signals (mandatory):** every new or refreshed page carries at least two things a scraper cannot fake: a first-party fact read from the live App Store listing (languages, surah count, offline, no ads, minimum iOS), a verbatim Apple Support or iPhone User Guide citation with attribution and the Settings path, an original screenshot that already exists in the repo, or a named-author judgment call by Karol Billik with stated reasoning. Test: "would this be expensive for someone else to fake?"
- **Device-less runs (mandatory, outranks the two-signal minimum).** The autopilot has no iPhone. It must **never** write a first-person testing, timing or device-behaviour claim ("we tested", "I timed", "setup takes 60 seconds"). If a page needs device evidence it uses what it can honestly source and writes the needed device check as a dated line in `TODO-KAROL.md`. An unverifiable first-person claim is a hard merge-gate FAIL.
- **Freshness:** money pages get a materially true visible update monthly; roundups quarterly; dated titles roll forward each January. Version names (iOS 26) only where Apple documentation confirms the feature.
- **AEO (passage-level):** one quotable self-contained positioning sentence in the first two paragraphs; every H2 opens with a direct answer in the first 40–60 words; name entities (iPhone, Lock Screen, widget, ayah, surah) explicitly; question-phrased H2/H3s where natural.
- **Comparisons:** QuranWall ranks first where it competes (house rule, with disclosure). Competitors are framed by what they actually do; never claim QuranWall is the only app, the first, or "the only one built for the lock screen" (see §7). Name competitors only from the verified list in the blog skill plus apps read from a live listing that day.
- **Product facts (mandatory; source of truth is the live App Store listing, then `.claude/skills/quranwall-blog/SKILL.md`; where they disagree the listing wins):**
  - **What the app does (listing-backed):** puts an ayah on the Lock Screen wallpaper and Home Screen widget (and a Lock Screen widget); a new ayah each day or a pinned favourite; Arabic (Uthmani) beside a translation, 10 languages; custom background, font and colours, or your own photo; all 114 surahs, searchable by surah, ayah or keyword; no ads; works offline; iPhone (App Store minimum iOS 15.0; per-screen wallpapers and Lock Screen widgets need iOS 16).
  - **What it does not do:** no audio recitation, tafsir, tajweed, hifz or memorisation tools, prayer times, qibla, AI features, journaling, Android or web app. Never write or imply otherwise.
  - **Unconfirmed (do not add new claims; do not remove existing ones without Karol):** install through iOS Focus modes, themed verse packs (Anxiety, Patience, Gratitude, Mercy), personal duas, the "60-second setup", which features sit behind Premium. They appear in the blog skill and parts of the site but not in the listing; they are tracked in TODO-KAROL.md.
  - **Pricing language:** the download is free; Premium is an in-app subscription (the listing shows weekly and yearly plans). Never write that the app "is free", "100% free" or "free forever". "Free to download" is allowed, with the subscription named nearby. **Never state a price, a plan price or a trial length** anywhere (posts, schema, llms.txt, pricing.md, CTAs); the App Store shows them before purchase and they change. The blog skill's "≈ $1.99/mo or $8.99/yr" line is superseded: the live listing does not match it. Statements that *other* apps are free are fine when still true on their live listing.
  - **Privacy language:** claim only what the listing's privacy label supports (it lists purchase history and identifiers as collected and not linked to you); do not write "no data collected" or "no tracking" as new copy.
- **Honesty:** only apps verified to exist; competitor facts only when read from the live listing the same day; one real cited statistic per post with a named source and the correct year (the phone-checks figure is 186 per Reviews.org's 2026 report; the older 144 was its 2023 survey).
- **Anti-template variety (mandatory):** never reuse a cited statistic from the last 5 posts; vary Quick Answer structure, H2 phrasing, QuranWall mention placement and section-type mix between consecutive posts. Banned title openers: "Unlock", "Crush", "Conquer", "Master", "Smash", "The Ultimate Guide".
- **Schema:** FAQ rich results were retired by Google in May 2026, so FAQPage and HowTo markup buys nothing for new pages. Existing markup (home page FAQPage and HowTo) stays as long as its text is true. Posts emit Article (Karol as Person author) plus BreadcrumbList via `src/pages/BlogPost.tsx`; do not add FAQPage to new posts. **Visible FAQ content blocks remain mandatory** on comparison/roundup posts and are written as heading plus paragraphs. Structured data carries the plain canonical App Store URL, not a campaign-tagged one. Never add `aggregateRating` or `Review` markup while the listing has two ratings.

## 6. Execution Contracts & Queue Lifecycle

The daily agent works `src/data/seo-priorities.json` top-to-bottom. Contract:

1. **Pick** the first `"status": "pending"` item whose `not_before` (if present) is not in the future; skip-but-don't-close items still inside their window. If none is eligible, run an §8 monitoring pass and report; do not write a post just because the queue is empty unless the §5 cadence cap (2 new posts this calendar week, counting Karol's manual post) is not hit and `seo-keywords.json` has an unblocked keyword that passes the §7 overlap check.
2. **Execute by type:**
   - `new-post` — full blog-skill flow (`.claude/skills/quranwall-blog/SKILL.md`) + §5 effort signals. The keyword is added to / marked in `seo-keywords.json` in the same commit; the SERP-overlap check (§7) comes first.
   - `refresh` — edit exactly the files named in notes. Bump visible updated date and `dateModified` (post JSON and `blogPosts.json`). No slug changes.
   - `depth-pass` — expand the named page toward the §5 standard: listed sub-queries, effort signals, passage-level AEO, updated tables and a visible FAQ. Word-cap exempt. Bump dates.
   - `ctr-fix` — title/meta/H1 per notes. Only on pages with large, legible, page-level demand in Search Console data; none exists yet, so none is queued.
   - `internal-links` — idempotent link edits per §4.
   - `outreach-prep` — research and draft per §8 into `outreach/`, append a one-line pointer to TODO-KAROL.md. **The agent never sends anything, never creates accounts, never posts to communities.** Drafts are honest, specific, and disclose QuranWall is our app.
   - `citation-audit` — web-research pass for the item's query set: who ranks/gets cited, where QuranWall is absent, what changed. Output: `outreach/targets.json` + summary in close-out notes. Qualitative only.
3. **Verify:** JSON parses; `npm run typecheck` introduces no new errors vs main; `npm run build` succeeds (it regenerates `public/sitemap.xml`: if only `lastmod` dates changed for untouched pages, restore it with `git checkout -- public/sitemap.xml`); internal links resolve; no placeholder text; no 2024/2025 dates; grep for "free" (only "free to download" next to the subscription wording is allowed for QuranWall) and for `$` prices; every verse block checked against quran.com; every App Store link goes through `src/lib/app-store.ts` (code) or carries the exact `qw-web-blog` URL (post JSON).
4. **Close out in the same commit:** `"status": "done"`, `"completed": "YYYY-MM-DD"`, a one-line `EXECUTED: ...` note (deviations included). Edit the queue programmatically: `JSON.stringify(obj, null, 2) + '\n'`.
5. **Commit and push to a `claude/*` branch** (never main): `seo: {item id} — {short description}` (or `blog: {title}`). IndexNow submission happens after the merge gate confirms deploy: `npm run indexnow -- <url> ...`.
6. **Images:** `UNSPLASH_ACCESS_KEY` from the environment if set (never print or commit `.env.local`); else the skill's Mode A fallback (`/og-image.png`). Halal imagery rule from the skill applies. Note the choice in the commit body.
7. **Flag channel:** anything needing a human (device checks, product-fact confirmation, offer codes, sending outreach, account creation, data exports) → TODO-KAROL.md. Never silently skipped, never guessed.
8. **Weekly refresh (local task, has Search Console access once granted):** `npm run gsc-dump -- <out.json>` (property `sc-domain:quranwall.com`, override with `GSC_PROPERTY`); verify done-item effects (position/CTR directions only in the repo); re-rank pending; track the brand query "quranwall"; track referral pickups from §8 placements; append new data-backed items; update this file only when strategy-level facts change. Dumps and the baseline marker live only on Karol's machine (`~/.claude/quranwall-gsc/`). **Until access is granted the dump returns 403; that is expected: report "baseline pending" and run the research pass only.** Effect windows count from Google's recrawl, not the ship date: check each page's last crawl with the URL Inspection API before reading an effect. IndexNow reaches Bing only; Google discovery runs on the sitemap, internal links and Karol's Request Indexing.

## 7. What NOT To Do

- **Never create a second page targeting a query an existing page targets or ranks top-10 for.** Check `blogPosts.json`, `seo-keywords.json` (`blocked`, `used_by`, `reason`) before every post. **SERP-overlap spot-check for every new keyword:** search the new keyword and the existing page's keyword (web search, same day); count shared top-10 URLs (App Store listings and their aggregator mirrors count). **7+ shared → extend the existing page; 4–6 → a separate post is fine; 0–3 → separate post.** Record the count and date in the queue item or the keyword's `reason`.
- **Blocked keywords** carry `"blocked": true` in `seo-keywords.json` and are never picked, by the agent or by the manual skill. A published post's keyword is `blocked` with `used_by` = its slug; true landmines carry a `reason`.
- **Never target or describe a feature the app lacks** (audio recitation, tafsir, tajweed, hifz or memorisation, prayer times, qibla, AI, journaling, Android, web). When in doubt, quote the App Store listing.
- **Never call QuranWall "free" (as in "a free app"), never state a price, plan price or trial length**, anywhere (posts, schema, llms.txt, pricing.md, CTAs). "Free to download" with the subscription named nearby is the only free wording.
- **Never claim QuranWall is the only, first or best-in-class app for the Lock Screen.** Other Quran widget apps exist and are named from live listings.
- **Religious-accuracy rules (hard merge-gate FAIL if broken):**
  - Quran quotes are word-for-word from a named translation (default Sahih International / Saheeh International), carry surah:ayah, and have the translation named in the reference text (the `verse` block prints only `reference`, so write `Quran 13:28 (Sahih International)`). Check each quote against quran.com the day it is written; do not quote from memory. A partial quote says it is partial.
  - **No hadith** unless the post names the collection, the hadith number and the grading, each verified on sunnah.com or equivalent the same day. A paraphrase of a Prophetic statement counts as a hadith.
  - **No religious rulings** (halal/haram, permissible, obligatory, reward or sin claims). The site is a tool, not a fatwa source; where a reader needs a ruling, say to ask a qualified scholar, and name none.
  - **No invented scholars, quotes, chains or "studies".** Name a real scholar only with a verifiable source.
  - **Respectful tone:** reverent toward the Quran, Allah and the Prophet ﷺ; no jokes, no sales language next to a verse, no use of ayat as marketing hooks; do not claim religious authority.
- **No per-competitor page farm.** One roundup plus the broader best-apps post; competitor brand queries ("muslim pro alternatives", "tarteel alternatives") are handled inside the roundup (§9) and are `blocked` in the bank.
- **No new URL for App-Store-phrase navigational queries.**
- **Do not paste raw Search Console metrics anywhere in this public repo.** Never commit `gsc-data*.json` (it is gitignored).
- **No general-directory submissions** — only the §8 vetted list.
- **No new tool pages (wallpaper makers, generators) without named demand evidence** in the queue item.
- **The agent never sends outreach, never creates accounts, never posts on communities, never submits forms requiring identity.**
- **No llms.txt investment beyond keeping its facts correct** — major AI crawlers largely ignore it; robots.txt access is the lever. `public/llms.txt` and `public/pricing.md` state no prices and must match the listing. Keep `robots.txt` welcoming and verify after any infra change.
- **Never print, copy or commit `.env.local`.**
- **Never use an App Store link that bypasses `src/lib/app-store.ts`** in code, or the exact `qw-web-blog` URL in post JSON. Leave `apps.apple.com/account/subscriptions` (Apple's own page) alone.

## 8. Off-Site & Brand Layer

**Division of labor is absolute: the agent researches, drafts and monitors. Karol sends, signs up, posts and photographs.** Every draft lands in `outreach/` with a TODO-KAROL.md pointer.

**Why this order:** mentions on pages that AI engines and Google already trust for our queries are worth more than generic links; `citation-audit` (p13) finds those pages, `outreach-prep` (p14, p15) converts them into drafts. The 2026-11-16 seed (`outreach/targets.json`) shows how thin the field is: the independent roundups of Quran and Muslim apps found cover reading, memorising and prayer-time apps and none mentions a Lock Screen verse app (or QuranWall); many other "best Quran apps" pages are written by app vendors ranking their own products and are not pitch targets.

**Tier 1 — independent roundups of Quran, Islamic and Muslim iPhone apps:** the verified seed list. Angle: honest solo-developer story (a Quran verse on your Lock Screen, Arabic with a named translation, free to download with a Premium subscription, a subscription offer code so the reviewer can test fully). Never ask for a ranking, never accept or offer a paid placement.

**Tier 2 — iOS tips sites and newsletters** that cover Lock Screen customisation and widgets (the same angle with the widget and wallpaper detail), and app-showcase outlets for independent developers.

**Tier 3 — seasonal windows (items carry `not_before`):** Ramadan roundups (pitch in December and January for Ramadan 2027, expected around 8 February 2027, date to be confirmed), Dhul Hijjah/Eid and Muharram only if a roundup is actually published for them.

**Tier 4 — directories that survived (citation surfaces, nofollow is fine):** AlternativeTo and SaaSHub, listing under Quran/Islamic app categories; needs Karol's account. Product Hunt and communities (r/islam-adjacent subreddits, Muslim tech groups) are Karol-only plays under his own name after reading each community's self-promotion rules live; the agent does neither.

**Standing brand plays:** grow one-word "quranwall" branded demand (the KPI; autocomplete and the store title "Quran Widget: QuranWall" make the brand query ambiguous, so pair the name with "Quran lock screen app" in off-site copy); App Store review velocity (the listing has two ratings: an in-app review prompt after a moment of value is an app-side task, flagged to Karol); an App Store Connect offer code for reviewers.

**Owned audience:** the site captures no email and runs no analytics. Whether to add either is Karol's call; the trade-off is measurement.

## 9. Scaled-Content Risk Posture

We run an autonomous daily agent while Google enforces against scaled content. The policy test is *pattern and purpose*, not authorship. The penalized profile is rapid-scale template content: at-scale comparison pages, "best X" listicles, self-promotional roundups, per-competitor alternative pages. Defenses, all mandatory:

1. **Clean the existing set first:** the 8 posts were written in June–July with the blog skill and carry the template tells and claims p1–p7 remove (unnamed translations, a mislabelled statistic repeated in five posts, "the only app", "free"). Correctness items outrank all new work.
2. **Volume discipline.** **Karol publishes a manual daily post through the quranwall-blog skill.** That is the dominant source of new URLs, so the machine does not add volume on top: it coordinates through the `blocked` flags in `src/data/seo-keywords.json` (the skill skips blocked keywords and sets `blocked` + `used_by` when it publishes; the machine does the same) and **prefers depth-passes, refreshes and internal links over new URLs.** New-post queue items rank last and are capped by the §5 cadence rule, counting Karol's posts. If the weekly refresh sees two manual posts and a machine post in one week, it defers the machine post.
3. **Effort signals on every page** (§5).
4. **Real author identity everywhere:** Karol's Person schema, AuthorBio and About page stay load-bearing; nothing publishes under a house name.
5. **Consolidation over proliferation;** one roundup, no per-competitor pages, no near-duplicate keyword posts (the 7+ overlap rule).
6. **Honesty rules (§5, §7) are risk rules:** verified-real apps, live-listing facts, disclosure, accurate Quran quotes.
7. **Monitoring:** once Search Console access exists, the weekly refresh watches for step-change visibility drops coinciding with confirmed Google updates and flags them to Karol immediately rather than publishing into a penalty.

## 10. Install-First Plan

**The goal is App Store installs, not clicks.** Where this section conflicts with older sections, this one wins.

**Where we stand (qualitative):**
- **Baseline pending first Search Console access.** The service account (`karchi@karchi-indexing.iam.gserviceaccount.com`) has no access to `sc-domain:quranwall.com`; `npm run gsc-dump` returns 403. Whether the domain property exists at all is unknown (TODO-KAROL.md). Until a dump succeeds there are no statements here about traffic, positions or indexing. The first weekly refresh after access writes the baseline marker (on Karol's machine only) and the first qualitative read here.
- **Public evidence (2026-11-16):** quranwall.com did not appear in any of the lock-screen, widget, wallpaper, "best Quran app" or brand searches run during research; those results were App Store listings, aggregator mirrors and a few independent roundups. The App Store brand query "quranwall" returns the QuranWall listing first. The listing has two ratings.
- **The site states several things the live listing contradicts or cannot back** (free wording and a monthly plan, "the only app", social-proof numbers, the 144 statistic, two verse blocks): queue p1–p7.
- **No Apple Ads or App Store Connect data is wired in;** the weekly refresh cannot read App Store Connect.

**Measurement.** Every App Store link carries `?pt=<provider token>&ct=qw-web-<pagetype>&mt=8` (`src/lib/app-store.ts`; page types: home, nav, footer, blog, pillar, compare, about, features, pricing, plus llms for `public/llms.txt`; `public/pricing.md` shares the pricing campaign). The provider token (128303795) is the same for NoteWall, FaithWall and QuranWall: the three listings share one developer account (App Store artist id 1854170675). Downloads per campaign appear in **App Store Connect → Analytics → Sources → Campaigns** (look for the `qw-web-*` names). Granularity is page type, not post; a later refinement to per-post `ct` (for example `qw-web-blog-<slug truncated>`, 40 characters or fewer) is possible if blog-level attribution proves worth the churn. The weekly refresh cannot read App Store Connect; Karol, or a manual session with the App Store Connect connector, reviews campaigns monthly (TODO-KAROL.md) and re-ranks the queue: pages that produce installs get refresh and authority effort; pages that produce clicks but no installs get conversion work or nothing. Outreach drafts use `ct=qw-web-outreach` so placements show up separately.

### Install-intent pages (the weekly refresh reads this list)

Primary — the pages whose job is the install; read their search position, click-through and App Store campaign direction every week:
- `/` — home, brand and category ("quran widget iphone", "quranwall")
- `/features`
- `/blog/quran-verse-iphone-lock-screen` — the product query and its widget phrasings
- `/blog/best-islamic-lock-screen-app-iphone` — the same-job comparison
- `/blog/best-muslim-app-for-iphone-2026` — the broad best-apps page
- `/blog/best-dhikr-app-for-iphone` — adjacent best-of page

Secondary — trust and setup content that feeds the primary pages; read for indexing state and internal-link effect, not for installs:
- `/blog/how-to-set-dhikr-reminders-iphone`
- `/blog/quran-focus-mode-iphone`
- `/blog/muslim-morning-routine-iphone`
- `/blog/quran-reading-plan-app-iphone`

New pages join this list in the same commit that ships them.

**Priorities, in order:**
1. **Correctness** (p1 verse accuracy and hadith sourcing, p2 the statistic, p3 and p4 free/plan claims, p5 social proof, p6 the uniqueness claim, p7 structured data).
2. **Convert the install-intent pages** (p8 the product page, p11 home and /features, p9 and p12 the comparison pages), then **internal links** to the pages Google may not see (p10).
3. **Off-site** (p13 audit → p14, p15 drafts), seasonal for Ramadan 2027.
4. **New posts last** (p16), only with named-demand evidence and the §7 overlap check.
5. **AI answers.** ChatGPT search leans on Bing's index: keep IndexNow pings on every published change (`npm run indexnow -- <urls>`), keep `robots.txt` open to AI bots, keep quotable facts near the top of money pages. Bing Webmaster Tools status is unconfirmed (TODO-KAROL.md).

**Additional don'ts:** never reintroduce "free" or price claims; never rank on raw numbers in the public repo; handle a competitor's brand query inside the roundup, not with a new page.
