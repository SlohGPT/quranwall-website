# Keyword research run, 2026-11-23 (QuranWall)

The second run of the keyword engine, and the first with any Search Console data. Google backfilled the property only from mid-November, so the pull holds a few days of site totals and pages and no query rows (Google hides rare queries). The engine called it insufficient data, which says nothing about demand. Autocomplete ran from the config seeds within the daily allowance: seven seeds were fetched fresh and the rest came from the cache.

## What the data says

- **Search Console:** too early to read. Only the home page and two posts show up, and no query is visible. No cluster is ranked on it.
- **Dhikr apps:** "best dhikr app" returned zikr, counter and dua-and-dhikr forms. A web check showed each has its own results (few shared with "best dhikr app for iphone"), but QuranWall has no counter. So the existing roundup covers the family honestly, and no dhikr page is added. New cluster: `best-dhikr-app` (queue p24).
- **Morning routine:** "muslim morning routine" returned a full family: checklist, Islamic morning routine and Muslim daily routine. The checklist results are editorial sites, while the iPhone phrasing is App Store listings. The existing post gets a checklist section instead of a new URL. New cluster: `muslim-morning-routine` (queue p23).
- **Wallpaper:** "islamic wallpaper iphone" returned a wallpaper-image family (4k, aesthetic, hd and device models). The same wallpaper app leads both the Islamic and the Quran results, so one wallpaper post owns both. It joins `quran-wallpaper-iphone`, and p16 is now eligible.
- **Widgets:** "ayah of the day widget" returned only itself, and its results are WordPress plugin pages plus one app. A sentence on the product post answers it (queue p22). The dua widget seed returned general "how to add widgets on iPhone" questions. QuranWall has no dua library, so that stays out.
- **No suggestions:** "quran reading plan app" and "quran focus mode" returned nothing. That is not proof of no demand, but neither post earns more work from this run.

## What was decided

- **Clusters added:** `best-dhikr-app` and `muslim-morning-routine`, both depth passes on the posts that already own them.
- **Clusters updated:**
  - The widget cluster gains the ayah-of-the-day and not-updating phrasings, with forum evidence.
  - The wallpaper and transliteration clusters leave hold, because p16 and p19 are eligible from today.
- **Still held:** mood pages and tool pages (until Karol names a licence-clear translation and a reviewer), the dhikr widget (the app has none) and the Turkish and Indonesian families (p18 is gated until 2026-12-15).
- **Seeds for a later config change (not edited here):** "ramadan wallpaper iphone" and "quran widget not updating", to test demand for p17 and p22.

## Engine notes

- `gsc` reused last week's empty pull at first. It was re-run with `--fresh` against the new data, and the result was still insufficient.
- `geo-probe`: every AI search bot is allowed, the live robots.txt matches the repo, and llms.txt answers.
