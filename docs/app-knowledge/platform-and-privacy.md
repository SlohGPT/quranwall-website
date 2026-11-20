# Platform and privacy

## Platform
- iPhone only: device family 1, no Catalyst, no Designed for iPad or Mac. Portrait only. project.pbxproj:923-927; Info.plist:91-97.
- Deployment target iOS 15.0 for app and widget, Debug and Release. project.pbxproj:827,886.
- iOS 15 gets the app shell, browsing, recitation, notifications and Home Screen widgets (small, medium). Wallpaper and Lock Screen widgets need iOS 16. See wallpaper.md and widget.md.
- 10 UI languages, three right-to-left (Arabic, Urdu, Persian). LocalizationManager.swift:30-40.
- Works offline for text and browsing. Needs internet for first play of each recitation, purchases, support, promo codes and analytics.
- No accounts, no sign-in, no iCloud or CloudKit, no Keychain use. Data lives in UserDefaults, an App Group shared with the widget, and local files. Purchases restore through Apple and RevenueCat.

## SDKs
- RevenueCat (purchases). It also collects Apple's AdServices attribution token. AppDelegate.swift:71-83.
- Mixpanel (product analytics), automatic events off, anonymous SDK id, no identify call. RevenueCat is stamped with that id. AppDelegate.swift:16-31,78-83.
- No ad SDK, no ATT prompt, no IDFA use, no tracking-usage string. Info.plist; a search for AdSupport and ATT found nothing.
- Crash reporting is a stub; only Apple's own crash data. CrashReporter.swift:1-60.

## What is sent
- Mixpanel: about 60 named events (app open, onboarding steps and quiz answers, paywall and purchase events, wallpaper and shortcut events, notification taps). Includes quiz answers (age bracket, motivation, how they found the app) and, on first wallpaper save, the verse reference and a text snippet. The typed first name is not sent to Mixpanel. ContentView.swift:785-800; OnboardingEnhanced.swift:201-240.
- Support and feedback: the typed message plus RevenueCat id, app version, device model, iOS version, language, onboarding answers (including the first name) and first saved verse go to the developer's own endpoint. FeedbackService.swift:242-312,355. Optional extra relays exist in code; whether they are on is unknown.
- Promo redeem: code, RevenueCat id and a per-install device id go to a developer-run worker. PromoCode.swift:85-100.
- Quran.com: surah and ayah key when the user plays recitation. Recitation.swift:51-65.
- iTunes lookup for the review link. ReviewPromptManager.swift:355-380.
- Unused network code from FaithWall (voting, user count, NIV API) has no call sites. Remove before any "we never contact X" claim.

## Privacy manifest
`PrivacyInfo.xcprivacy` says tracking false, and lists Crash Data (not linked), Product Interaction (not linked), Other Data (linked), all without tracking. It does not list purchase history or identifiers; the App Store label is separate and is not in code. PrivacyInfo.xcprivacy:24-63.

## Permissions
Photos (add and read for wallpaper), Camera (photo background), local notifications (opt-in, daily nudges 07:00 to 21:59, onboarding nudges, trial reminders; no push). Info.plist:63-70; NotificationManager.swift:68-125.

## Truthful privacy wording
Supported: no ads, no ad SDK, no account or email needed, no tracking across other companies' apps and sites, no ATT prompt. Not supported: "no tracking" in the plain sense, "no analytics", "no data collected", "nothing leaves your phone". "We do not sell your data" is a policy statement the code cannot prove; Karol decides.
