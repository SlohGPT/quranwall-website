# Onboarding and settings

## Onboarding order
Quiz first, paywall second, setup third. OnboardingView.swift:189-242, 1098-1297.
1. Hook: typewriter reveal of a verse, then a phone mockup.
2. Pain-point stat, name input, quiz intro.
3. Quiz: age bracket, motivation, what they forget most, phone checks per day, distractions, how they found the app.
4. "Analyzing your answers", reframe, results preview, what changes, how the app helps.
5. Choose your ayah, then an overview mockup with the button to add it to the Lock Screen.
6. Hard paywall (no close button in Release). OnboardingView.swift:801-880.

After payment:
1. Welcome, then an optional transliteration screen (only for English app plus English edition).
2. "Choose Your Setup": Lock Screen Wallpaper or Lock Screen Widget. Changeable later. OnboardingEnhanced.swift:6148-6200.
3. Notification permission.
4. Widget path: pick verse, rotation question, add-widget guide, verify. WidgetOnboardingView.swift.
5. Wallpaper path: install-guide video, install shortcut, choose background, allow permissions, done.
6. A one-time spotlight tour of verse search and text style or auto-rotate. FirstBuyerTour.swift.

A relaunch before purchase skips the hook and shows the paywall again. OnboardingView.swift:560-562.

## Main app
Two tabs: Home and Settings. MainTabView.swift:67-85.
- Home: the one saved ayah, "Choose your ayah" or "Change your ayah", "Update Wallpaper" (wallpaper users), a troubleshooting banner, a feedback banner, a rating card after 2 wallpaper applies. ContentView.swift:1173-1215, 1575-1595, 3154-3170.
- Empty state: "No Ayahs Yet".

## Settings
Top to bottom. SettingsView.swift:196-245.
1. Membership card (QuranWall+ and manage, or upgrade).
2. Wallpaper users: Wallpapers, Text Style, Wallpaper Settings ("I use lock screen widgets").
3. Widget: add-widget guide, Auto-rotate ayahs, how often, edition used.
4. Qur'an (edition picker) and Language (10 locales).
5. Actions: wallpaper not showing, change setup mode, write a review, What's New, preview onboarding.
6. Appearance: Indigo or Gold.
7. Help and support: send feedback, contact support, redeem a code, copy support ID, legal links (terms, EULA, privacy on quranwall.com), share.

## What's New
Holds only the current 1.2 cards (new support sheet, redesigned subscription screen, small fixes). Shows once after an update, never on a fresh install. WhatsNewView.swift:29-46,372-430.

## Feedback and support
- Exit feedback form, day-7 feedback nudge, Home "Help Shape QuranWall" banner, star rating card, edition request form. ExitFeedbackView.swift; FeedbackPromptManager.swift:1-52.
- Support sheet: message, WhatsApp (pre-filled with device info), copy support ID, redeem a code. Written support only; one person runs it. SupportSheet.swift:25,58-93,144.
- Three Home Screen quick actions. QuickActionsManager.swift:16-52.

## Release state
Main holds v1.2 build 28 (merged 2026-08-30). All other branches are already merged. Docs and a user's support message of 2026-11-06 say v1.2 is live; the exact live date and build need App Store Connect. Sources: the app repo's docs/README.md and docs/journal/01.

## Version history (from the repo history)
1.0.1 (June 2026): Khattab edition and transliteration. 1.0.2: Islamic wallpapers. 1.1 (July 2026): read-along recitation. 1.2 (August 2026): new paywall and support sheet.
