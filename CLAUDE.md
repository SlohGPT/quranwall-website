# quranwall.com — working context for Claude

Marketing site for **QuranWall** (iOS, App Store id 6781802080): Vite + React (react-router, react-helmet-async) with an SSR prerender step (`vite build --ssr` then `scripts/prerender.mjs` writes static HTML per route), deployed on Vercel. Its job is installs: organic Google traffic plus citations in AI answers (ChatGPT, Perplexity, Google AI Mode).

Build: `npm run build` (sitemap, client build, SSR build, prerender). Check: `npm run typecheck`. **Run `npm run build` before pushing**: a wrong key in a blog post JSON crashes the SSR prerender (BlogRenderer field names differ from the old skill template, for example a `stat` block reads `number`, a `verse` block prints only `reference`). If the build changes `public/sitemap.xml` only in `lastmod` dates for untouched pages, restore it with `git checkout -- public/sitemap.xml`.

## The SEO machine (runs on its own)
Three Claude scheduled tasks on Karol's Mac (`~/.claude/scheduled-tasks/`), ported from the NoteWall and FaithWall sites:

| Task | When | Does |
|---|---|---|
| `quranwall-seo-autopilot-local` | daily 07:30 | Executes the top eligible queue item in a throwaway worktree, pushes a `claude/*` branch |
| `quranwall-merge-bot` | daily 11:15 | Verifies (typecheck + build), merges to main, waits for the deploy, pings IndexNow |
| `quranwall-seo-refresh` | Mon 11:45 | Search Console pull, verifies done items, research pass (AI-answer gaps, competitors, demand), re-ranks the queue |

The brain: `SEO-STRATEGY.md` (doctrine; §10 holds the install-intent page list), `src/data/seo-priorities.json` (ranked queue), `src/data/seo-keywords.json` (keyword bank; `blocked` = already used or ruled out), `.claude/skills/quranwall-blog/SKILL.md` (post contract), `outreach/targets.json` (off-site targets). Human-only work goes to `TODO-KAROL.md`. Search Console dumps live outside the repo in `~/.claude/quranwall-gsc/` (`npm run gsc-dump -- <out.json>`; property `sc-domain:quranwall.com`). **Until Karol grants the service account access the dump returns 403: that is expected, report "baseline pending".**

Karol also publishes a manual daily post through the `quranwall-blog` skill. The machine and the skill coordinate through the `blocked` flags in `seo-keywords.json` and the machine prefers depth, refreshes and internal links over new URLs (`SEO-STRATEGY.md` §9).

## Hard rules
- **Product facts:** QuranWall puts a Quran ayah on the iPhone Lock Screen wallpaper and Home Screen widget (Arabic beside a translation, 10 languages, customisable background/font/colours, all 114 surahs searchable, no ads, offline), per the live App Store listing. It has no audio recitation, tafsir, hifz tools, prayer times, qibla, AI, Android or web app. The download is free and Premium is an in-app subscription: never call it "free" (as in "a free app"), never state prices or trial lengths. Focus-mode install, themed verse packs, personal duas and the 60-second setup are not confirmed by the listing: add no new claims about them. The listing wins over the skill and the old site copy. Full rules: `SEO-STRATEGY.md` §5 and §7.
- **Religious accuracy:** Quran quotes exact, with surah:ayah and a named translation (write it in the `reference` text), checked against quran.com the same day; no hadith without collection, number and grading; no religious rulings; no invented scholars; respectful tone.
- **Vercel only deploys when the HEAD commit is authored by Karol's GitHub account** (`SlohGPT <slohgpt@gmail.com>`, this repo's default git identity). Bot-authored commits at HEAD are blocked. Merge with `--no-ff` using the default identity; if HEAD is a bot commit, add an empty commit before pushing. Never change git config.
- **Pushing needs the right GitHub account:** if a push 403s, run `gh auth switch -h github.com -u SlohGPT` first.
- **This repo is public:** never commit raw Search Console numbers (clicks, impressions, CTR) or `gsc-data*.json` (gitignored); positions and direction words only.
- `.env.local` holds secrets (Unsplash key): never print, copy or commit it.
- **App Store links go through `src/lib/app-store.ts`** (`appStoreUrl(CAMPAIGNS.<type>)` → `https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080?pt=128303795&ct=qw-web-<type>&mt=8`). Post JSON files are static, so they carry the literal `qw-web-blog` URL; `public/llms.txt` carries `qw-web-llms`, `public/pricing.md` carries `qw-web-pricing`. Structured data keeps the plain App Store URL. Leave `apps.apple.com/account/subscriptions` (Apple's page) alone.
- **Blog posts follow `.claude/skills/quranwall-blog/SKILL.md`.** Field names in post JSON must match `src/types/blog.ts` and what `src/components/BlogRenderer.tsx` reads, or the prerender crashes or renders blanks.
- Do not touch `docs/` (Karol's journal) from the SEO machine.

## AI search (ChatGPT etc.)
ChatGPT search reads Bing's index, so every published change gets an IndexNow ping (`npm run indexnow -- <urls>`; the merge gate does it after the deploy; key in `scripts/indexnow.config.json`, key file in `public/`). `public/robots.txt` allows all crawlers, including AI bots (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot); keep it that way and verify after any infra change. `public/llms.txt` and `public/pricing.md` must stay factually in sync with the rules above and state no prices; fix facts there, do not invest beyond that. Money pages open with quotable, answer-first passages that name QuranWall plainly (see `SEO-STRATEGY.md`).
