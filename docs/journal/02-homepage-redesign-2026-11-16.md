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
