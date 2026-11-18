# 06 — Generated covers, picture ratio and a cleaner /blog, 2026-11-18

Karol asked (11-18 evening, one session for all three sites, no agents) for covers people want to click, varied
("same style, but different positions, different ideas"), QuranWall images that "fit the vibe a bit more and be
more contextual", no image overload ("find a healthy ratio"), a better download card, no sticky chip bar and no
divider lines around it, and the /blog topic map gone ("I really fucking dislike this thing"). Then: verify it
yourself on all three sites, push, deploy, write it down. The full cross-site record is FaithWall
`docs/journal/45-blog-covers-picture-ratio-2026-11-18.md`.

## What changed here

- **Covers.** `scripts/cover-engine.mjs` 1.1.0 (shared with FaithWall and NoteWall) and `scripts/build-covers.mjs`
  render `public/blog-thumbnails/<slug>-cover.jpg` from `src/data/blogCovers.json`: the post's ayah in English, word
  for word, on an iPhone Lock Screen (night, emerald, dusk or photo wallpaper), a hook with one gold word, a topic
  pill, the app mark. Layouts: right 2, left 2, fan 2, closeup 2; the script fails when a cover repeats its grid
  neighbour's layout. No Arabic and no price words on covers. The 6 old Unsplash files are deleted and each old URL
  redirects permanently to its new cover (`vercel.json` `permanent: true`; Vercel answers 308, the commit says 301).
- **Skills and autopilot.** New `.claude/skills/quranwall-covers/SKILL.md`; `quranwall-blog` Step 3 now points
  there (Unsplash and `imageAttribution` dropped); `SEO-STRATEGY.md` image rule rewritten; the local autopilot
  prompt's image line (72) follows the covers skill, with `/og-image.png` plus a TODO when Chrome cannot run.
- **Picture ratio.** `src/lib/visualRhythm.ts`: a verse block is drawn big only with about 110 words of text on
  each side and budget left (one big picture per about 250 words); a big verse becomes the homepage Lock Screen
  mockup with that ayah (`VerseCard`, `LockScreen` got a `reference` prop) and replaces the post's spot scene; the
  rest render as a quiet serif quote (`VerseQuote`). Stats follow the same rule (`quiet` prop).
- **/blog.** `ClusterMap.tsx` removed. The chip row is static and has no `border-y` or background strip.
- **Download card** (`AppNudge.tsx`). The facts row is a three-item list (iPhone, iOS 15.0 or later, Free to
  download) with CSS dots, so the install line stays standalone: joined into one line it failed `lint-facts --dist`
  16 times (free-download-prose).
- **Mobile install card** (`StickyInstallBar.tsx`, Karol: "make it seem like it would be native App Store logo
  pop-up"). A floating dark iOS-style card: ×, app icon, "QuranWall", "A Quran ayah on your Lock Screen" and Apple's
  official "Download on the App Store" badge at 40 px with 13-16 px clear space. Posts only, after the first screen,
  hidden over the in-post install cards and the footer; same href and ct token. Held pages get it too (annotated).
- **leadItems label** (`src/lib/postIcons.ts`): a leading "1. " or "- " is escaped so it stays text (it caused React
  #418 on NoteWall; same fix here).

Commits `6ff366e` + `b79c308`, fast-forwarded to main and pushed 11-18 evening.

## Verification

Full table in FaithWall journal 45. Here: build exit 0 (16 routes); `lint-facts --dist` 0 FAIL, 2 WARN (EULA, as
before); typecheck 0. Live after the deploy, LCP on a throttled phone: `/` 936 ms, `/blog` 468 ms, post 1356 ms; desktop
under 480 ms; CLS at most 0.0018; no errors, broken images or overflow. The install card shows at 390 and 375 px,
badge 120x40. 6/6 old image URLs redirect to a cover that answers 200. `link-graph --live https://quranwall.com`
exit 0, 0 orphans, every og:image at least 1200 px.

## Open

- `lint-facts --prompts` still reports 1 FAIL that is not from today: `quranwall-merge-bot` line 48 quotes the
  invented-audio rule and the lint matches its own text (prompt unchanged since 11-17 16:00).
- EULA 2 WARN (arabic-beside-translation, wallpaper-automatic), as before.
