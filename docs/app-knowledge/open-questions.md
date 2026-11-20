# Open questions

What the code cannot settle.

## App Store Connect or RevenueCat
- Real prices and approval state of weekly, yearly and discounted-yearly products.
- Which RevenueCat offering is current, and whether the hosted paywall was published as designed. The design is not in the repo.
- Which build is live (1.2 build 28 is most likely; docs and a 2026-11-06 support message say v1.2) and the release date.
- The live privacy label (purchase history, identifiers, linked or not linked).

## Karol
- Source, publisher, year and licence of the nine older editions (Saheeh, French, German, Turkish, Indonesian, Malay, Urdu, Bengali, Persian). Also licence terms for Khattab and the fawazahmed0-derived data. No in-app credit exists.
- Whether to say "we do not sell your data" on the site.
- Whether any setup-time wording ("a few taps", "about a minute") is acceptable.
- Whether the legacy on-device promo path is still advertised anywhere.

## Needs a device or simulator
- Behaviour on a real iOS 15 device (setup choice is offered but the wallpaper path is gated).
- Whether the Shortcut's iCloud link resolves to the right shortcut today. The code marks the name and URL as owner placeholders and uses one string for legacy and new.
- What the shortcut's actions are, and whether it touches the Home Screen.
- Arabic keyword search against text with diacritics.
- Whether iOS reloads hourly widget timelines on time in the field.

## Server side (other repos)
- Promo worker behaviour and caps, and what the support endpoint stores and for how long.
- Whether the optional feedback relays (email service, Telegram, generic webhook) are configured in the shipped build.
- Mixpanel IP and geolocation settings.

## Cleanup in the app repo (not for the site)
- Stale: QuranWall.storekit, APP-DOCUMENTATION.md (says iOS 16, 10 editions, large and circular widgets), the release checklist status block, the "everyayah" comments, the Bible-era comments, the "~4-5 MB downloaded" picker footer.
- Unused code: Bible browser views, BibleAPIService, voting and user-count services.
- A Config.swift with a leftover third-party key is in the tree. Rotate and remove it; it was not copied here.
