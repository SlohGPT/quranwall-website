import { Link } from 'react-router-dom';
import type { BlogPostListing } from '../types/blog';
import { CLUSTER_LABEL } from '../lib/clusters';
import ResponsiveImage from './ResponsiveImage';

interface Props {
  post: BlogPostListing;
  /** Above the fold: load the cover eagerly. */
  eager?: boolean;
  /** The single LCP candidate on the page: eager plus fetchpriority high. */
  priority?: boolean;
}

/**
 * One <a> for the whole card. Phones: a compact row (112 px cover, label, title, meta, no excerpt).
 * 768 px and up: a vertical card with a 3:2 cover and the excerpt.
 */
export default function BlogCard({ post, eager = false, priority = false }: Props) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-row items-start gap-4 md:flex-col md:gap-0 rounded-2xl overflow-hidden bg-surface-card border border-surface-border p-2.5 md:p-0 hover:border-brand/40 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="w-28 shrink-0 aspect-[3/2] overflow-hidden rounded-lg md:rounded-none md:w-full bg-surface-elevated">
        <ResponsiveImage
          src={post.thumbnail}
          alt={post.title}
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 112px"
          widths={[240, 480, 640, 800]}
          loading={eager ? 'eager' : 'lazy'}
          priority={priority}
          className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="min-w-0 flex-1 md:p-5">
        <p className="text-[13px] font-semibold tracking-wide text-brand mb-1 md:mb-2">
          {CLUSTER_LABEL[post.cluster] || post.cluster}
        </p>
        <h3 className="text-[17px] md:text-xl font-bold text-white leading-snug group-hover:text-brand transition-colors line-clamp-3 md:line-clamp-2">
          {post.title}
        </h3>
        <p className="max-md:hidden mt-2 text-[15px] text-white/70 leading-relaxed line-clamp-2">
          {post.description}
        </p>
        <p className="mt-2 md:mt-4 text-[13px] text-white/65">
          {post.readTime} &middot; {post.date}
        </p>
      </div>
    </Link>
  );
}
