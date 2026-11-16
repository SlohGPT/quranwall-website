// Single FAQ source. The visible FAQ (components/FAQ.tsx, components/TestimonialsAndFAQ.tsx)
// and every FAQPage JSON-LD (pages/Home.tsx, pages/Support.tsx) are generated from this array,
// so they can never drift. Facts follow the live App Store listing: no price, no plan names,
// nothing about what the free download includes.
export const faqs = [
  {
    question: 'What is QuranWall?',
    answer: "QuranWall is an iPhone app that puts an ayah of the Quran on your Lock Screen wallpaper and Home Screen widget, with the Arabic beside a translation. It needs iOS 15.0 or later.",
  },
  {
    question: 'How does QuranWall work?',
    answer: "Pick a translation (10 languages), a preset background or your own photo, and your font and colours. QuranWall then shows the ayah, Uthmani Arabic beside the translation, on your Lock Screen wallpaper and Home Screen widget. All 114 surahs are searchable.",
  },
  {
    question: 'Is QuranWall free?',
    answer: "The download is free, with an in-app subscription. The App Store shows the price and billing period before you subscribe.",
  },
  {
    question: 'Which iPhones does QuranWall work on?',
    answer: "QuranWall works on iPhones running iOS 15.0 or later.",
  },
  {
    question: 'Does QuranWall show ads or need internet?',
    answer: "QuranWall shows no ads and works offline.",
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
