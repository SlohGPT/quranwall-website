# 02 — Homepage redesign: phone mockup hero, features bento, section pass (2026-11-16)

Branch `design/homepage-v2`, worktree `../quranwall-website-home` (kept off `main` because another session was committing there at the same time).

## Asked
Karol: improve the hero "with actually nice mock-up of the phone, with actually the app's UI", then mid-task: change the features images ("I don't like it"), "do a bento grid out of it", and make "the whole design of the whole homepage way better".

## Found
- The hero showed the App Store preview video (`/quranwall-demo.mp4`); the features grid used four Pexels stock photos unrelated to the app; FinalCTA and How it works used Pexels photos too.
- The real app UI (iOS repo `STRANKY:APLIKACIE/QUORAN`, demo video frames, ASO screenshots): date + big clock, then the ayah under it — Uthmani Arabic in gold (Amiri Quran, shipped in the app), translation in a serif (Lora in the ASO generator), reference in tracked gold caps.
- App facts read from the iOS source: 10 languages (Arabic, English, French, German, Turkish, Indonesian, Malay, Urdu, Bengali, Persian; `BibleModels.swift`), Home Screen widget in `.systemSmall` and `.systemMedium` (`QuranWallWidget.swift`).
- The app's photo wallpapers (`iw_*`) are Pinterest-sourced (`islamic-wallpaper-pipeline/_rights.json`), so the site draws its own CSS/SVG wallpapers instead.

## Decided
- Mockups are built in code (CSS/SVG), not screenshots: crisp at every width, no image weight, text stays real.
- Verses in mockups come only from `src/data/showcaseVerses.ts`, every string copied from quran.com API v4 on 2026-11-16 (Arabic `text_uthmani`, English Saheeh International id 20; 94:6 also in Hamidullah 31, Bubenheim & Elyas 27, Diyanet 77, Kemenag 33, Basmeih 39, Jalandhry 234). Khattab, Muhiuddin Khan and Makarem Shirazi are not on quran.com's API, so they are not shown.
- Fonts: Amiri Quran (OFL) subset to the showcase ayat (35 KB woff2) and Lora (OFL) Latin subset (38 KB). Adding an ayah means re-running the subset (`pyftsubset … --text-file … --layout-features='*' --flavor=woff2`). Amiri sets vowel marks high; that matches the app and is not a rendering bug (checked full font vs subset side by side).
- Copy is unchanged except the features heading ("Made for the screen you see most") and the short tile lines, which restate listing facts.
- Hero CTA row: the gold "Get Started" is now 44 px to line up with the official 44 px App Store badge from `26a756a`.

## Built (uncommitted on the branch at the time of writing)
- `src/components/mockup/`: `PhoneFrame`, `Wallpaper` (night, emerald, dusk, photo), `LockScreen`, `HomeScreen`, `QuranWidget`.
- `Hero.tsx`: video replaced by a Lock Screen phone cycling 5 ayat and 3 wallpapers (pauses on hover, static under reduced motion), a Home Screen phone with the widget behind it (lg+), fact chips. Headline now fits two lines at every width.
- `Features.tsx`: six-tile bento (Lock Screen, widget, ten languages cycling 94:6, 114-surah search, interactive background/font/colour customiser, no ads + offline). No stock photos.
- `src/components/ui/` (`SectionHeading`, `GlassCard`, `StarPattern`, `Reveal`) and a design pass on SocialProof, HowItWorksAndPreview, TestimonialsAndFAQ (accessible accordion, answers stay in the DOM), ExploreMore, FinalCTA (app icon composition instead of Pexels), Pricing.
- `src/index.css` font faces, `tailwind.config.js` `font-quran` / `font-serif`.

## Verified
- `npm run typecheck` passes; `npm run build` prerenders 16 of 16 pages; `public/sitemap.xml` unchanged.
- `npm run lint-facts -- --dist` and `-- --diff main --worktree`: 0 FAIL, 0 WARN.
- Chrome: desktop 1440 and a 375 px iframe, no horizontal scroll; production build (`vite preview`) hydrates with no React errors.
- The How it works quotes (94:6, 13:28, 3:159, 2:286, Sahih International) match quran.com today.

## Open
- Not merged or deployed: waits for Karol's go-ahead.
- Existing copy the design pass kept but the product-fact rules question: SocialProof "92 % feel closer to Allah", "1,000+ believers", "60s to set up"; How it works "Set up in under 2 minutes"; FinalCTA "Join thousands / 1,000+"; three "First Waitlist Member" testimonials. Same open item as p5 (social proof) in the queue.
- `public/quranwall-demo.mp4` and its poster are no longer used on the homepage; kept in `public/` in case the video moves elsewhere.
- FinalCTA is also used on `FeaturesPage`; it renders there but was not reviewed visually.

---

## Round 2 (2026-11-16 evening): no pricing, How it works, hero height

### Asked
Karol: "we don't need to mention the pricing on the website, at all … let people download the app and then they will see"; make How it works "a bit more realistic"; highlight in the hero that it's "in one click" or "changes on its own"; the hero is not height-aligned on a MacBook M4 14", make it fit "on all devices"; send a design enhancer to the FaithWall website session.

### Decided and built (uncommitted on the branch)
- **No pricing anywhere a visitor reads.** `Pricing.tsx` deleted and its section, nav and footer links removed; price, "free", "free to download", subscription and trial wording removed from Footer, FAQs, featureNav, Support, AppNudge, BlogRenderer install cards and 8 posts. Doctrine changed to match: `SEO-STRATEGY.md` §5 ("Pricing language: none on the website at all", with Karol's words), the blog skill, and every pending queue note in `seo-priorities.json`.
- **New lint rule `pricing-mention`** in `scripts/lint-facts.mjs` (bare phrases: "free to download", "in-app subscription", "the App Store shows the price", "before you subscribe" …). Exempt by file (`PRICING_EXEMPT`): `public/llms.txt` and `public/pricing.md` (machine files keep the factual "free to download, with an in-app subscription, no prices" line), the legal pages and `src/data/facts.json`. JSON-LD keeps the offer with price 0 but no description.
- **Hero fits the viewport** with CSS only (`HERO_CSS` in `Hero.tsx`): a wide mode for `min-width:1024px` and landscape-ish aspect, a stacked mode everywhere else, the phone stage sized from the viewport height (`--H`). Checked at 14" MacBook, 1440, 1920, tablet and 375 px widths.
- The FaithWall session got a design brief (same visual language, its own app's facts).

## Round 3 (2026-11-16 night): what the app really does

### Asked
Karol: the round-2 hero was wrong, "we can't change the quote on the lock screen wallpaper by itself automatically", drop the text card left of the App Store button, "be truthful … really understand what the app does, their limits".

### Found (iOS source, `STRANKY:APLIKACIE/QUORAN/QuranWall/`)
- **The Lock Screen wallpaper never changes by itself.** The app has no background refresh for it (the only background mode is audio). Flow: "Choose your ayah" → picker → review sheet → **Make It Mine** → the app renders the image → Apple's Shortcuts app runs the "QuranWall." shortcut, sets the Lock Screen wallpaper and returns to the app. The shortcut is added once, in onboarding.
- **One edition per ayah:** the wallpaper and widget show Arabic *or* one translation, not both. Optional transliteration line (off by default). The reference is the text colour at 78 % opacity, written "Ash-Sharh 6", not tracked gold caps. **Correction to round 1's Found:** the gold Arabic + serif translation + caps reference layout came from the ASO screenshots, not the app.
- Editions: Arabic plus 10 translations in 9 languages.
- **The widget is the only thing that rotates:** auto-rotate is off by default; when on, daily (default), every 8 hours or hourly; it is a Premium feature. Widget layout: crescent symbol, one text, reference; the medium size adds a "QuranWall" label.
- No pin or favourites. An "Update Wallpaper" path exists only as dead code.
- The app does have read-along audio ("Listen in Arabic"); the site's rule says "no audio".
- The wallpaper shortcut needs iOS 16; the listing says iOS 15.0 or later.

### Decided and built (uncommitted on the branch)
- **Hero:** headline "The Quran / On Your Lock Screen"; sub "With QuranWall, pick any ayah, tap Make It Mine, and it becomes your iPhone Lock Screen wallpaper. Change it whenever you like." The left text card, hover pause and progress bar are gone. The back phone is a faithful mini **Make It Mine** review sheet (`src/components/mockup/AppScreens.tsx`, `ReviewScreen`); a demo loop (desktop/tablet only, visible tab, no reduced motion) shows a tap on Make It Mine and the front Lock Screen changing, alternating Arabic and English. Mobile stays static. A step pill reads "Pick an ayah → Tap Make It Mine → Set on your Lock Screen". "One tap" was not used: it isn't true (a few taps plus the Shortcuts hand-off).
- **Mockups show one edition** (`LockScreen` and `QuranWidget` take `edition`), reference in the app's format.
- **How it works**, 4 steps: Get QuranWall (with the one-time Shortcuts setup), Choose your ayah, Make it yours (review sheet), It's on your Lock Screen (Shortcuts sets it; change it whenever you like). Widget copy: auto-rotate daily, every 8 hours or hourly.
- **Copy made truthful** in Features tiles, FAQs (new "Does the wallpaper change by itself? No …"), featureNav ("Daily Verses" nav label → "Your Ayah"), Home title/description/HowTo schema, FinalCTA, FeaturesPage, PrivacyPolicy, TermsOfUse and NotFound meta: no "beside a translation", no "new ayah every day" for the wallpaper, offline qualified to browsing.

### Verified
- `npm run typecheck`; `npm run build` 16/16 prerendered, sitemap unchanged; `lint-facts -- --dist`, `--diff main --worktree` and `--all`: 0 FAIL; `check-facts` ok. Production preview hydrates with no console messages. Hero checked in Chrome at the wide, tablet and 375 px sizes.
- **Dry-run merge with main (030c8f5)** in a throwaway checkout: conflicts in `docs/README.md`, `scripts/lint-facts.mjs` (main's per-clause NEG opts vs the pricing file exemption: resolved by passing `relPath` inside main's opts object) and `seo-priorities.json` (main's text with the no-pricing preamble). Merged tree: typecheck ok, build 16/16, `lint-facts --dist`/`--all` 0 FAIL and 4 WARN (the social-proof strings main grandfathered until 2026-11-23, queue item p5), `check-facts` ok. `lint-facts --prompts` gives 3 FAIL `pricing-mention`: the three scheduled-task prompts still tell the machine to write "free to download, with an in-app subscription".

### Open
- **Merge waits for Karol's OK** (`--no-ff`, SlohGPT at HEAD); resolve the three conflicts as in the dry run.
- **After merge:** update the autopilot, merge-bot and refresh prompts for the no-pricing doctrine (`lint-facts --prompts` must reach 0 FAIL) and tell the SEO session.
- **For Karol (the app and its listing disagree):** the listing, ASO screenshots, `CLAUDE.md`, `SEO-STRATEGY.md`, the blog skill, `public/llms.txt` (Arabic "beside" a translation, "works offline", "No audio recitation") and many posts claim Arabic beside a translation, a new ayah each day and a pinned favourite. The app shows one edition per ayah, never changes the wallpaper by itself, and has no favourites. Until the doctrine changes the SEO machine keeps writing those claims. Also: iOS 15.0 on the listing vs iOS 16 for the shortcut; the read-along audio vs the "no audio" rule; JSON-LD price 0 if the app has a hard paywall; the stale "Update Wallpaper" hints in the app; the legal pages' app name "Daily Quran Verses on Your iPhone Lock Screen".
- Social proof ("Trusted by 1,000+ believers", "Join 1,000+ believers", the SocialProof stats) is unchanged: queue item p5, FAIL from 2026-11-23.

## Merge (2026-11-16, late night)

### Asked
Karol: "Yes, commit and merge".

### Done
- **Merge:** `1eb4f88`, `--no-ff` from `design/homepage-v2` (branch tip `25c2862`) into main at `030c8f5`, default identity. The three conflicts were resolved as in the dry run (`docs/README.md`, `scripts/lint-facts.mjs` with `relPath` inside main's `opts`, `seo-priorities.json`).
- **SEO session overlap:** the SEO session was editing `scripts/lint-facts.mjs` and `TODO-KAROL.md` in the same checkout mid-merge. To avoid sweeping their edits into the merge, I staged my exact resolution blob and left theirs unstaged. They committed their round 3 on top (`a34c536`, `ce0f3f6`).
- **Review before push:** an 8-agent review of the merged diff confirmed 8 findings, all fixed in `6c7f69c`:
  - Arabic, Urdu and Persian editions now show the Arabic surah name in the reference, as the app does (`BibleBookNames.swift`). Each showcase verse has a `surahNameAr`, and the Amiri Quran subset was rebuilt for those glyphs. Every `font-quran` string is covered; the Urdu body text uses the serif font.
  - The review sheet's nav row shows Cancel only (in the app, Done is a keyboard accessory).
  - The Features Lock tile text no longer runs under the phone at 768–1023 px (checked in headless Chromium at 768/800/835/900/1023).
  - The background swatches have labels, and the bento heading respects reduced motion.
  - The hero demo no longer leaves both phones on the same ayah when it pauses between the front change and the back advance.
  - Collapsed FAQ answers are `aria-hidden`, with the region role only when open.
  - The 17:78 quote in `muslim-morning-routine-iphone` was made exact (Sahih International, checked on quran.com the same day).
  - This hub's status line was stale.
- **Scheduled-task prompts:** the autopilot, merge-bot and refresh prompts had told the machine to write "free to download, with an in-app subscription". Those sentences now carry the no-pricing wording, and refresh item b6 points to `SEO-STRATEGY.md` §1 (honest constraint 3).

### Verified
- **Gates on `6c7f69c`** in a clean worktree:
  - typecheck ok;
  - build 16/16, sitemap unchanged;
  - `lint-facts --dist` and `--all`: 0 FAIL, 4 WARN (the p5 social-proof strings grandfathered until 2026-11-23);
  - `--diff 030c8f5` 0/0, `--prompts` 0/0, `--self-test` 63/63;
  - `check-facts` ok.
- **Push:** pushed `030c8f5..6c7f69c` with the SlohGPT credential helper. Vercel served the new homepage about 45 s later:
  - "Make It Mine" is present and no pricing strings remain;
  - the 17:78 fix is live on the post;
  - robots.txt still allows the AI bots.
- **IndexNow:** `--all` returned 200 OK; shared components changed, so `--changed` asked for `--all`.
- The SEO session was told the final SHA.

### Open
- **For Karol:**
  - The listing/doctrine contradictions from round 3 are unchanged: "Arabic beside a translation", "new ayah each day", the pinned favourite, iOS 15 vs 16, read-along audio vs "no audio", JSON-LD price 0, and the legal pages' app name.
  - Social proof p5 turns FAIL on 2026-11-23.
- **Cleanup offered, not done:** the `design/homepage-v2` branch and worktree `../quranwall-website-home` are fully merged and can be removed when Karol says so.
