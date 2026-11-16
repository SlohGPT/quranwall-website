# Keyword research run, 2026-11-16 (QuranWall)

The first run of the keyword engine on this site. Search Console had no data to read yet: the property was verified on 2026-11-16 and Google is still filling it in, so the pull came back as insufficient data and says nothing about demand. The first useful pull is the 2026-11-23 refresh. Autocomplete answered normally for the whole day's allowance (11 US seeds, 2 Turkish, 2 Indonesian) with no error or block. Seven US seeds wait for the next run: dua widget, ayah of the day widget, best dhikr app, quran reading plan app, muslim morning routine, islamic wallpaper iphone and quran focus mode. The curated result is `src/data/keyword-clusters.json`.

## What the data says

- **The install intent is real and phrased the way the product works.** Every lock screen and widget seed returned app, widget, daily verse and quotes phrasings, plus two how-to phrasings that match the title of the product post. The product post owns that whole family.
- **Wallpaper is a separate family from the widget.** It shows aesthetic, ayat and quotes phrasings. The wider Islamic lock screen and single-verse (Ayatul Kursi) phrasings are almost all people looking for images to download, which is not what the app does. They are recorded and monitored, not turned into gallery pages.
- **Best-app phrasings split two ways.** "Best Quran app" and "best Muslim app" both appear. The Muslim app side leans on prayer times and athan apps, which QuranWall does not do, so the roundup has to stay honest about that. Free forms are recorded as demand only.
- **Mood demand is wide.** Anxiety, with depression, recovery, Arabic and Urdu forms. A mood page needs quoted ayat and a meanings reviewer, so none is added (see the hold below).
- **The dhikr widget seed gave nothing of its own.** Autocomplete returned only unrelated countdown widget questions. Product fit for a dhikr widget is also unconfirmed, so the hold stays.
- **Turkey and Indonesia show the same shapes** (lock screen, widget, aesthetic wallpaper). They are signals for the p18 Turkish go or no-go, never content.

## What was decided

- **No new URL and no page change from this run.** Held items stay held: p5 (social proof) until 2026-11-23, p16 (wallpaper post) until 2026-12-07, p18 (Turkish pilot) until 2026-12-15.
- **No tool page and no mood page** until Karol names a licence-clear translation and a reviewer for meanings (TODO-KAROL.md).
- **App-shaped daily verse phrasings** go to the App Store keyword work.
- **Clusters recorded:** the lock screen app, the how-to, the widget, the wallpaper family (held for p16), Islamic lock screen wallpaper, Ayatul Kursi wallpaper, the daily verse app, best Quran app, best Muslim app, Quran verses for anxiety (held), the dhikr widget (held), and the Turkish and Indonesian signals.
- **Not yet clustered:** the dhikr, dua, morning routine, reading plan and focus mode posts. Their seeds wait for tomorrow's allowance, and a cluster needs evidence first.
- **Out of scope:** Android, laptop and iPad phrasings, dating and friends apps, and anything for features the app does not have.

## Engine notes

- The Search Console key is the shared service account that `scripts/gsc-dump.mjs` already uses; the engine finds it at its default location and the property answers.
- No Search Console data exists yet, so the intent labels and decisions in the map come from the keyword bank, the live pages and autocomplete, not from observed queries.
