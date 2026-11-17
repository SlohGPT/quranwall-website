import { Helmet } from 'react-helmet-async';
import Reveal from '../components/ui/Reveal';
import { Sparkles, BookOpen, Smartphone, Heart, ShieldCheck, Check, type LucideIcon } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import FinalCTA from '../components/FinalCTA';
import { featureNav } from '../data/featureNav';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';
import AppStoreButton from '../components/AppStoreButton';
import Breadcrumbs from '../components/Breadcrumbs';
import { breadcrumbSchema } from '../lib/breadcrumbs';

const URL = 'https://quranwall.com/features';
const TITLE = 'Features | QuranWall';
const DESC =
  'Everything QuranWall does: the ayah you choose as your iPhone Lock Screen wallpaper, a Home Screen and Lock Screen widget, Arabic or a translation in 10 languages, your own background, font and colours, and no ads.';

const APP_STORE = appStoreUrl(CAMPAIGNS.features);

// Icon per feature id (kept here so the shared data file stays free of JSX).
const ICONS: Record<string, LucideIcon> = {
  'daily-verses': Sparkles,
  translations: BookOpen,
  widgets: Smartphone,
  customise: Heart,
  'no-ads': ShieldCheck,
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'QuranWall features',
  itemListElement: featureNav.map((f, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: f.label,
    description: f.description,
    url: `${URL}#${f.id}`,
  })),
};

const breadcrumbs = breadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
]);

export default function FeaturesPage() {
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
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>
      <Navigation />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container-main relative z-10 pt-32 md:pt-40 pb-12 md:pb-16 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Features' }]} />
            </div>
            <div className="animate-fade-up">
              <p className="text-brand font-medium mb-4 tracking-wide uppercase text-sm">Features</p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
                Your lock screen,
                <br />
                <span className="text-white/40">full of Quran</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
                QuranWall puts an ayah of the Quran on the most-seen surface of your iPhone.
                Here is everything it does, and why each piece exists.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <AppStoreButton href={APP_STORE} size="lg" />
                <a
                  href="#daily-verses"
                  className="inline-flex items-center justify-center px-7 h-12 lg:h-14 text-lg font-semibold text-white rounded-full border border-white/15 hover:bg-white/5 transition-colors"
                >
                  Explore features
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature sections */}
        <div className="container-main pb-8">
          <div className="max-w-5xl mx-auto divide-y divide-white/5">
            {featureNav.map((feature) => {
              const Icon = ICONS[feature.id] ?? Sparkles;
              return (
                <Reveal
                  as="section"
                  key={feature.id}
                  id={feature.id}
                  y={24}
                  className="scroll-mt-28 py-12 md:py-16 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10"
                >
                  <div className="flex md:block items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-brand" aria-hidden="true" />
                    </div>
                    <span className="md:hidden text-brand text-sm font-semibold uppercase tracking-widest">
                      {feature.eyebrow}
                    </span>
                  </div>

                  <div>
                    <p className="hidden md:block text-brand text-sm font-semibold uppercase tracking-widest mb-3">
                      {feature.eyebrow}
                    </p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                      {feature.title}
                    </h2>
                    <p className="mt-4 text-lg text-white/60 leading-relaxed max-w-2xl">
                      {feature.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center mt-0.5">
                            <Check size={13} className="text-brand" />
                          </span>
                          <span className="text-white/80 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
