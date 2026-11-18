import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BlogRenderer, { Callout } from './BlogRenderer';
import SpotScene from './visuals';
import AuthorBio from './AuthorBio';
import { CLUSTER_HEADING, CLUSTER_LABEL, clusterHref, topicNeighbours } from '../lib/clusters';
import { tocEntries } from '../lib/headings';
import { GENERIC_CARD, HERO_SIZES, HERO_WIDTHS } from '../lib/covers';
import Breadcrumbs from './Breadcrumbs';
import ResponsiveImage from './ResponsiveImage';
import TableOfContents from './TableOfContents';
import ReadingProgress from './ReadingProgress';
import type { BlogPost, BlogPostListing } from '../types/blog';

interface Props {
  post: BlogPost;
  slug: string;
  related: BlogPostListing[];
}

/** Posts of this many minutes or more get the reading-progress bar. */
const PROGRESS_MIN_MINUTES = 8;

/** "9 min read" -> 9 (0 when the text has no number). */
const minutesOf = (readTime: string): number => Number.parseInt(readTime, 10) || 0;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default function BlogPostContent({ post, slug, related }: Props) {
  const { meta, sections } = post;
  const toc = tocEntries(sections);
  const showToc = toc.length >= 3;
  // Answer first: when the post opens with its Quick Answer callout it goes right under the byline, above the cover.
  const lead = sections[0]?.type === 'callout' ? sections[0] : null;
  const hasHero = Boolean(meta.image) && meta.image !== GENERIC_CARD;
  const { prev, next } = topicNeighbours(slug);
  const topicHref = clusterHref(meta.cluster);
  const updated =
    meta.dateModified && meta.dateModified.slice(0, 10) !== meta.datePublished.slice(0, 10) ? meta.dateModified : null;

  return (
    <article
      id="post-article"
      className="container-main !overflow-x-clip !overflow-y-visible pt-[84px] md:pt-[104px] pb-20"
    >
      {minutesOf(meta.readTime) >= PROGRESS_MIN_MINUTES && <ReadingProgress targetId="post-article" />}

      {/* Desktop (1180 px and up, posts with a contents list): the header and the cover run across both columns, then the
          text column and the "On this page" rail start on the same line (2026-11-18). */}
      <div
        className={`mx-auto ${showToc ? 'min-[1180px]:grid min-[1180px]:grid-cols-[37.5rem_240px] min-[1180px]:justify-center min-[1180px]:gap-x-20' : ''}`}
      >
        <div className={`mx-auto w-full min-w-0 max-w-[37.5rem] ${showToc ? 'min-[1180px]:col-span-2 min-[1180px]:max-w-none' : ''}`}>
          <Breadcrumbs
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Blog', to: '/blog' },
              { label: CLUSTER_LABEL[meta.cluster], to: topicHref },
              { label: meta.title, truncate: true },
            ]}
          />

          <header className="mt-2 md:mt-3 min-[1180px]:max-w-[880px]">
            <Link
              to={topicHref}
              className="inline-flex min-h-[28px] items-center rounded-full border border-brand/25 bg-brand/10 px-3 text-[13px] font-semibold text-brand hover:bg-brand/15"
            >
              {CLUSTER_LABEL[meta.cluster]}
            </Link>
            <h1 className="mt-2 mb-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.01em] text-white [text-wrap:balance] md:text-[36px] md:leading-[1.15] min-[1180px]:text-[44px] min-[1180px]:leading-[1.12]">
              {meta.title}
            </h1>
            <p className="mb-2 text-[20px] leading-[1.4] md:mb-4 text-white/85 line-clamp-3 md:text-[21px] min-[1180px]:text-[22px] min-[1180px]:line-clamp-2">
              {meta.description}
            </p>
            <p className="text-[14px] leading-[1.4] text-white/65 md:text-[15px] md:leading-relaxed">
              By{' '}
              <Link to="/about/karol-billik" className="underline underline-offset-2 hover:text-white">
                Karol Billik
              </Link>
              {' · '}
              <time dateTime={meta.datePublished}>Published {meta.date}</time>
              {updated && (
                <>
                  {' · '}
                  <time dateTime={updated}>Updated {formatDate(updated)}</time>
                </>
              )}
              {' · '}
              {meta.readTime}
            </p>
          </header>

          {lead && <Callout section={lead} className="mt-5 min-[1180px]:max-w-[37.5rem]" />}

          {hasHero && (
            <figure className={`mt-4 md:-mx-[60px] lg:-mx-[84px] ${showToc ? 'min-[1180px]:mx-0' : ''}`}>
              <div className="overflow-hidden rounded-2xl">
                <ResponsiveImage
                  src={meta.image}
                  alt={meta.title}
                  sizes={HERO_SIZES}
                  widths={HERO_WIDTHS}
                  className="aspect-[3/2] w-full object-cover md:aspect-[16/9]"
                  priority
                />
              </div>
              {meta.imageAttribution && (
                <figcaption className="mt-1.5 text-right text-[14px] leading-snug text-white/65">
                  Photo by{' '}
                  <a
                    href={meta.imageAttribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    {meta.imageAttribution.photographer}
                  </a>{' '}
                  on{' '}
                  <a
                    href={meta.imageAttribution.unsplashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    Unsplash
                  </a>
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[37.5rem]">
          {showToc && <TableOfContents entries={toc} variant="details" />}

          <div className="mt-3 md:mt-4">
            <BlogRenderer sections={sections} skipLead={Boolean(lead)} scene={<SpotScene slug={slug} cluster={meta.cluster} />} />
          </div>

          <AuthorBio />

          <nav aria-label="Topic" className="mt-10">
            <p className="text-[16px] text-white/80">
              Part of{' '}
              <Link to={topicHref} className="text-brand underline underline-offset-2 hover:text-brand-light">
                {CLUSTER_HEADING[meta.cluster]}
              </Link>
            </p>
          </nav>

          {(prev || next) && (
            <nav aria-label="Previous and next in this topic" className="mt-4 flex flex-col gap-2">
              {prev && (
                <Link
                  to={`/blog/${prev.slug}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2 text-[16px] leading-snug text-white hover:border-brand/40"
                >
                  <span className="shrink-0 text-[14px] text-white/65">Previous</span>
                  {prev.title}
                </Link>
              )}
              {next && (
                <Link
                  to={`/blog/${next.slug}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2 text-[16px] leading-snug text-white hover:border-brand/40"
                >
                  <span className="shrink-0 text-[14px] text-white/65">Next</span>
                  {next.title}
                </Link>
              )}
            </nav>
          )}
        </div>

        {showToc && <TableOfContents entries={toc} variant="rail" />}
      </div>

      {related.length > 0 && (
        <nav aria-labelledby="related-guides" className="max-w-6xl mx-auto mt-16 md:mt-20">
          <h2 id="related-guides" className="mb-6 text-2xl font-black text-white md:text-3xl">
            Keep reading
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
            {related.map((p) => (
              <li
                key={p.slug}
                className="relative flex gap-3 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-3 transition-colors hover:border-brand/40 md:block md:p-0"
              >
                <div className="w-[112px] shrink-0 overflow-hidden rounded-xl bg-surface-elevated md:w-full md:rounded-none">
                  <ResponsiveImage
                    src={p.thumbnail}
                    alt=""
                    sizes="(min-width: 768px) 33vw, 112px"
                    widths={[240, 480, 640]}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                </div>
                <div className="min-w-0 md:p-5">
                  <p className="mb-1 text-[13px] font-semibold tracking-wide text-brand">
                    {CLUSTER_LABEL[p.cluster] || p.cluster}
                  </p>
                  <h3 className="text-[17px] font-bold leading-[1.3] text-white line-clamp-3 md:text-[20px]">
                    <Link
                      to={`/blog/${p.slug}`}
                      className="transition-colors hover:text-brand after:absolute after:inset-0 after:content-['']"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[13px] text-white/65">{p.readTime}</p>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mx-auto mt-10 max-w-[37.5rem] min-[1180px]:max-w-6xl">
        <Link
          to="/blog"
          className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all posts
        </Link>
      </div>
    </article>
  );
}
