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
    label: 'Daily Verses',
    eyebrow: 'A fresh verse every day',
    title: 'Wake up to the Quran, not your notifications',
    description:
      'Every morning QuranWall places a new ayah on your iPhone lock screen, so the first thing you see is a word from Allah instead of a wall of alerts. One glance, one moment of stillness, before the day pulls you in.',
    points: [
      'A new verse surfaced automatically each day',
      'Arabic alongside a clear English translation',
      'Quietly waiting for you on the surface you already check most',
    ],
  },
  {
    id: 'verse-packs',
    label: 'Verse Packs',
    eyebrow: 'Verses for what you are carrying',
    title: 'Choose the verses that meet you where you are',
    description:
      'Pick a pack tuned to your state of heart, Anxiety, Patience, Gratitude, or Mercy, or browse the Quran by book and build your own rotation. Switch anytime your season changes.',
    points: [
      'Themed packs: Anxiety, Patience, Gratitude, Mercy and more',
      'Browse and select verses by surah',
      'Change your pack whenever your heart needs something different',
    ],
  },
  {
    id: 'widgets',
    label: 'Lock-Screen Widgets',
    eyebrow: 'Built for iOS, set up in 60 seconds',
    title: 'Native lock-screen widgets and Focus modes',
    description:
      'QuranWall uses Apple’s own lock-screen widgets and Focus modes, no jailbreak, no shortcuts hacking, no workarounds. If you can set a wallpaper, you can set this up in about a minute.',
    points: [
      'A real iOS lock-screen widget, not a screenshot',
      'Pairs with Focus modes to match your day',
      'About a 60-second setup on iOS 16 or later',
    ],
  },
  {
    id: 'duas',
    label: 'Your Own Duas',
    eyebrow: 'Make it yours',
    title: 'Add the duas and reflections that matter to you',
    description:
      'Beyond the Quran, keep your own duas, reminders, and reflections one glance away. The words you want to live by, on the screen you see a hundred times a day.',
    points: [
      'Save personal duas and reflections',
      'Gentle reminders that resurface through the day',
      'Yours alone, never shared',
    ],
  },
  {
    id: 'privacy',
    label: 'Private by Design',
    eyebrow: 'Private by design',
    title: 'No account. No tracking. No noise.',
    description:
      'Your faith is not a data point. QuranWall needs no sign-up, shows no ads, and keeps your verse selections on your device. If you upgrade, Apple and RevenueCat handle billing, so we never see your card.',
    points: [
      'No account or sign-up required',
      'Your selections stay on your device',
      'No ads, no tracking, no selling your data',
    ],
  },
];
