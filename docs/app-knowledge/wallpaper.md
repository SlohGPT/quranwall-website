# Wallpaper

## How it is made
- The app draws the wallpaper itself: a 1290x2796 JPEG with a background, the ayah text, the reference and an optional romanized line. WallpaperRenderer.swift:430-500.
- It saves the file as `lockscreen.jpg` and also saves a copy to Photos. ContentView.swift:547-710.
- It then opens `shortcuts://run-shortcut?name=QuranWall.` The shortcut is hosted on iCloud and the user installs it once in setup. ShortcutVerificationService.swift:36-40.
- Inside the app, an App Intent called "Create QuranWall Wallpaper" returns that image to the shortcut. The shortcut passes it to the system Set Wallpaper action and then opens `quranwall://wallpaper-updated`. QuranWallWallpaperIntent.swift:20-73; SceneDelegate.swift:75-107.
- What the shortcut itself contains cannot be read from the repo.
- The old folder-based shortcut path is dead code; the app always uses the App Intent. ShortcutVerificationService.swift:49-56.
- The pipeline is Lock Screen only. The Home Screen wallpaper is no longer used. ShortcutIntegrationManager.swift:80-85,163.

## What the wallpaper shows
- One saved ayah at a time. Saving a new one replaces the old one. VerseSelectionComponents.swift:1405-1435.
- One edition per ayah: Arabic or a translation, with the reference. The user can hand-type any text in the Write tab, but the app never composes Arabic plus a translation itself. WallpaperRenderer.swift:673-720.
- Optional romanized line, off by default. SettingsView.swift:120.
- No pin, no favourites, no history.

## When it changes
The wallpaper never changes by itself. There is no background task, no timer and no notification that re-renders it. The only background mode is audio. Info.plist:71-74.

It is re-rendered and re-applied only after an action in the app:
- Update Wallpaper button (Home or Settings)
- Make It Mine and the other verse-save paths
- Editing or deleting the ayah (deleting all renders a blank wallpaper)
- Toggling completion on an ayah
- The "I use lock screen widgets" toggle
- The Auto-Fix regenerate step

All go through `updateWallpaper()`. ContentView.swift:547-640, 815-822, 853-884; SettingsView.swift:721, 2532-2537; AutoFixWorkflowView.swift:783-788.

Changing font, colour or size does not re-apply. Settings says to tap Update Wallpaper Now. SettingsView.swift:819.

When widget rotation is on, the Home screen mirrors the widget's current ayah onto the saved note. That updates the note and widget, not the wallpaper image. ContentView.swift:284-304.

## Styles and backgrounds
- 23 Latin fonts and 4 Arabic fonts (Amiri Quran, Scheherazade New, Noto Naskh Arabic, Lateef). Arabic text switches to an Arabic face. WallpaperRenderer.swift:86-123,274-279.
- Text colour presets and custom colour, highlight modes, shadow, size scale, alignment.
- Backgrounds: white, grey, own photo (Photos, camera, Files), 15 bundled Islamic images. Models.swift:57-122; IslamicWallpapers.swift:1-45.

## Setup and troubleshooting
- Wallpaper path after payment: install shortcut, choose wallpaper, pick ayah, allow permissions. OnboardingView.swift:182-248.
- In-app copy says "takes under 60 seconds" (after the shortcut install). Nothing measures it. OnboardingView.swift:1262.
- Troubleshooting offers Shortcut Setup, Wrong Wallpaper Selected, then WhatsApp or email support. TroubleshootingView.swift:354-449. Some of its text still mentions the old "Always Allow" folder step.
- Auto-Fix verifies the shortcut, regenerates, checks permissions. AutoFixWorkflowView.swift:21-27,640-700.

## iOS versions
The wallpaper path needs iOS 16 (App Intent, wallpaper picker, Islamic gallery). On iOS 15 Settings shows "Requires iOS 16 or later to save wallpapers". SettingsView.swift:743-780. The setup choice screen has no OS check, so an iOS 15 user could still pick it. OnboardingEnhanced.swift:6148-6200. Not run on a real iOS 15 device.
