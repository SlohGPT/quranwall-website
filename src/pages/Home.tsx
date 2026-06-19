import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import SocialProof from '../components/SocialProof';
import Features from '../components/Features';
import HowItWorksAndPreview from '../components/HowItWorksAndPreview';
import TestimonialsAndFAQ from '../components/TestimonialsAndFAQ';
import Newsletter from '../components/Newsletter';
import FinalCTA from '../components/FinalCTA';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const HOME_TITLE = 'QuranWall: Daily Quran Verses on Your iPhone Lock Screen';
const HOME_DESC =
  'Free iOS app that puts a fresh Quran verse on your iPhone lock screen every day with wallpapers and widgets. 60-second setup, iOS 16+, optional premium.';

// HowTo schema targets "how to put Quran on iPhone lock screen" style queries,
// which is exactly what AI answer engines extract step lists for.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to put a daily Quran verse on your iPhone lock screen',
  description:
    'Set up QuranWall to show a fresh Quran verse on your iPhone lock screen in about 60 seconds.',
  totalTime: 'PT1M',
  tool: [{ '@type': 'HowToTool', name: 'iPhone running iOS 16.0 or later' }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Download QuranWall',
      text: 'Download QuranWall free from the App Store. No account or sign-up is required.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose a verse pack',
      text: 'Open the app and pick a verse pack such as Anxiety, Patience, Gratitude, or Mercy.',
      url: 'https://quranwall.com/#how-it-works',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Install the lock screen',
      text: 'Follow the 60-second setup to install the Quran wallpaper or lock-screen widget using iOS Focus modes.',
      url: 'https://quranwall.com/#how-it-works',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is QuranWall?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QuranWall is a free iOS app that displays daily Quran verses on your iPhone lock screen using wallpapers and widgets. It requires iOS 16.0 or later.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does QuranWall work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QuranWall installs a Quran wallpaper or rotating verse widget on your iPhone lock screen using iOS Focus modes. You pick a verse pack like Anxiety, Patience, Gratitude, or Mercy, and QuranWall surfaces a fresh verse each day. Setup takes about 60 seconds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is QuranWall free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. QuranWall is free to download and includes the core daily verse and lock-screen widgets. Optional premium plans unlock unlimited verse packs and customization. The price, billing period, and any free trial are shown in the App Store at checkout, in your local currency.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which iPhones does QuranWall work on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QuranWall supports iPhones running iOS 16.0 or later. It uses iOS lock-screen widgets and Focus modes, both available on all compatible iPhone models from iPhone XS onward.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. QuranWall does not require an account and your verse selections stay on your device. Payment data, if you upgrade to a premium plan, is handled by RevenueCat, so QuranWall never sees your card details.',
      },
    },
  ],
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
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>
            <Navigation />
            <Hero />
            <SocialProof />
            <Features />
            <HowItWorksAndPreview />
            <TestimonialsAndFAQ />
            <Newsletter />
            <FinalCTA />
            <Pricing />
            <Footer />
        </div>
    );
}
