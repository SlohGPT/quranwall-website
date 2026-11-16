import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import SocialProof from '../components/SocialProof';
import Features from '../components/Features';
import HowItWorksAndPreview from '../components/HowItWorksAndPreview';
import TestimonialsAndFAQ from '../components/TestimonialsAndFAQ';
import FinalCTA from '../components/FinalCTA';
import Pricing from '../components/Pricing';
import ExploreMore from '../components/ExploreMore';
import { faqPageSchema } from '../data/faqs';
import Footer from '../components/Footer';
import facts from '../data/facts.json';

const HOME_TITLE = 'QuranWall: Daily Quran Verses on Your iPhone Lock Screen';
const HOME_DESC =
  'Put an ayah of the Quran on your iPhone Lock Screen and Home Screen widget, Arabic beside a translation in 10 languages. Free to download, with an in-app subscription.';


// HowTo schema targets "how to put Quran on iPhone lock screen" style queries,
// which is exactly what AI answer engines extract step lists for.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to put a Quran ayah on your iPhone Lock Screen',
  description:
    'Set up QuranWall to show an ayah of the Quran on your iPhone Lock Screen wallpaper and Home Screen widget.',
  tool: [{ '@type': 'HowToTool', name: `iPhone running ${facts.minIOSText}` }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Download QuranWall',
      text: 'Download QuranWall from the App Store. The download is free, with an in-app subscription.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose your translation and look',
      text: 'Pick a translation (10 languages are available), a preset background or your own photo, and your font and colours.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'See the ayah on your Lock Screen',
      text: 'QuranWall shows the ayah, Uthmani Arabic beside the translation, on your Lock Screen wallpaper and Home Screen widget.',
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
    'QuranWall is an iPhone app that puts an ayah of the Quran on the Lock Screen wallpaper and Home Screen widget, with the Arabic beside a translation in 10 languages.',
  url: facts.storeUrl,
  installUrl: facts.storeUrl,
  downloadUrl: facts.storeUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: facts.installLine,
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
                <meta property="og:image:alt" content="QuranWall: Daily Quran Verses on Your iPhone Lock Screen" />
                <meta name="twitter:title" content={HOME_TITLE} />
                <meta name="twitter:description" content={HOME_DESC} />
                <meta name="twitter:image" content="https://quranwall.com/og-image.png" />
                <meta name="twitter:image:alt" content="QuranWall: Daily Quran Verses on Your iPhone Lock Screen" />
                <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(faqPageSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
            </Helmet>
            <Navigation />
            <Hero />
            <SocialProof />
            <Features />
            <HowItWorksAndPreview />
            <TestimonialsAndFAQ />
            <ExploreMore />
            <FinalCTA />
            <Pricing />
            <Footer />
        </div>
    );
}
