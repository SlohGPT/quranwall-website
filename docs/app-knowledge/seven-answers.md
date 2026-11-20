# The seven questions

Evidence paths are in the app repo.

## 1. Free tier? Plans? Trial?
- Answer: No usable free tier for a new install. Onboarding ends in a hard paywall with no close button; the app opens only after a purchase or a valid promo code. Plans in code: weekly and yearly, no trial, in the main offering. No monthly. No live lifetime plan. The only trial is 3 days on yearly, shown only in the exit offer after the user cancels Apple's purchase sheet, and only if the Apple ID is intro-eligible. A discounted yearly is the fallback exit offer and the cancel-save offer. A live limit of 3 free wallpaper saves applies to non-premium users who already finished setup (lapsed subscribers, pre-paywall installs); new installs never reach it (corrected by the verify pass). Promo codes grant premium without a purchase.
- Evidence: OnboardingView.swift:801-902; PaywallManager.swift:85-89, 261-296, 676, 1315-1362; RevenueCatPaywallView.swift:448-456.
- Confidence: high on gating and structure; medium on the free limit's real reach.
- Needs App Store Connect or Karol: real prices, whether the three subscriptions are approved and live, which RevenueCat offering is current, the hosted paywall's design.

## 2. Focus-mode install, themed packs, personal duas, 60-second setup?
- Answer: None of the first three exist. Focus appears only in an unreferenced tip about Shortcuts automations. Packs and duas are absent ("Anxiety" is a quiz answer). The Write tab lets a user type their own text. "60 seconds" is loose in-app copy after the shortcut install, never measured; an internal estimate is about two minutes.
- Evidence: OnboardingView.swift:8425-8460, 1262; NotificationManager.swift:89; OnboardingEnhanced.swift:3138, 3172-3176; VerseSelectionComponents.swift:775-830.
- Confidence: high.
- Needs Karol: whether to use any setup-time wording.

## 3. Real minimum iOS?
- Answer: 15.0 for the app and widget, Debug and Release. The listing is right; the old site's iOS 16 was wrong as an install requirement. In practice the wallpaper, the wallpaper picker, Lock Screen widgets and the gift Live Activity need iOS 16 or later.
- Evidence: project.pbxproj:827, 886; QuranWallWallpaperIntent.swift:25; SettingsView.swift:743-780; QuranWallWidget.swift:944-960.
- Confidence: high.
- Needs: nothing for the number. A real iOS 15 device test would confirm the dead-end setup screen.

## 4. Dhikr or tasbih widget?
- Answer: No. Widgets are the ayah widget, a Lock Screen logo or reference widget, and a gift Live Activity. "Dhikr" appears only in old ASO keyword notes.
- Evidence: QuranWallWidget.swift:942-1062; a search for tasbih and dhikr in the Swift sources found nothing.
- Confidence: high.
- Needs: nothing.

## 5. Privacy: what can the site truthfully say?
- Answer: Can say: no ads, no ad SDK, no account or sign-in, no tracking prompt, no cross-app tracking. Cannot say: "no tracking", "no analytics", "no data collected". The app uses Mixpanel product analytics under an anonymous id (including quiz answers and the first saved verse's reference and a snippet), RevenueCat for purchases (with Apple Ads attribution token collection), and sends support details to the developer. Quran.com is contacted for recitation. The privacy manifest says tracking false. A line such as "We use anonymous analytics to improve the app and RevenueCat to manage purchases" fits. "We do not sell your data" is a policy claim code cannot prove.
- Evidence: AppDelegate.swift:16-31, 67-90; ContentView.swift:785-800; FeedbackService.swift:242-312; PromoCode.swift:85-100; PrivacyInfo.xcprivacy:24-63; Recitation.swift:51-65.
- Confidence: high on what is in code; medium on label alignment.
- Needs App Store Connect or Karol: the live privacy label (purchase history, identifiers), Mixpanel IP and geolocation settings, server-side retention, final "we do not sell" wording. The legal privacy policy template does not name Mixpanel; the live page was not checked.

## 6. iOS 15: only wallpaper and Home Screen widget?
- Answer: Not quite. On iOS 15 the wallpaper does not work (App Intent and wallpaper settings need iOS 16). iOS 15 users get a Home Screen widget (small, medium), Quran browsing, search, recitation and notifications. No Lock Screen widgets. Onboarding still offers the wallpaper path on iOS 15, likely a dead end.
- Evidence: SettingsView.swift:743-780; QuranWallWallpaperIntent.swift:25; QuranWallWidget.swift:947-960; OnboardingEnhanced.swift:6148-6200.
- Confidence: high on code; not run on a device.
- Needs: a device or simulator test.

## 7. Wallpaper behaviour and audio
- One edition per ayah (Arabic or a translation, never both from the picker; optional romanized line, off by default): yes. Evidence: VerseSelectionComponents.swift:1405-1435; WallpaperRenderer.swift:673-720; SettingsView.swift:120.
- Never changes by itself; pick an ayah, Make It Mine, Shortcuts sets it, re-applied only on in-app actions: yes. No background task or timer exists. Evidence: Info.plist:71-74; ContentView.swift:547-640, 815-822.
- No pin or favourites: yes, none exist.
- Only the widget auto-rotates, and only after the user turns it on (off by default, premium): yes. Intervals daily, 8 hours, hourly. Evidence: SettingsView.swift:28-29, 584-601; Models.swift:334-373, 413-575.
- Read-along audio: yes, it exists. Per ayah, Mishary Alafasy, word-synced, speed and repeat, streamed from Quran.com then cached, not premium-gated in its code. The website CLAUDE.md line 21 ("no audio recitation") is wrong and should be fixed. Evidence: Recitation.swift:1-66, 322-325; VerseReviewView.swift:70; ContentView.swift:2116.
- Confidence: high.
- Needs: nothing for these; whether the shortcut itself touches the Home Screen cannot be read from code.
