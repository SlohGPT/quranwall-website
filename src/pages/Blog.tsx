import { Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BlogListing from '../components/BlogListing';
import Breadcrumbs from '../components/Breadcrumbs';
import { PILLAR_SLUGS, getPillar } from '../lib/pillars';
import { CLUSTER_HEADING, CLUSTER_LABEL, listingsByCluster } from '../lib/clusters';

const groups = listingsByCluster();
// Cards that precede each section, so only the first three on the page load eagerly.
const offset = groups.map((_, i) => groups.slice(0, i).reduce((n, g) => n + g.posts.length, 0));
const CHIP =
  'inline-flex h-11 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[15px] font-semibold text-white hover:border-brand/50 hover:text-brand transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand';

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quranwall.com/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://quranwall.com/blog' },
  ],
};

export default function Blog() {
  return (
    <div className="min-h-screen bg-surface">
      <Helmet>
        <title>QuranWall Blog, iPhone Quran, Prayer, and Faith</title>
        <meta
          name="description"
          content="Practical guides on putting Quran on your iPhone lock screen, building a prayer life, and using your phone to grow in faith."
        />
        <link rel="canonical" href="https://quranwall.com/blog" />
        <meta property="og:title" content="QuranWall Blog, iPhone Quran, Prayer, and Faith" />
        <meta
          property="og:description"
          content="Practical guides on putting Quran on your iPhone lock screen, building a prayer life, and using your phone to grow in faith."
        />
        <meta property="og:url" content="https://quranwall.com/blog" />
        <meta property="og:image" content="https://quranwall.com/og-image.png" />
        <meta name="twitter:image" content="https://quranwall.com/og-image.png" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Navigation />
      {/* Not .container-main: its overflow-hidden would stop the chip row from sticking. */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 pt-[88px] md:pt-28 pb-20">
        <div className="mb-2 md:mb-8">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
        </div>
        <header id="all" className="scroll-mt-3 mb-3 md:mb-8 max-w-3xl">
          <p className="hidden md:block text-brand text-sm font-semibold uppercase tracking-widest mb-3">The QuranWall Blog</p>
          <h1 className="text-[32px] md:text-[44px] font-black text-white tracking-tight leading-[1.15] md:leading-tight">
            The Quran on your iPhone, every day.
          </h1>
          <p className="mt-2 md:mt-4 text-[15px] leading-snug md:text-lg md:leading-relaxed text-white/70 line-clamp-2 md:line-clamp-none">
            Practical guides for using your phone as a tool for spiritual growth instead of a thief of it. New posts often.
          </p>
        </header>

        <nav
          aria-label="Blog topics"
          className="relative -mx-4 sm:-mx-6 lg:-mx-12 mb-2 md:mb-10"
        >
          <ul className="flex h-12 items-center gap-2 overflow-x-auto snap-x px-4 sm:px-6 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li className="snap-start shrink-0">
              <a href="#all" className={CHIP}>
                All
              </a>
            </li>
            {groups.map(({ cluster, posts }) => (
              <li key={cluster} className="snap-start shrink-0">
                <a href={`#${cluster}`} className={CHIP}>
                  {CLUSTER_LABEL[cluster]} <span className="text-white/65">{posts.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {PILLAR_SLUGS.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-white mb-5">Explore by topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PILLAR_SLUGS.map((s) => {
                const p = getPillar(s);
                if (!p) return null;
                return (
                  <Link
                    key={s}
                    to={`/${s}`}
                    className="group p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-colors"
                  >
                    <p className="font-bold text-white group-hover:text-brand transition-colors">{p.title}</p>
                    <p className="mt-1 text-sm text-white/65 line-clamp-2">{p.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {groups.map(({ cluster, posts }, gi) => (
          <Fragment key={cluster}>
            {/* The first topic is on the fold, so it is laid out at once; only the later ones skip rendering (cv-auto). */}
            <section aria-labelledby={cluster} className={`${gi === 0 ? '' : 'cv-auto '}mb-6 md:mb-14 last:mb-0`}>
              <h2 id={cluster} className="scroll-mt-3 text-[22px] md:text-3xl font-bold text-white mb-2 md:mb-5">
                {CLUSTER_HEADING[cluster]}
              </h2>
              <BlogListing posts={posts} offset={offset[gi]} />
            </section>
          </Fragment>
        ))}
      </main>
      <Footer />
    </div>
  );
}
