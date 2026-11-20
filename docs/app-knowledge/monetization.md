# Monetization

Do not publish prices, plan lists or trial wording on the website. The founder's rule for all three sites is no subscription, paywall, trial or price wording (legal pages excepted). This file is for accuracy only.

## Flow
- New install: long onboarding quiz, then a full-screen RevenueCat paywall with no close button in Release builds. Onboarding continues only if the user is premium. OnboardingView.swift:801-902, 6275-6278.
- Setup after payment sets `hasCompletedSetup`. OnboardingView.swift:6261-6285.
- Result: no usable free tier for a new install. The only way in without paying is a valid promo code (see below).

## Plans (from product IDs in code)
- Main offering "main_no_trial": yearly and weekly, neither with a trial. PaywallManager.swift:85-89; RevenueCatPaywallView.swift:6-8.
- No monthly plan. No live lifetime plan in the flow.
- Prices are not in this public file. Product IDs and real prices live in App Store Connect, RevenueCat and the app repo.
- Entitlement ID: "QuranWall+". PaywallManager.swift:12-17.

## Trial
- The only trial: 3 days on yearly. It appears only on the exit offer, when the user cancels Apple's purchase sheet and the Apple ID is still intro-eligible. PaywallManager.swift:261-296; RevenueCatPaywallView.swift:448-456.
- If not eligible or unknown, the exit offer is a discounted yearly with no trial. RevenueCatPaywallView.swift:463-640.
- The same discounted yearly is the cancel-save offer in Settings. PaywallManager.swift:197-257.
- The earlier weekly downsell is retired.

## Free-export counter (live, but new installs never reach it)
`freeExportLimit = 3` wallpaper exports is enforced: every non-premium save calls `trackWallpaperExport()` and the launch check can show the non-dismissible paywall. It applies to a non-premium user who already finished setup (a lapsed or cancelled subscriber, or a pre-hard-paywall install): after 3 saves they hit the paywall. A new install never gets that far (verified 2026-11-20: ContentView.swift:751, 957-964; PaywallManager.swift:908, 1315-1330). PaywallManager.swift:676,890-895,1315-1362; ContentView.swift:434,849,1989.

## What premium gates
Found gating on premium: export limit, widget (locked upsell), Settings widget rows and auto-rotate. No gating found on translations or verse content. Recitation has no gate in its own files. Based on a search of isPremium across the main files; confidence medium.

## Promo codes (no codes here)
- Server path: 8-character codes are posted to a developer-run worker that grants the RevenueCat entitlement. PromoCode.swift:1-80.
- A legacy on-device code path also exists and can grant lifetime access (details stay in the app repo). PromoCodeManager.swift.
- Entry points: onboarding name step, paywall support sheet, Settings. SupportSheet.swift:144; SettingsView.swift:1312-1330.

## Other money-related UI
- Gift Live Activity and a Home Screen quick action "claim discount" for non-premium people who saw the paywall. GiftOffer.swift:1-60; QuickActionsManager.swift:16-24.
- First-buyer spotlight tour after setup. FirstBuyerTour.swift:1-60.
- Cancel-intent flow with reason, offer, feedback. SubscriptionFeedbackView.swift:943-975.
- Review prompts only for paying users, at most 3 lifetime. ReviewPromptManager.swift:7-13,61-72.

## Stale items
`QuranWall.storekit` is a FaithWall copy (wrong names and IDs). Ignore any price taken from it. Legacy PaywallView and HardPaywallView are not used in Release paths. QuranWall.storekit:8-64; SettingsView.swift:296-342.
