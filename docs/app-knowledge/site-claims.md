# Site claims

Evidence paths are in the app repo. Pricing, trial and subscription wording stays off the site (founder rule), so those are not listed as "safe".

## Safe to say
- QuranWall puts one ayah on your iPhone Lock Screen. (WallpaperRenderer.swift:430-500)
- iPhone only. (project.pbxproj:927)
- Installs on iOS 15 or later; the wallpaper and Lock Screen widgets need iOS 16 or later. (project.pbxproj:827; SettingsView.swift:773; QuranWallWidget.swift:944-960)
- Eleven Quran editions: Arabic and ten translations in nine other languages. (BibleModels.swift:10-21)
- You choose one edition; each ayah shows in that edition. (BibleModels.swift; VerseSelectionComponents.swift:1405-1435)
- Quran text works offline; nothing to download. (BibleModels.swift:50-58)
- Find an ayah by writing it, browsing surahs, or searching a reference or keyword. (VerseSelectionComponents.swift:60-62)
- Optional romanized line under the verse. (SettingsView.swift:838)
- Read-along recitation per ayah by Mishary Alafasy, with word highlight, speed control and repeat. First play of each ayah needs internet. (Recitation.swift:1-66)
- App available in 10 languages including right-to-left Arabic, Urdu and Persian. (LocalizationManager.swift:30-40)
- Customise fonts (including Arabic fonts), colours, size, alignment, background. (WallpaperRenderer.swift:86-123)
- Your wallpaper changes when you update it in the app. (ContentView.swift:547-640)
- The widget can show a new random ayah daily, every 8 hours or hourly, if you turn on Auto-rotate ayahs. It is off until you turn it on. (SettingsView.swift:28-29; Models.swift:334-373)
- Setup uses the Shortcuts app, installed once. (ShortcutVerificationService.swift:36-40)
- No ads, no ad SDK, no account or sign-in, no tracking prompt. (Info.plist; see platform-and-privacy.md)
- Support is written (message, WhatsApp, email); one person runs it. (SupportSheet.swift:25)

## Never say
- "No audio recitation" (website CLAUDE.md line 21 is wrong). Recitation.swift exists.
- "No tracking", "no analytics", "no data collected", "nothing leaves your phone". Mixpanel and RevenueCat are in the app. (AppDelegate.swift:16-83)
- "Works on iOS 15" for the wallpaper, or "iOS 16 required" for installing. Both are wrong. Say it as in the safe list.
- "Your wallpaper changes automatically" or "refreshes daily". Only the widget can rotate. (Info.plist:71-74; Models.swift)
- "Arabic and translation side by side on your wallpaper". One edition per ayah. (WallpaperRenderer.swift:673-720)
- "Pin" or "favourites" or "history". None exist.
- "Themed packs", "anxiety, patience, gratitude, mercy collections", "personal duas", "dhikr" or "tasbih" widget or counter. None exist.
- "Focus mode install" or "automatic with Focus". Only an unreferenced tip mentions it. (OnboardingView.swift:8425-8460)
- "60-second setup" as a fact. It is loose in-app copy, unmeasured. Use "a few taps" or "about a minute" only if Karol agrees. (OnboardingView.swift:1262)
- "Free to use", "free tier", "try it free" about the app. New users hit a hard paywall. (OnboardingView.swift:801-902)
- "Works on iPad or Mac". (project.pbxproj:923-927)
- "Syncs across devices" or "iCloud". None. (entitlements)
- "Large widget" or "circular widget". Not registered. (QuranWallWidget.swift:944-971)
- "Works offline" without the exception: recitation, purchases and support need internet.
- A named translator or publisher credit for the nine older editions. Source not recorded in the repo.
- "Bible", "verse of the day" lists or FaithWall wording: leftovers, not features.
