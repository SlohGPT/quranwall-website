# QuranWall app knowledge base

Read from source on 2026-11-20. Source commit: `4e45bc1 Journal 01: WhatsApp support thread with Amadou (v1.2, French)` (main, v1.2 build 28; last code change is merge 1fce0ef).

## The app in 10 lines
1. QuranWall is an iPhone-only app (no iPad, no Mac) that puts one Quran ayah on the Lock Screen.
2. The user picks one ayah. The app draws it onto a 1290x2796 image.
3. The wallpaper path hands the image to a Shortcut the user installs once. The Shortcut sets the Lock Screen wallpaper.
4. The widget path skips Shortcuts. A Lock Screen or Home Screen widget shows the ayah.
5. All Quran text is bundled: 11 editions (Arabic plus 10 translations in 9 other languages). No download.
6. One edition per ayah. Arabic or a translation, not both. An optional romanized line can sit under it.
7. The wallpaper only changes after an action inside the app. Only the widget can rotate ayahs, and only when the user turns it on.
8. A per-ayah read-along recitation exists (Mishary Alafasy, streamed from Quran.com, then cached).
9. New users hit a hard paywall at the end of onboarding. There is no usable free tier for a new install.
10. Minimum iOS is 15.0, but the wallpaper and Lock Screen widgets need iOS 16.

## How it was built and checked
Six parallel readers mapped one area of the app source each, a synthesis pass wrote these files, and an independent verify pass re-checked every answer and feature row against the code. The verify pass corrected one claim (the 3-save free limit is live for lapsed subscribers, not dormant) and softened another (promo codes are a way in without a purchase); both are fixed here. Built by a FaithWall-repo session for Karol on 2026-11-20 (QuranWall journal 07).

## How to use this knowledge base
Before writing or editing any claim about the app on the website, look it up here, then check the evidence line (file:line, paths relative to the app repo). Use `site-claims.md` for wording. Use `open-questions.md` for what only App Store Connect or Karol can answer.

## Index
- `features.md`: every user-facing feature in one table.
- `wallpaper.md`: how the wallpaper is made and applied.
- `widget.md`: the widget, rotation, iOS versions.
- `content-and-translations.md`: editions, search, browsing, audio.
- `monetization.md`: paywall, plans, trial, promo codes (no secrets).
- `platform-and-privacy.md`: iOS support, SDKs, data, permissions.
- `onboarding-and-settings.md`: the journey, tabs, settings, support.
- `site-claims.md`: safe to say / never say.
- `seven-answers.md`: the seven founder questions.
- `open-questions.md`: what code cannot settle.

## Rule
The app source wins over the App Store listing and over old docs (including the app repo's own APP-DOCUMENTATION.md and the release checklist, both partly stale). Re-check the source whenever the app ships a new version. Do not put keys, promo codes, revenue or user data in this folder.
