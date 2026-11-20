# 07 — App knowledge base from the iOS source, site aligned, 2026-11-20

Run from a FaithWall-repo session at Karol's request. Karol: "open my folder that is local on my Mac and really understand what the app does all yourself ... build an internal knowledge base in the website folder exactly what it does, so you will have better context. Other than that, everything is up to you." On posts: "I think we should publish more blogs, but it's up to you."

## Built

- **`docs/app-knowledge/`** (11 files). A workflow read the app repo (`STRANKY:APLIKACIE/QUORAN`, commit `4e45bc1`, v1.2 build 28): six readers, one per area (wallpaper and Shortcuts, widget, content and translations, paywall, platform and privacy, onboarding and settings); a synthesis pass; an independent verify pass over every answer and feature row; an audit of this website against the result. The verify pass corrected one claim: the 3-save free limit is live for lapsed or pre-paywall users, not dormant. It also added that promo codes grant premium without a purchase. Product IDs that carry prices and promo-code details were left out of this public copy. The leftover third-party key in the app repo's `Config.swift` was not copied.
- **The seven TODO-KAROL questions, answered from code** (`seven-answers.md`):
  - No free tier for a new install. Onboarding ends in a paywall with no close button.
  - Focus-mode install, themed packs, personal duas and a dhikr or tasbih widget do not exist. "60 seconds" is unmeasured in-app copy.
  - Installs on iOS 15.0. The wallpaper and Lock Screen widgets need iOS 16, so iOS 15 gets the Home Screen widget and the in-app Quran.
  - Privacy: the site may say no ads, no account and no tracking prompt. Never "no tracking" or "no data collected": Mixpanel and RevenueCat are in the app.
  - One edition per ayah. The wallpaper changes only on in-app actions; the widget rotates only when the user turns it on.
  - Read-along recitation per ayah exists, so the old `CLAUDE.md` line "no audio recitation" was wrong.
- **The site, rules and machine follow the app:**
  - `CLAUDE.md` product facts, now pointing to `docs/app-knowledge/`.
  - `SEO-STRATEGY.md`: every "DISPUTED (TODO Q7)" resolved.
  - The blog skill: fact lines only.
  - `facts.json` and `lint-facts`, with new FAILs: denying audio, inventing a full-surah player, "no tracking", "verse selections stay on your device", a bare "works offline", the wallpaper on iOS 15, a dhikr widget, packs, pin, iPad/Mac/iCloud.
  - Site copy: FAQs, feature nav, features page, home offline line, five posts, `llms.txt`.
  - Factual fixes on the legal pages:
    - EULA §1 and its offline bullet.
    - Privacy: description, payment data, local notifications, Photos and Camera, the Offer Wall and marketing-email template lines removed, Identifiers and Commercial information YES with Mixpanel, RevenueCat and Quran.com named.
    - Terms: Android and Google Play removed.
  - Keyword bank: the audio keyword unblocked with a per-ayah caveat; the dhikr widget stays blocked, now "confirmed absent".
- **Queue:** p19, a transliteration post (`/blog/quran-transliteration-iphone-lock-screen`, not before 11-24), passed the demand test on autocomplete. A recitation post was not queued: demand is only for full-player apps, which QuranWall is not.
- **The two scheduled-task prompts** (`quranwall-seo-autopilot-local`, `quranwall-merge-bot`, outside the repo): their product-facts paragraphs were updated to the same facts. The audio WARN-only rule became the audio-denied FAIL.

## Verified

- `lint-facts --all`: 0 FAIL, 0 WARN. A false positive in `src/lib/postIcons.ts` was skipped in the lint.
- The other lint modes: `--self-test` passes 463 of 463; `--dist` and `--prompts` are clean.
- `npm run build`: 16 of 16 pages prerendered. Typecheck shows 0 errors and `kw:check` is clean.
- Every touched JSON parses. Posts were edited with field-scoped replacement.

## Open (Karol)

- Live prices and App Store Connect state, the live privacy label, "we do not sell your data" wording, any setup-time wording.
- Translation licences: unchanged in TODO-KAROL.
- Privacy lines that are doubtful but were kept: "no information from third parties", category F.
- The App Store listing still says "a new ayah every day" and "alongside a trusted translation". That is for the ASO session.
- Rotate and remove the leftover key in the app repo.
- Re-read the app source when a new version ships.
