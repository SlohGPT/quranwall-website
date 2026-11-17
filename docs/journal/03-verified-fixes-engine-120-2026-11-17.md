# 03 — FaithWall's verified fixes and keyword engine 1.2.0 (2026-11-17)

A new session, started by the FaithWall SEO session, worked in the worktree `.claude/worktrees/qw-fixes-engine-120-a77d2b` on branch `claude/qw-fixes-engine-120-a77d2b`. It merged to main as `eeba4a2` in one push.

## Asked
Karol gave his yes on 2026-11-17: "ship everything to the other apps as well". The FaithWall session sent QuranWall the findings that its two skeptics kept on round 3, plus engine 1.2.0. The brief said:
- re-check every finding against this repo and the iOS source, and drop any that no longer holds;
- fix the copy that says "Arabic beside a translation" or claims a new, daily or automatic ayah on the wallpaper;
- add the lint rules and self-tests;
- fix the docs and prompts;
- port engine 1.2.0 byte for byte;
- tighten the regex families;
- deploy once and ping IndexNow.

## Found (re-checked before any edit)
- **When the wallpaper changes**, read from the iOS Swift source (`STRANKY:APLIKACIE/QUORAN/QuranWall`, `--include='*.swift'`, dead code excluded). The wallpaper is set only by Apple's Shortcuts app, which the app opens on a user action. These callers are live:
  - choosing or changing the ayah (`ContentView.swift:1263`, from "Choose your ayah" at 1362);
  - editing a verse (`ContentView.swift:1679`);
  - deleting one (`ContentView.swift:853`, via the Delete alert at 1104);
  - "Update Wallpaper Now" in Settings (`SettingsView.swift:2537`, rendered at 767);
  - the "I use lock screen widgets" toggle (`SettingsView.swift:721` → 2797);
  - onboarding's Next (`OnboardingView.swift:7257`);
  - Troubleshooting after "I've Installed It" (`TroubleshootingView.swift:738`).

  All of these then go through `openShortcut()` (`ContentView.swift:815-820`).
- **Dead callers:** `runWallpaperShortcut()` (`ShortcutVerificationService.swift:71`), `runShortcutWithCallback`, the home "Update Wallpaper" button (`ContentView.swift:2006`, never instantiated), `WallpaperVerseReviewView` and `AutoFixWorkflowView`, and the Shortcuts automation card (`OnboardingView.swift:8425`). The note-completion hook (`ContentView.swift:437`) is dead too: the row stores `onToggleCompletion` (`ContentView.swift:2057`) but no control calls it, so QuranWall has no done control.
- **Nothing runs in the background.** `UIBackgroundModes` lists only audio (`Info.plist:71-73`). The 60-second timer only syncs widget rotation (`ContentView.swift:285`). The App Intent returns the image already on disk (`QuranWallWallpaperIntent.swift:36-43`, "does NOT render anything").
- **Widget rotation is off by default** (`SettingsView.swift:28-29`, `widgetRotationEnabled = false`). It turns on only after Yes and then Continue in widget onboarding (`WidgetOnboardingView.swift:586`, "Every day" preselected), or through the Premium-gated Settings toggle (`SettingsView.swift:585-587`). It runs daily, every 8 hours or hourly (`Models.swift:335-337`). While it is off, the widget shows the saved ayah (`QuranWallWidget.swift:298`).
- **The text on the wallpaper:** one edition per ayah, Uthmani Arabic or one translation (`BibleModels.swift:11-21`, `WallpaperRenderer.swift:1079`). Transliteration is optional (`WallpaperRenderer.swift:680`).
- **Correction to journal 02 and to memory:** "Update Wallpaper is dead code" holds only for the home button. The Settings "Update Wallpaper Now" button is live.
- **Every finding still held**, so none was dropped. Two notes on scope:
  - Item 6's `seo-log/` README already existed (since `0d0fb01`), so it was not created again.
  - The finding that names `quran-verse-iphone-lock-screen.json` (lines 58, 104, 159) was handed to queue item p8 (see Decided).
- **Engine B6, measured on `8666c81` with `docs/`, `src/data/`, `EULA.tsx` and the IndexNow key file in scope:** 1.1.0 flags 10 lines and 1.2.0 flags 5. The five cover-image lines stop being flagged. `EULA.tsx:132` and the key file stay flagged under both. Neither is in `check --staged`'s default scope, so they matter only if added to it. Nothing new is flagged.

## Decided
- **Copy follows the app:** "in Uthmani Arabic or a translation". The wallpaper keeps the ayah until you pick another in QuranWall, and only the widget can show a new ayah, after you turn on auto-rotate. This is the same wording as `src/data/faqs.ts:12` and `:23-24`.
- **p8 merged here.** This morning the autopilot pushed `claude/local-autopilot-20261117` (`8c150ca`), a depth pass on `quran-verse-iphone-lock-screen` that already follows the app and passes the new rules. My edit of that post conflicted with it, so I handed the file back to main's version (`5d8d7c4`). After reading its diff, I merged p8 with `--no-ff` (`558ef9f`) behind the same gates the merge bot runs. Main never shows the old lines against the new lint, and the 11:15 merge bot finds nothing left to merge.
- **The features nav label is now "Arabic or Translation"** (it was "Arabic and Translation"). `lint-facts --dist` read the old label as an Arabic-plus-translation claim on every page, and the new label matches the section's own title.
- **Legal pages get WARN, not FAIL, under the two new rules.** `EULA.tsx:69` is still wrong, but the EULA waits on Karol (TODO question 7).
- **The doctrine marks what is disputed and doesn't rewrite it.** SEO-STRATEGY.md lines 36, 63, 119 and 120 now say "DISPUTED (TODO Q7)" for audio, and for the listing's "beside a translation" and "a new ayah each day". `CLAUDE.md` is Karol's file, so a TODO-KAROL line points at its line 21 instead.

## Built (commits)
- `a7eb67d`: keyword engine 1.2.0, a byte copy of FaithWall `9702a2e` (sha256 prefix `77ac7c15b5d1`). Also adds `geo.bot_settings_hint` ("the Vercel project's Firewall and bot settings") and hand-merges the six README changes in `keyword-research/README.md`.
- `c29e20b`: the regex families. Bare "surat", "kursi", "salah" and "koran" now count only inside phrases ("surat al…", "ayat kursi", "salah times", "the koran"). "ayat" and "ayet" get the RE2 leading boundary. Tested on the cached autocomplete suggestions: none lost or gained. Probes: "surat lamaran", "kursi kantor", "salah paham", "koran kompas", "hayat" and "şikayet" no longer match, while "ayetler", "ayeti kerime", "ayatul kursi" and "surat yasin" still do. `doctor`: config OK, no `\b` warning.
- `a9f8a3e`: lint-facts changes.
  - New rule `arabic-beside-translation` (FAIL).
  - New rule `wallpaper-automatic` (FAIL). It covers a timed or automatic ayah on the wallpaper, "on its own", "nothing to change by hand" and "nothing to tap", and a daily claim on wallpaper and widget together without the opt-in. The idea comes from FaithWall's rules, not its file.
  - "Listen in Arabic" and read-along copy are now `audio-readalong` WARN.
  - Plan names: case-insensitive brand plus Pro or Plus, Go Pro, Get Pro and Version/Edition. "Pro tip" and "Pro-Quran" pass.
  - "installations" added to the download-count rule.
  - The setup-time rule now needs a setup verb, so "Just 5 minutes with QuranWall each morning" passes.
  - Count-free social proof ("loved by thousands") now fails.
  - `manifest.webmanifest` is now linted.
  - `negOpts` now matches `.claude/` against the repo-relative path. Inside a worktree, every file had been treated as a prompt.
  - Self-test grew from 103 to 192 cases.
- `e91e8e5`: content.
  - Six posts: best-dhikr-app-for-iphone, best-islamic-lock-screen-app-iphone, best-muslim-app-for-iphone-2026, how-to-set-dhikr-reminders-iphone, muslim-morning-routine-iphone and quran-reading-plan-app-iphone. The fixes cover their text, the install-card (cta) blurbs and the `blogPosts.json` excerpts, with `dateModified` set to 2026-11-17.
  - Also the web app manifest, the nav label, and the blog skill's fact lines ("Uthmani Arabic or a translation", plus a wallpaper-vs-widget line).
- `c582e3c`:
  - SEO-STRATEGY: the DISPUTED marks.
  - TODO question 7: quotes the site side from `faqs.ts` and replaces "now follow the app" with what is true today.
  - Licence item: "four more ayat (13:28, 2:152, 65:3, 2:286)". It also lists the posts' 2:152, 13:28, 17:78, 17:106 and 51:55, labelled "Sahih International" against the homepage's "Saheeh International", and adds the Mustafa Khattab edition (`QuranKhattab.db`, "The Clear Quran") to the translation-rights item.
  - The `CLAUDE.md` line-21 TODO.
- `5d8d7c4` and `558ef9f`: p8 (see Decided). `eeba4a2`: the merge to main.
- **Outside the repo:**
  - The refresh prompt's access-failure branch now writes `seo-log/` and `seo-log/README.md` ("TODO-KAROL.md, seo-log/ only"), not `docs/`.
  - The autopilot's product-fact line now says one edition per ayah, a wallpaper that changes only on in-app actions, opt-in widget rotation, and audio disputed.
  - The private cohort record's last annotation row now has live commit `1f28292`.

## Verified (on the merged tree)
- `lint-facts`: `--self-test` 192/192. `--all` 0 FAIL, 6 WARN: the four p5 social-proof strings, grandfathered until 2026-11-23, plus `EULA.tsx:69` under both new rules. `--prompts` 0 FAIL (4 files). `--dist` 0 FAIL. `--diff origin/main` 0 FAIL.
- `typecheck` passes, as at baseline. `build` prerenders 16 of 16 pages. `check-facts` OK.
- Engine: `--version` 1.2.0, `check --self-test` 108/108, `kw:check` 0 fail and 0 warn, and the sha256 equals the FaithWall blob.

## Corrections to journal 01 (append-only, so here)
- The Handover's "origin/main `0d0fb01` at close" is wrong. At close it was `8666c81`, the Handover commit itself.
- The Handover left out the keyword engine. Before today: 1.0.0 (`8eeff78`), 13 clusters in `src/data/keyword-clusters.json`, gates `kw:check` and `kw check --staged`. Since today: 1.2.0 (`a7eb67d`, sha256 prefix `77ac7c15b5d1`), self-test 108/108.
- More Handover corrections:
  - Social proof (p5) is held until 2026-11-23 for p5.
  - The install cards have no control group (the site had almost no impressions at ship time). The read is before and after by campaign token in App Store Connect, Campaigns, from about 2026-12-16.
  - The p18 Turkish gate goes only when all three conditions hold: at least 8 of 16 URLs indexed, a Turkish reviewer who knows Islamic terminology, and Karol's quote policy.
- Journal 01's Open bullet on the refresh prompt writing `docs/journal` was closed by `0d0fb01`, and its access-failure branch by today's prompt edit.
- Journal 01's "`kw check --staged`: 0 fail, 0 warn" held only for the engine's code commit. Over all of `docs/` and `src/data/`, the journals and the queue carry WARN-level metric words, and before 1.2.0 the five cover-image lines failed B6.

## Open
- **Karol:** TODO question 7 (what the wallpaper shows, audio, the EULA), the `CLAUDE.md` line 21, the licence lines, and p8's three device checks in `TODO-KAROL.md`.
- **2026-11-23:** p5 rewords the social proof, and the grandfathered strings turn into FAILs.
