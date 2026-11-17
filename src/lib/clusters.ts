import postsRegistry from '../data/blogPosts.json';
import type { BlogCluster, BlogPostListing } from '../types/blog';

/**
 * Topic clusters in their fixed display order. Kept apart from posts.ts on purpose: posts.ts eagerly imports every
 * post body, and the footer (on every page) must only pull in the small listing registry.
 */
export const CLUSTER_ORDER: BlogCluster[] = [
  'daily-quran-lock-screen',
  'dua-and-dhikr-iphone',
  'muslim-productivity-iphone',
  'quran-study-tools-ios',
  'muslim-app-comparisons',
];

/** Short label (cards, "More <label> guides" link). */
export const CLUSTER_LABEL: Record<BlogCluster, string> = {
  'daily-quran-lock-screen': 'Daily Quran',
  'dua-and-dhikr-iphone': 'Prayer Life',
  'muslim-productivity-iphone': 'Productivity',
  'quran-study-tools-ios': 'Quran Study',
  'muslim-app-comparisons': 'App Comparisons',
};

/** Section heading (H2 on /blog, column heading in the footer). */
export const CLUSTER_HEADING: Record<BlogCluster, string> = {
  'daily-quran-lock-screen': 'Daily Quran on your Lock Screen',
  'dua-and-dhikr-iphone': 'Dhikr and dua on iPhone',
  'muslim-productivity-iphone': 'Muslim routines on iPhone',
  'quran-study-tools-ios': 'Quran study on iPhone',
  'muslim-app-comparisons': 'Muslim app comparisons',
};

const published: BlogPostListing[] = (postsRegistry as BlogPostListing[]).filter((p) => p.isPublished !== false);

/** Anchor target on /blog for a cluster. */
export const clusterHref = (cluster: BlogCluster): string => `/blog#${cluster}`;

/** Published posts grouped by cluster: fixed cluster order, blogPosts.json order within a cluster, empty clusters dropped. */
export function listingsByCluster(): { cluster: BlogCluster; posts: BlogPostListing[] }[] {
  return CLUSTER_ORDER.map((cluster) => ({ cluster, posts: published.filter((p) => p.cluster === cluster) })).filter(
    (g) => g.posts.length > 0,
  );
}

/** Every published post in cluster order (the list getRelated walks). */
export function orderedListings(): BlogPostListing[] {
  return listingsByCluster().flatMap((g) => g.posts);
}
