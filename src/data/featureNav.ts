// Single source of truth for QuranWall's signature features.
// Consumed by:
//   - Navigation.tsx  → the "Features" dropdown (uses id + label, links to /features#<id>)
//   - pages/FeaturesPage.tsx → the full /features page (one anchored section per entry)
// Keep the ids stable: they are the in-page anchor targets the dropdown deep-links to.

export interface AppFeature {
  /** Anchor id on the /features page, e.g. `daily-verses` → /features#daily-verses */
  id: string;
  /** Short label shown in the nav dropdown */
  label: string;
  /** Section eyebrow on the features page */
  eyebrow: string;
  /** Section heading */
  title: string;
  /** One-paragraph description */
  description: string;
  /** Concrete specifics, rendered as a checklist */
  points: string[];
}

export const featureNav: AppFeature[] = [
  {
    id: 'daily-verses',
    label: 'Your Ayah',
    eyebrow: 'An ayah on the screen you check most',
    title: 'See the Quran, not just your notifications',
    description:
      'QuranWall puts an ayah of the Quran on your iPhone Lock Screen wallpaper and Home Screen widget, so a word from the Quran is one glance away each time you pick up your phone.',
    points: [
      'An ayah on your Lock Screen wallpaper',
      'The same ayah on a Home Screen widget',
      'Uthmani Arabic or a translation',
    ],
  },
  {
    id: 'translations',
    label: 'Arabic or Translation',
    eyebrow: 'Read it in your language',
    title: 'Arabic or a translation in 10 languages',
    description:
      'Read each ayah in Uthmani Arabic or in a translation, and you can search all 114 surahs to find the ayah you want.',
    points: [
      'Arabic plus translations in 9 more languages (11 editions)',
      'All 114 surahs searchable by surah, ayah or keyword',
      'Uthmani Arabic text',
    ],
  },
  {
    id: 'widgets',
    label: 'Lock Screen and Widget',
    eyebrow: 'Made for iPhone',
    title: 'A Lock Screen wallpaper and a Home Screen widget',
    description:
      'QuranWall is an iPhone app that sets your Lock Screen wallpaper through Apple\'s Shortcuts app and adds a widget for the Home Screen and Lock Screen. It installs on iOS 15.0 or later; the wallpaper and the Lock Screen widget need iOS 16 or later.',
    points: [
      'Lock Screen wallpaper with your ayah',
      'Widget for the Home Screen and Lock Screen',
      'Browse and search all 114 surahs offline',
    ],
  },
  {
    id: 'customise',
    label: 'Make It Yours',
    eyebrow: 'Make it yours',
    title: 'Your background, your font, your colours',
    description:
      'Pick a preset background or use your own photo, then choose the font and colours that suit you, so the ayah looks the way you want it to.',
    points: [
      'A preset background or your own photo',
      'Choose your font',
      'Choose your colours',
    ],
  },
  {
    id: 'no-ads',
    label: 'No Ads',
    eyebrow: 'No noise',
    title: 'No ads, and browsing works offline',
    description:
      'QuranWall shows no ads. Browsing, search and the widget work offline.',
    points: [
      'No ads',
      'Browse and search all 114 surahs offline',
    ],
  },
];
