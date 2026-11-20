# Content and translations

## Editions
Eleven pickable editions, all bundled as SQLite files, each with 114 surahs and 6,236 ayahs (checked by counting rows). Nothing downloads. BibleModels.swift:10-21,50-58.
- Arabic (Uthmani)
- English: Saheeh International; Mustafa Khattab, The Clear Quran
- French (Hamidullah), German (Bubenheim and Elyas), Turkish (Diyanet), Indonesian (Kemenag), Malay (Basmeih), Urdu (Jalandhry), Bengali (Muhiuddin Khan), Persian (Makarem Shirazi)

A twelfth file, `QuranTransliteration.db`, is not an edition. It feeds the optional romanized line. BibleDatabaseService.swift:567-604.

Provenance: the code comments name Tanzil for the Arabic text, and the Khattab and transliteration files were built from the fawazahmed0 API. For the other nine, no source, publisher or licence is recorded in the repo. BibleModels.swift:6-11; tools/build_quran_db.py:19-45. No in-app credit screen was found. See open-questions.md.

## One edition at a time
The user picks one edition. Switching rewrites the saved ayah into the new edition and rebuilds the rotation queue. BibleLanguageManager.swift:12-35,300-345; Models.swift:560-571. The app's 10 UI languages each preselect a matching edition. LocalizationManager.swift:110-134.

## Finding an ayah
"Choose Your Ayah" has three tabs. VerseSelectionComponents.swift:60-62,260-300,560-610,1004-1048.
- Write: type any text and a reference.
- Explore: surah list, then ayah list, tap one to select. Single ayah only, no ranges.
- Search: a reference like "Al-Baqarah 255", a surah-name prefix, or a keyword (plain substring search of the selected edition, 50 results). It searches only the selected edition. Arabic keyword search with diacritics was not tested.

Surah names are in Arabic for Arabic, Urdu and Persian editions and in Latin transliteration for the others. BibleBookNames.swift:13-52.

## Read-along recitation
- Exists. Tap the speaker icon on the saved ayah, or "Listen in Arabic" in the ayah review sheet. Recitation.swift:1-50,325-392; VerseReviewView.swift:70; ContentView.swift:2111-2124.
- Reciter: Mishary Alafasy. Arabic words highlight in sync; a romanized transcript shows for non-Arabic editions. Speeds: Slow, 0.75x, Normal. Repeat toggle. Recitation.swift:206-262,340-460.
- Data comes from the Quran.com API and its audio CDN, per ayah, then is cached on the device. The first play of each ayah needs internet. Recitation.swift:39-66,225-270.
- Per ayah only; no full-surah player.
- Not gated by premium in its own code ("shown to everyone"). Recitation.swift:322-325.
- Code comments that say "everyayah" are stale.

## What does not exist
Themed packs (Anxiety, Patience, Gratitude, Mercy), a dua library, dhikr or tasbih, favourites, bookmarks, history. "Anxiety and worry" is only an onboarding quiz answer that changes paywall copy. OnboardingEnhanced.swift:3138; HardPaywallView.swift:28-30. The Write tab lets a user type their own text, which is the closest thing to a personal dua.

## Bible-named leftovers
The app began as a copy of FaithWall. Files named Bible* mostly run on Quran data (BibleDatabaseService, BibleModels, BibleBookNames, BibleLanguageManager, BibleLanguageSelectionView). BibleMenuView, BibleExplorerView, BibleSearchView, BibleAPIService and the first-launch Bible setup are compiled but unreachable. BibleVersionSelectionView.swift is not in the build. Users can request a new edition through a form. RequestBibleTranslationView.swift:1-10.

The edition picker footer says versions are about 4-5 MB each and downloaded; in fact they are 0.8-2.5 MB each and bundled. BibleLanguageSelectionView.swift:101-104.
