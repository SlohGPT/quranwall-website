import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LifeBuoy, BookOpen, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import { faqs } from '../data/faqs';

const URL = 'https://quranwall.com/support';
const TITLE = 'Support | QuranWall';
const DESC =
  'Need help with QuranWall? Email our team or browse answers to common questions about setup, verse packs, privacy, and billing.';

const SUPPORT_EMAIL = 'iosnotewall@gmail.com';

// Mirrors the questions rendered by the <FAQ /> component below, so the
// structured data matches the visible content.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

const helpTopics = [
  {
    icon: BookOpen,
    title: 'Setting it up',
    body: 'A step-by-step walk-through of installing the lock-screen widget and Focus mode.',
    to: '/features#widgets',
  },
  {
    icon: LifeBuoy,
    title: 'Common questions',
    body: 'Pricing, supported iPhones, how the daily verse works, and more.',
    to: '#faq',
  },
  {
    icon: ShieldCheck,
    title: 'Your privacy',
    body: 'What we store (almost nothing) and how billing is handled by Apple.',
    to: '/privacy-policy',
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-surface">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:url" content={URL} />
        <meta property="og:image" content="https://quranwall.com/og-image.png" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
        <meta name="twitter:image" content="https://quranwall.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Navigation />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container-main relative z-10 pt-32 md:pt-40 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
                Support
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
                Stuck on something, or just have a question? We read every message and we are
                genuinely happy to help. Email us directly, or check the common questions below.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white text-surface text-lg font-semibold rounded-full hover:bg-white/90 transition-colors"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Email us
                </a>
                <a
                  href="#faq"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-lg font-semibold text-white rounded-full border border-white/15 hover:bg-white/5 transition-colors"
                >
                  Read the FAQ
                </a>
              </div>
              <p className="mt-5 text-sm text-white/40">
                We usually reply within a day at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick help topics */}
        <section className="container-main pb-4">
          <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {helpTopics.map((topic) => {
              const Icon = topic.icon;
              const inner = (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">{topic.title}</h2>
                  <p className="text-white/55 text-sm leading-relaxed">{topic.body}</p>
                </>
              );
              const className =
                'block text-left rounded-3xl p-7 bg-surface-card border border-white/5 hover:border-white/15 transition-colors';
              return topic.to.startsWith('#') ? (
                <a key={topic.title} href={topic.to} className={className}>
                  {inner}
                </a>
              ) : (
                <Link key={topic.title} to={topic.to} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
