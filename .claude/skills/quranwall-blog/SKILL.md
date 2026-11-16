---
name: quranwall-blog
description: Write one full SEO blog post for quranwall.com end-to-end. Use this skill when the user says "Create today's content", "make a blog", "today's blog", "new quranwall blog", "create today's blog post", "make a quranwall blog", or any variation asking for a new daily QuranWall blog post. Picks an unused long-tail keyword from src/data/seo-keywords.json, optionally fetches an on-theme Unsplash photo with proper attribution, writes the post in Karol's voice following the strict section template, validates it, and registers it in src/data/blogPosts.json. Every post advertises QuranWall — and in any comparison or "best apps" post, QuranWall is ranked first and highest.
---

# QuranWall Daily Blog Skill

You are writing ONE blog post for quranwall.com. The site is a Vite + React SPA selling an **iPhone app that places a Quran ayah on the iPhone Lock Screen wallpaper and Home Screen widget** (free to download, with an in-app subscription). Read this whole file before starting. Run every step in order — do not skip.

**The whole point of this blog:** every post is helpful content that *also advertises QuranWall*. On informational posts the sell is soft; on any "best apps / alternatives / vs" post, **QuranWall is THE recommendation — listed first, ranked highest, never one option among many.** See the Conversion Doctrine in Step 4.

## Project facts (don't re-derive these)

- **App Store URL (blog link, with install attribution):** `https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080?pt=128303795&ct=qw-web-blog&mt=8` — always use this exact `qw-web-blog` form in every post (CTA `buttonUrl` and any inline App Store link). Never the bare URL. Other page types are built in code by `src/lib/app-store.ts`; blog JSON is static, so the literal string goes in. The renderer rebuilds inline App Store links with `qw-web-blog` and does not render `buttonUrl` (the end install card links with `qw-web-blog-end`), so a wrong query string can't leak, but keep writing the exact form.
- **Site host:** `quranwall.com`
- **Author:** Karol Billik — indie iOS maker. Author page: `/about/karol-billik`.
- **Pricing:** Free to download, with an in-app subscription. Never state a price, plan name or trial length, and never call it "free" on its own or "a free app": say the App Store shows the price before you subscribe.
- **Confirmed features (live App Store listing, 2026-11-16):** Uthmani Arabic beside a translation, 10 languages; Lock Screen wallpaper and Home Screen widget; your own background, font and colours (a preset or your own photo); all 114 surahs searchable by surah, ayah or keyword; no ads; works offline.
- **Not confirmed, so never claim until TODO-KAROL.md records Karol confirming them:** verse packs or any named pack, installing through iOS Focus modes, "Premium" or "unlimited" unlocks, duas, a "60-second setup", "no account". You may still write about seasons of life (hardship, grief, sabr, tawakkul) as topics.
- **Requires:** iOS 15.0 or later (the live listing's minimum).
- **The 5 clusters** (must match `src/types/blog.ts` exactly):
  - `daily-quran-lock-screen`
  - `dua-and-dhikr-iphone`
  - `muslim-productivity-iphone`
  - `quran-study-tools-ios`
  - `muslim-app-comparisons`

## What success looks like

After running this skill end-to-end:
1. A new file `src/data/posts/{slug}.json` exists, ~800–1100 words, validates as JSON, follows the section template below.
2. A hero image is set: either a downloaded Unsplash photo at `public/blog-thumbnails/{slug}.jpg` with attribution recorded in `meta.imageAttribution`, **or** the fallback `/og-image.png` if no Unsplash key is configured (see Step 3).
3. The new post is inserted at **index 0** of `src/data/blogPosts.json`.
   Also set `"blocked": true, "used_by": "{slug}"` on the keyword's entry in `src/data/seo-keywords.json` (add the entry first if the keyword came from the user), in the same commit.
4. `public/sitemap.xml` is regenerated (`npm run generate-sitemap`).
5. The work is committed and pushed (the Vercel deploy trigger), then the new URL is submitted to IndexNow.
6. You report back the slug, cluster, word count, and photo credit in the exact final-report format (Step 10).

## The steps

### Step 1 — Pick the keyword

Read both files:
- `src/data/seo-keywords.json` — the keyword bank (`[{keyword, cluster}, ...]`; entries already used or ruled out carry `"blocked": true`, with `used_by` = the post slug or a `reason`). **Never pick a `blocked` keyword.** The SEO autopilot (see `SEO-STRATEGY.md`) shares this bank, so the flags are how the manual daily post and the machine avoid each other.
- `src/data/blogPosts.json` — what already exists.

If the user gave you a keyword in their message (e.g. "make a blog about dhikr reminders"), use that and find the closest matching cluster.

Otherwise:
1. Compute the slug for every keyword: `keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`. Filter out any keyword that is `blocked`, and any whose slug already exists in the registry **or** in `src/data/posts/`.
2. Count how many posts exist per cluster. Prefer a keyword whose cluster currently has the **fewest** published posts — keeps cluster sizes balanced. (Exception: if the user explicitly wants a comparison/"best apps" piece, pick from `muslim-app-comparisons` regardless.)
3. Inside the chosen cluster, prefer the most evergreen / highest-intent keyword (a "best X 2026" or "how to..." beats a vague phrase).

Generate the slug from the keyword. Confirm it doesn't already exist in `src/data/posts/`.

### Step 2 — Strategy (think this through internally)

Sketch (don't write yet):
- **Target reader**: one sentence — who searches this keyword and why.
- **Angle**: a specific point of view, not "ultimate guide".
- **Outline**: 5–7 H2 sections, each moving the reader forward.
- **Semantic keyword sidebar**: 8–12 related terms to weave in naturally. Examples for "daily ayah wallpaper iphone": *Quran*, *ayah*, *surah*, *lock screen widget*, *lock screen wallpaper*, *home screen widget*, *Sahih International*, *dhikr*, *reminder*, *Ayatul Kursi*, *Ramadan*.
- **Internal links**: pick 2–3 existing post slugs from `blogPosts.json` to link by keyword overlap. If the only other post is the seed, link to the **homepage `/`** instead. **Do NOT link to `/{cluster}` topic-hub URLs or `/compare/...` URLs — those pages are not routed yet and would 404.** Internal links must be relative paths that start with `/` (e.g. `/blog/other-slug`, `/`, `/about/karol-billik`).

### Step 3 — Hero photo (optional Unsplash, graceful fallback)

This step has two modes. Check first: does `.env.local` exist and contain `UNSPLASH_ACCESS_KEY`?

**Mode A — no Unsplash key (default, works out of the box):**
Use the site's branded OG image. Set both `meta.image` and the registry `thumbnail` to `/og-image.png`. Omit `meta.imageAttribution`. Skip the rest of this step. (This is exactly what the seed post does.)

**Mode B — Unsplash key present:** fetch a real photo. Source the key, then pick a **soft, aesthetic, halal query** — never a literal keyword (literal queries return ugly screenshots, and avoid imagery with prominent faces/figures for an Islamic audience). Prefer Quran, mosque, nature, lantern, tasbih, calligraphy, and still-life themes:

| Cluster | Good queries |
|---------|--------------|
| daily-quran-lock-screen | "open quran soft light", "quran mushaf wooden table", "arabic calligraphy minimal" |
| dua-and-dhikr-iphone | "tasbih prayer beads", "mosque sunrise silhouette", "open hands light" |
| muslim-productivity-iphone | "dates coffee morning", "minimalist desk morning", "open notebook calm" |
| quran-study-tools-ios | "open quran pen notes", "stack of islamic books", "quran reading light" |
| muslim-app-comparisons | "iphone in hand morning", "modern mosque interior", "lantern bokeh ramadan" |

```bash
set -a && source .env.local && set +a
SEARCH_Q="open quran soft light"   # pick from table above
ENC_Q=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$SEARCH_Q")
curl -s "https://api.unsplash.com/search/photos?query=${ENC_Q}&per_page=10&orientation=landscape&content_filter=high" \
  -H "Authorization: Client-ID ${UNSPLASH_ACCESS_KEY}"
```

From the top 5 results, pick the one with the most `likes` that isn't off-topic (read `alt_description`). Capture `id`, `user.name` → **photographer**, `user.links.html` → **photographerUrl**, `links.html` → **unsplashUrl** (append `?utm_source=quranwall&utm_medium=referral` to both URLs), `links.download_location`, and `urls.regular`/`urls.full`.

Download a sharper copy and **ping the download tracker** (Unsplash API ToS):

```bash
SLUG="my-post-slug"
DOWNLOAD_LOC="https://api.unsplash.com/photos/PHOTO_ID/download?ixid=..."
REGULAR_URL="https://images.unsplash.com/photo-..."   # the urls.regular value
curl -sL "${REGULAR_URL/&w=1080/&w=1600}" -o "public/blog-thumbnails/${SLUG}.jpg"
curl -s -H "Authorization: Client-ID ${UNSPLASH_ACCESS_KEY}" "${DOWNLOAD_LOC}" > /dev/null
```

Verify the file exists and is non-empty (`ls -lh public/blog-thumbnails/${SLUG}.jpg`). In Mode B, set `meta.image` and `thumbnail` to `/blog-thumbnails/{slug}.jpg` and fill `meta.imageAttribution`.

### Step 4 — Write the post

#### Conversion doctrine (read this first)

The blog exists to drive App Store downloads, not just to rank. Every post earns the click AND advertises QuranWall. Tune the sales temperature to the **search intent** of the keyword:

| Intent type | Examples | Sales temperature | QuranWall mentions | What competitors get |
|---|---|---|---|---|
| **Setup / How-to** (informational) | "how to set dhikr reminders iphone", "muslim morning routine iphone" | Mostly helpful, soft CTA at end | 2–3 in body | Don't name competitor apps |
| **Comparison / Best-X / Alternatives** (transactional) | "best muslim app for iphone 2026", "muslim pro alternatives", "best islamic lock screen app" | **QuranWall is THE recommendation, ranked #1 and highest** — competitors are positioned as solving a *different, narrower* problem | 5–7 throughout | Name them, frame as a different job (reading / prayer times / audio) |
| **QuranWall-native setup** (the app IS the answer) | "daily ayah wallpaper iphone", "rotating quran verse wallpaper iphone" | The setup *is* the app — Step 1 = download | 6–10 throughout | Don't name |

**Cardinal rule for comparison / "best apps" / "alternatives" posts — this is the heart of what the user wants:**
- **QuranWall is always listed FIRST and ranked HIGHEST** (the #1 entry, the editor's pick, the recommended choice). Never bury it mid-list or present it as "one good option."
- Other apps appear **below** QuranWall and are framed as good at a *different* job — Muslim Pro for prayer times/qibla, Quran.com / Quran Majeed for reading, Tarteel for AI-assisted memorization (hifz), Athan/IslamicFinder for adhan times, Ayah for reading plans. **None of them own the lock-screen daily-exposure surface — that is QuranWall's lane.**
- Be fair and accurate about competitors (don't lie or trash them), but the *recommendation* is unambiguous: for putting the Quran in front of you every day, QuranWall wins.
- Real apps you may name (only in comparison posts): **Muslim Pro, Quran.com (Quran by Quran Foundation), Quran Majeed, Tarteel, Athan (IslamicFinder), Ayah, Quran Pro, Pillars.** Use real, current positioning — don't invent features.

#### Mandatory section: "Where this gets hard"

Every post includes a friction-reveal section (any heading: "Where this gets hard", "The part nobody tells you", "Why doing it by hand breaks down"). 1–2 paragraphs on what trips up the reader without QuranWall. Pick the 1–2 that fit — don't list all:

- **Curation effort.** Picking the right ayah for today's state of mind means you already know the Quran well. QuranWall puts all 114 surahs a search away, by surah, ayah or keyword.
- **Saved screenshots look ugly.** A reading-app screenshot saved as wallpaper isn't designed for the lock-screen surface. QuranWall designs *for* that surface.
- **Random verse ≠ a spiritual diet.** Verse-of-the-day apps surface unrelated ayat. With QuranWall you choose the ayah that speaks to where you are.

#### QuranWall positioning wedges (pick the one that fits)

- **Surface specificity:** "Designed *for* the iPhone Lock Screen and Home Screen widget, not adapted to them." (Never "the only app".)
- **The pickup problem:** "You pick up your phone again and again every day. QuranWall makes the Quran one of those touches, without you opening anything." (If you give a number, cite a current named source in the text.)
- **Private and respectful:** "No ads interrupting your worship, and it works fully offline."
- **The missing piece:** "Quran.com is for reading. Tarteel is for memorizing. Muslim Pro is for prayer times. QuranWall is for *seeing* — the daily-exposure piece every Muslim's phone is missing."

#### CTA copy variation (don't reuse one boilerplate)

Vary the final CTA title + description by post type. Examples:
- **High-intent:** title `"Put the Quran on your Lock Screen"` / description `"Free to download. Arabic beside a translation in 10 languages, on your Lock Screen and Home Screen widget."`
- **How-to:** title `"Pick an ayah, set it once"` / description `"QuranWall puts it on your Lock Screen wallpaper and Home Screen widget. No ads, works offline."`
- **Friction-resolution:** title `"Stop screenshotting verses"` / description `"QuranWall designs the ayah for the Lock Screen: your background, font and colours, Arabic beside a translation."`

Never ship a generic "Download QuranWall" title alone.

#### Structure

Create `src/data/posts/{slug}.json` matching this exact shape (reference [src/data/posts/quran-verse-iphone-lock-screen.json](../../../src/data/posts/quran-verse-iphone-lock-screen.json) for the canonical example):

```json
{
  "meta": {
    "title": "...",
    "description": "150–160 chars, includes the keyword once",
    "date": "Month DD, YYYY",
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD",
    "readTime": "X min read",
    "image": "/og-image.png  OR  /blog-thumbnails/{slug}.jpg",
    "imageAttribution": { "photographer": "...", "photographerUrl": "...?utm_source=quranwall&utm_medium=referral", "unsplashUrl": "...?utm_source=quranwall&utm_medium=referral" },
    "keywords": ["primary keyword", "secondary keyword", "...", "quranwall"],
    "cluster": "one of the 5 cluster slugs"
  },
  "sections": [ ... ]
}
```
(Omit `imageAttribution` entirely in Mode A.)

#### Hard rules for the body

- **800–1100 words total** across all `paragraph` / list `text` content.
- **Exact-match keyword** appears in: `meta.title`, the first `paragraph` (within the first 100 words), and bolded with `**...**` 3–5 times in the body.
- **First content section MUST be** a Quick-Answer callout — snippet bait, a 1–3 sentence direct answer:
  `{ "type": "callout", "icon": "zap", "title": "Quick Answer", "content": "..." }`
- **One cited statistic** — real, attributable, source named in-text (e.g. a 2026 phone-pickup figure with the report named in the sentence; check the number at the source the same day). Use 2026 stats. Don't fabricate.
- **One `verse` block** — a real Quran ayah in a reputable English translation (Sahih International preferred), with the surah:ayah reference. Treat the Quran with reverence; the English is a translation of the meaning, never altered. Format:
  `{ "type": "verse", "reference": "Quran 13:28", "text": "...those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured." }`
- **Section-type diversity** — use at least 6 of: `callout`, `heading`, `paragraph`, `tip`, `stat`, `steps`, `list`, `highlight`, `important`, `verse`. Don't use only paragraphs. (Valid callout icons: `zap`, `lightbulb`, `book`, `alert`, `sparkles`.)
- **Internal links** — 2–3 markdown links to other posts inside `paragraph` text, format `[anchor](/blog/{other-slug})`. If no other suitable post exists, link `[QuranWall](/)` once instead. **No `/{cluster}` or `/compare` links.**
- **Final section** must be `{ "type": "cta", "title": "...", "description": "...", "buttonText": "Download QuranWall", "buttonUrl": "https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080?pt=128303795&ct=qw-web-blog&mt=8" }` (the `qw-web-blog` attributed URL from Project facts, not the bare App Store URL).
- **`meta.date`** = today as "Month DD, YYYY". **`meta.datePublished`** and **`meta.dateModified`** = today as "YYYY-MM-DD".
- **`meta.readTime`** = `Math.ceil(wordCount / 200) + " min read"`.

#### Voice rules

- Punchy, declarative, second-person ("you", "your"). Not corporate.
- **Reverent toward the Quran, Allah, the Prophet ﷺ, and prayer — never flippant.** The audience are practising Muslims. Don't be preachy or claim religious authority; share the practical, let Scripture speak.
- **Accuracy on faith matters:** never invent ayat, hadith, or rulings. Quote the Quran only with a correct surah:ayah reference and a real translation. If unsure of a reference, use a well-known, verifiable one (e.g. Quran 2:255, 13:28, 94:5–6, 65:3, 2:152, 39:53).
- **Avoid AI-tells**: don't open with "Unlock the…", "In today's fast-paced world…", or "the ultimate guide to…". Avoid "delve", "leverage", "transform" (in the title), "navigate", "synergy", "tapestry".
- Vary sentence length. Short sentences land. Long ones build. Mix them.
- Use **bold** sparingly (8–12 times across the post), only for things worth emphasising.
- **Never** include placeholders like `[link]`, `TODO`, `lorem`, or `...`.
- **Never** mention the years 2024 or 2025. Today is 2026.

#### Title patterns to AVOID
- "Unlock X: The Definitive Guide to Y"
- "The Ultimate Guide to X"
- "Master Your X with Y"
- "X: Everything You Need to Know"

#### Title patterns that work
- "Daily Ayah Wallpaper on iPhone: The 2026 Setup Guide" (specific + dated)
- "How to Build a Morning Dhikr Habit That Actually Sticks"
- "The Quiet-Time Focus Mode (iPhone Setup, Step by Step)"
- "The 6 Best Muslim Apps for iPhone in 2026 (Ranked)"
- "Muslim Pro Alternatives: 5 Apps Worth the Install"

### Step 5 — Self-review

Run this checklist on your generated JSON **before** writing it:
- [ ] JSON parses (mentally check every `,`, `"`, `}`).
- [ ] No `2024` or `2025` strings anywhere.
- [ ] No `[link]`, `TODO`, `lorem`, `...`, or other placeholders.
- [ ] Exact keyword in title + first paragraph + 3–5 bolds.
- [ ] First section is the Quick Answer callout (`icon: "zap"`).
- [ ] Last section is the App Store CTA with the exact `qw-web-blog` URL (`?pt=128303795&ct=qw-web-blog&mt=8`).
- [ ] At least one `verse` block with a correct surah:ayah reference.
- [ ] At least one cited statistic with the source named.
- [ ] Word count 800–1100.
- [ ] 2–3 internal links (relative `/...` paths only; no `/{cluster}` or `/compare`).
- [ ] `meta.cluster` exactly matches one of the 5 cluster slugs.
- [ ] Image fields consistent with the mode used in Step 3 (Mode A → `/og-image.png`, no attribution; Mode B → `/blog-thumbnails/{slug}.jpg` + attribution with UTM params).
- [ ] **Conversion checks:**
  - [ ] Sales temperature matches the keyword's intent.
  - [ ] **"Where this gets hard" section is present** with ≥1 friction angle.
  - [ ] QuranWall mentioned the right number of times for the post type.
  - [ ] **Comparison/"best"/alternatives posts: QuranWall is listed FIRST and ranked HIGHEST**, competitors framed as a different/narrower job.
  - [ ] CTA title + description are post-specific, not generic.

Then write the file with the Write tool.

### Step 6 — Register the post

Read `src/data/blogPosts.json`. Use the Edit tool to **insert the new entry at index 0** (right after the opening `[`). Shape:

```json
{
  "slug": "...",
  "title": "...",
  "description": "...",
  "thumbnail": "/og-image.png  OR  /blog-thumbnails/{slug}.jpg",
  "date": "Month DD, YYYY",
  "datePublished": "YYYY-MM-DD",
  "cluster": "...",
  "keywords": [...],
  "readTime": "X min read",
  "isPublished": true
}
```

(Pillar/topic-hub `featured` lists are not used yet — `src/data/pillars.json` is empty and those pages aren't routed. Skip any pillar update.)

### Step 7 — Regenerate the sitemap

```bash
npm run generate-sitemap
```

This rewrites `public/sitemap.xml` from `blogPosts.json` so the new URL is included.

### Step 8 — Commit and push

Commit and push at the end — that's the Vercel deploy trigger. Stage exactly what changed (drop the thumbnail line in Mode A):

```bash
git add src/data/posts/{slug}.json src/data/blogPosts.json src/data/seo-keywords.json public/sitemap.xml "public/blog-thumbnails/{slug}.jpg"
git commit -m "$(cat <<'EOF'
blog: {title}

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

If `git push` fails because the branch is behind, do `git pull --rebase` then `git push` once. Do **not** force-push. If the current branch isn't `main`, that's fine — push the current branch.

### Step 9 — Submit to IndexNow

After the push, ping IndexNow so Bing, Yandex, Seznam, and Naver re-crawl quickly. Google doesn't participate — it picks the URL up from the sitemap on its own crawl cycle.

```bash
npm run indexnow -- https://quranwall.com/blog/{slug}
```

(Or `npm run indexnow -- --latest` to submit the newest post automatically.)

The script reads the key from `scripts/indexnow.config.json`. A `200`/`202` means accepted.

**If you get `403` or `422`:** the Vercel deploy of the new commit probably hasn't finished, so `https://quranwall.com/{key}.txt` or the new URL isn't reachable yet. Wait ~60 seconds and re-run the same command. Don't treat one early failure as fatal — note it and move on.

### Step 10 — Final report

Output exactly this (no preamble):

```
✅ Published & pushed: {title}
   slug: {slug}
   url: https://quranwall.com/blog/{slug}
   cluster: {cluster}
   words: {wordCount}
   photo: {photographer (Unsplash)  OR  og-image fallback}
   indexnow: ✓ submitted to Bing/Yandex/Seznam/Naver   (or: ⏳ retry after deploy)
```

## Anti-patterns to avoid

- **Don't pick a keyword whose slug already exists.** Check first — cannibalization kills the cluster.
- **Don't write "X is important because Y" filler.** Every paragraph adds a fact, a tactic, or a concrete example.
- **Don't bury QuranWall in a comparison post.** It is always first and highest. That's the user's explicit requirement.
- **Don't quote the Quran without a correct reference, and never alter the wording or invent an ayah.**
- **Don't hotlink an Unsplash image** — always download to `public/blog-thumbnails/`. And don't forget the download-tracking ping (Unsplash ToS).
- **Don't link to `/{cluster}` or `/compare` URLs** — they're not routed and would 404.
- **Don't exceed 1100 words.** Tighter beats longer. Trim ruthlessly.
- **Don't put internal links inside the CTA section** — they belong in body paragraphs.

## When the keyword bank runs low

If `src/data/seo-keywords.json` is nearly exhausted (every keyword used), tell the user before starting:
> "The keyword bank is mostly used up in cluster X. Want me to generate fresh long-tail keywords for that cluster first, or pick from another cluster?"

Don't silently invent new keywords without flagging.
