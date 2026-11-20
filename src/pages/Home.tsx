import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import SocialProof from '../components/SocialProof';
import Features from '../components/Features';
import HowItWorksAndPreview from '../components/HowItWorksAndPreview';
import TestimonialsAndFAQ from '../components/TestimonialsAndFAQ';
import FinalCTA from '../components/FinalCTA';
import ExploreMore from '../components/ExploreMore';
import { faqPageSchema } from '../data/faqs';
import Footer from '../components/Footer';
import facts from '../data/facts.json';

const HOME_TITLE = 'QuranWall: Quran Verse on Your iPhone Lock Screen';
const HOME_DESC =
  'Choose any ayah of the Quran and set it as your iPhone Lock Screen wallpaper, in Arabic or a translation in 10 languages. Add the widget to your Home Screen. No ads.';


// HowTo schema targets "how to put Quran on iPhone lock screen" style queries,
// which is exactly what AI answer engines extract step lists for.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to put a Quran ayah on your iPhone Lock Screen',
  description:
    'Choose an ayah in QuranWall and set it as your iPhone Lock Screen wallpaper, then add the widget.',
  tool: [{ '@type': 'HowToTool', name: `iPhone running ${facts.minIOSText}` }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Get QuranWall',
      text: 'Get QuranWall from the App Store. The first time, the app walks you through adding the QuranWall shortcut to Apple\'s Shortcuts app. You do this once.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose your ayah',
      text: 'Search all 114 surahs by surah, ayah or keyword, then read it in Arabic or in a translation.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Make it yours',
      text: 'Edit the text, pick a font and a colour, check the preview, then tap Make It Mine.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'It\'s on your Lock Screen',
      text: 'The Shortcuts app sets it as your Lock Screen wallpaper and brings you back to QuranWall. Change it whenever you like.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Add the widget',
      text: 'Add the QuranWall widget to your Home Screen or Lock Screen. It shows your ayah, and with auto-rotate on it brings a new one every day, every 8 hours or every hour.',
      url: 'https://quranwall.com/#how-it-works',
    },
  ],
};

// One MobileApplication node, on Home only, read from src/data/facts.json. No aggregateRating or review:
// facts.rating.show is false, and Google bars ratings copied from another site (the App Store).
const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'QuranWall',
  alternateName: [facts.storeName, 'Quran Verse Lock Screen'],
  operatingSystem: facts.minIOSText,
  applicationCategory: 'LifestyleApplication',
  description:
    'QuranWall is an iPhone app that puts an ayah of the Quran on the Lock Screen wallpaper and Home Screen widget, in Arabic or a translation in 10 languages.',
  url: facts.storeUrl,
  installUrl: facts.storeUrl,
  downloadUrl: facts.storeUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  screenshot: [1, 2, 3, 4, 5].map((n) => `https://quranwall.com/assets/slideshow/slide${n}.webp`),
  author: {
    '@type': 'Person',
    name: 'Karol Billik',
    url: 'https://quranwall.com/about/karol-billik',
  },
};

export default function Home() {
    return (
        <div className="min-h-screen">
            <Helmet>
                <title>{HOME_TITLE}</title>
                <meta name="description" content={HOME_DESC} />
                <link rel="canonical" href="https://quranwall.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://quranwall.com/" />
                <meta property="og:title" content={HOME_TITLE} />
                <meta property="og:description" content={HOME_DESC} />
                <meta property="og:image" content="https://quranwall.com/og-image.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="QuranWall: Quran Verse on Your iPhone Lock Screen" />
                <meta name="twitter:title" content={HOME_TITLE} />
                <meta name="twitter:description" content={HOME_DESC} />
                <meta name="twitter:image" content="https://quranwall.com/og-image.png" />
                <meta name="twitter:image:alt" content="QuranWall: Quran Verse on Your iPhone Lock Screen" />
                <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(faqPageSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
            </Helmet>
            <Navigation />
            <Hero />
            {/* Answer-first passage (SEO queue p11): one self-contained, quotable paragraph near the top for AI answers
                and snippets. Facts only from src/data/facts.json and the live listing; no pricing, no new feature claims. */}
            <section aria-labelledby="what-is-quranwall" className="bg-surface pt-16 sm:pt-20">
                <div className="container-main">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 id="what-is-quranwall" className="text-sm font-semibold uppercase tracking-widest text-brand">
                            What is QuranWall?
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-white/70 sm:text-xl">
                            {facts.brand} (listed on the App Store as {facts.storeName}) is an iPhone app that puts an ayah of
                            the Quran on your Lock Screen wallpaper and Home Screen widget. Search all 114 surahs by surah, ayah
                            or keyword, and read the ayah in Uthmani Arabic or a translation, 10 languages in all. It shows no
                            ads and works offline.
                        </p>
                    </div>
                </div>
            </section>
            <SocialProof />
            <Features />
            <HowItWorksAndPreview />
            <TestimonialsAndFAQ />
            <ExploreMore />
            <FinalCTA />
            <Footer />
        </div>
    );
}
