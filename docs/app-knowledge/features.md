# Features

Evidence paths are relative to the app repo (`QuranWall/` and `QuranWallWidget/`). "Premium" means the QuranWall+ entitlement. A new install cannot enter the app without a purchase or a valid promo code (see monetization.md).

| Feature | What the user sees | Free or premium | Min iOS | Evidence |
|---|---|---|---|---|
| Lock Screen wallpaper | One ayah drawn on a wallpaper, set through a Shortcut | Premium (a 3-save counter applies only to lapsed or pre-paywall users; new installs never reach it) | 16 | QuranWallWallpaperIntent.swift:25; WallpaperRenderer.swift:430-500; PaywallManager.swift:676 |
| Make It Mine | Pick an ayah, review, tap the button, wallpaper updates | Premium | 16 | VerseSelectionComponents.swift:1397; en.lproj/Localizable.strings:1448 |
| Update Wallpaper button | Home button re-renders and re-applies | Premium | 16 | ContentView.swift:547-640 |
| Text style | 23 Latin fonts, 4 Arabic fonts, colours, alignment, highlight, shadow, size | Premium | 16 for wallpaper | WallpaperRenderer.swift:86-123; SettingsView.swift:783-860 |
| Backgrounds | White, grey, own photo, 15 bundled Islamic images | Premium | 16 | Models.swift:57-122; IslamicWallpapers.swift:1-45 |
| Transliteration line | Optional romanized line under the verse, off by default | Premium | 15 | SettingsView.swift:120,838; WallpaperRenderer.swift:679-720 |
| Ayah widget | Home Screen small and medium; Lock Screen rectangular and inline | Premium (locked upsell otherwise) | 15 Home, 16 Lock | QuranWallWidget.swift:944-971, 97-113 |
| Logo companion widget | Lock Screen box showing the ayah reference | Premium | 16 | QuranWallWidget.swift:975-995 |
| Auto-rotate ayahs | Widget shows a new random ayah daily, every 8 hours or hourly; off by default | Premium | 15 | SettingsView.swift:28-29,584-601; Models.swift:334-373,413-575 |
| Verse picker, 3 tabs | Write, Explore (surah then ayah), Search | In app | 15 | VerseSelectionComponents.swift:60-62,260-300 |
| 11 editions | Arabic Uthmani plus 10 translations, one at a time | In app | 15 | BibleModels.swift:10-21 |
| Read-along recitation | Speaker icon or "Listen in Arabic"; word-synced, speed, repeat | Not gated in code | 15 | Recitation.swift:322-325; VerseReviewView.swift:70; ContentView.swift:2116 |
| 10 app languages | English, Arabic, French, German, Turkish, Indonesian, Malay, Urdu, Bengali, Persian | In app | 15 | LocalizationManager.swift:30-40 |
| Themes | Indigo or Gold app theme | In app | 15 | SettingsView.swift:390-404 |
| Daily reminder notifications | Local nudges, opt-in | In app | 15 | NotificationManager.swift:68-125 |
| Gift countdown Live Activity | 24h Lock Screen offer for people who left the paywall | Offer only | 16.2 | GiftOffer.swift:14-17,52-64 |
| What's New, feedback, support | Sheets, star card, WhatsApp/email support | In app | 15 | WhatsNewView.swift:29-46; SupportSheet.swift:25 |
| Promo code redeem | Enter a code in onboarding, support sheet or Settings | In app | 15 | PromoCode.swift:1-80; SettingsView.swift:1312-1330 |

Not features (do not list): themed verse packs, personal duas, dhikr or tasbih counter or widget, Focus-mode install, favourites, pins, history, iPad or Mac app, iCloud sync, accounts.
