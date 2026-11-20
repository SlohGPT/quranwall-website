# Widget

## What exists
The widget extension has three items. QuranWallWidget.swift:1045-1058.
1. Ayah widget ("QuranWall Ayah"): Home Screen small and medium; Lock Screen rectangular and inline on iOS 16+. QuranWallWidget.swift:944-971.
2. Logo widget: a Lock Screen rectangle showing the ayah reference, meant to sit beside the ayah widget. iOS 16+; on iOS 15 it registers no families. :975-995.
3. A Live Activity for the gift offer (iOS 16.1+; Settings checks 16.2).

Large and circular layouts exist in code but are not registered, so users cannot add them. :478-495, 944-971.

All widgets are static. No interactive buttons, no configuration intents, no StandBy-specific code.

There is no dhikr, tasbih or counter widget anywhere in the code.

## What it shows
One text plus a reference, from the one saved edition. Never Arabic and a translation together. Models.swift:342-347.

## Rotation
- Off by default (`widgetRotationEnabled` false). SettingsView.swift:28-29.
- Turned on with the Settings toggle "Auto-rotate ayahs" or the widget onboarding question "Want a fresh verse?" (Yes, keep it fresh / No thanks, keep my verse). WidgetOnboardingView.swift:455-470,585-592.
- Intervals: every day (the default), every 8 hours, every hour. Models.swift:334-373.
- The app builds a queue of about 90 random ayahs from the chosen edition, 20 to 240 characters long. Fallback edition is Saheeh International. Models.swift:413-436,521-575.
- The widget builds up to 24 timeline entries at exact period boundaries. With rotation off it refreshes about every 6 hours with the same content. QuranWallWidget.swift:217-286. iOS decides when widgets actually reload, so timing is not guaranteed to the minute.
- While rotation is on, changing or deleting the saved ayah is blocked with an alert that points to Settings. ContentView.swift:409-413,1388,1563.
- Rotation never touches the wallpaper image.

## Premium
Widget content and rotation are premium. A free user's widget shows a locked upsell, and the Settings toggle opens the paywall. QuranWallWidget.swift:97-113,258-262; SettingsView.swift:584-612. Because a new install cannot pass the paywall, in practice every active user is premium.

## iOS versions
- iOS 15: Home Screen small and medium only. No Lock Screen widget, no logo widget, no Live Activity.
- iOS 16+: adds Lock Screen rectangular and inline, the logo widget.
- iOS 17: only a different background API.
Widget onboarding defaults to Lock Screen instructions with no version check. WidgetOnboardingView.swift:142-146.

## Small facts
- The in-app guide tells people to add "QuranWall Verse", but the widget is listed as "QuranWall Ayah". WidgetOnboardingView.swift:953 vs QuranWallWidget.swift:967.
