// Single FAQ source. The visible FAQ (components/FAQ.tsx, components/TestimonialsAndFAQ.tsx)
// and every FAQPage JSON-LD (pages/Home.tsx, pages/Support.tsx) are generated from this array,
// so they can never drift. Facts follow the live App Store listing. No pricing on the website at all
// (Karol, 2026-11-16): no price, plan names, "free" or subscription wording; the App Store shows it.
export const faqs = [
  {
    question: 'What is QuranWall?',
    answer: "QuranWall is an iPhone app that puts an ayah of the Quran on your Lock Screen wallpaper and Home Screen widget, in Arabic or a translation. It needs iOS 15.0 or later.",
  },
  {
    question: 'How does QuranWall work?',
    answer: "Search all 114 surahs and pick an ayah, in Uthmani Arabic or in a translation (10 languages). Edit the text, choose a font and colour, then tap Make It Mine. The Shortcuts app sets it as your Lock Screen wallpaper and brings you back to QuranWall. The first time, the app walks you through adding the QuranWall shortcut to Apple's Shortcuts app. The widget shows your ayah on the Home Screen or Lock Screen. For the background, use a preset or your own photo.",
  },
  {
    question: 'Which iPhones does QuranWall work on?',
    answer: "QuranWall works on iPhones running iOS 15.0 or later.",
  },
  {
    question: 'Does QuranWall show ads or need internet?',
    answer: "QuranWall shows no ads. Browsing, search and the widget work offline.",
  },
  {
    question: 'Does the wallpaper change by itself?',
    answer: "No. Your Lock Screen keeps the ayah you chose until you pick another one in QuranWall, which takes a few taps. The widget can change on its own: turn on auto-rotate and it shows a new ayah every day, every 8 hours or every hour.",
  },
];

/** FAQPage structured data built from the same array as the visible FAQ. */
export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
