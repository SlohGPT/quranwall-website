import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import BlogRenderer from './BlogRenderer';
import AuthorBio from './AuthorBio';
import { CLUSTER_LABEL, clusterHref } from '../lib/clusters';
import Breadcrumbs from './Breadcrumbs';
import ResponsiveImage from './ResponsiveImage';
import { GENERIC_CARD, HERO_SIZES, HERO_WIDTHS } from '../lib/covers';
import type { BlogPost, BlogPostListing } from '../types/blog';

interface Props {
  post: BlogPost;
  slug: string;
  related: BlogPostListing[];
}

export default function BlogPostContent({ post, slug: _slug, related }: Props) {
  const { meta, sections } = post;

  return (
    <article className="container-main pt-28 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Blog', to: '/blog' },
              { label: meta.title },
            ]}
          />
        </div>

        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {meta.title}
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">{meta.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {meta.date}
            </span>
            {meta.dateModified && meta.dateModified.slice(0, 10) !== meta.datePublished.slice(0, 10) && (
              <span className="text-white/40">
                Updated {new Date(meta.dateModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {meta.readTime}
            </span>
            <span>By Karol Billik</span>
          </div>
        </header>

        {meta.image && meta.image !== GENERIC_CARD && (
          <figure className="mb-10 rounded-2xl overflow-hidden">
            <ResponsiveImage
              src={meta.image}
              alt={meta.title}
              sizes={HERO_SIZES}
              widths={HERO_WIDTHS}
              className="w-full aspect-[16/9] object-cover"
              priority
            />
            {meta.imageAttribution && (
              <figcaption className="mt-2 text-xs text-white/40 text-right">
                Photo by{' '}
                <a
                  href={meta.imageAttribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/70"
                >
                  {meta.imageAttribution.photographer}
                </a>{' '}
                on{' '}
                <a
                  href={meta.imageAttribution.unsplashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/70"
                >
                  Unsplash
                </a>
              </figcaption>
            )}
          </figure>
        )}

        <BlogRenderer sections={sections} />

        <AuthorBio />

        <div className="mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all posts
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <nav aria-labelledby="related-guides" className="max-w-6xl mx-auto mt-20">
          <h2 id="related-guides" className="text-2xl md:text-3xl font-black text-white mb-6">
            Keep reading
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <li
                key={p.slug}
                className="relative rounded-2xl overflow-hidden bg-surface-card border border-surface-border hover:border-brand/40 transition-colors"
              >
                <ResponsiveImage
                  src={p.thumbnail}
                  alt=""
                  sizes="(min-width: 768px) 360px, 100vw"
                  widths={[480, 640, 800]}
                  loading="lazy"
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="p-5">
                  <p className="text-xs text-brand font-semibold tracking-wide mb-2">
                    {CLUSTER_LABEL[p.cluster] || p.cluster}
                  </p>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    <Link
                      to={`/blog/${p.slug}`}
                      className="hover:text-brand transition-colors after:absolute after:inset-0 after:content-['']"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-white/60 text-sm leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              to={clusterHref(meta.cluster)}
              className="text-brand hover:text-brand-light underline underline-offset-2 font-semibold"
            >
              More {CLUSTER_LABEL[meta.cluster]} guides
            </Link>
          </p>
        </nav>
      )}
    </article>
  );
}
