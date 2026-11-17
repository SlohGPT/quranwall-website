import BlogCard from './BlogCard';
import type { BlogPostListing } from '../types/blog';

/** The first this-many cards on a page load their cover eagerly; the very first one is the LCP candidate. */
const EAGER_CARDS = 3;

/** `offset` = how many cards precede this list on the page (so the eager budget is page-wide, not per section). */
export default function BlogListing({ posts, offset = 0 }: { posts: BlogPostListing[]; offset?: number }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-white/65">
        <p className="text-lg">New posts coming soon.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
      {posts.map((post, i) => (
        <BlogCard key={post.slug} post={post} eager={offset + i < EAGER_CARDS} priority={offset + i === 0} />
      ))}
    </div>
  );
}
