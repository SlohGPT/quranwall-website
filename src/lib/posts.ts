import postsRegistry from '../data/blogPosts.json';
import pillarsData from '../data/pillars.json';
import type { BlogPost, BlogPostListing, PillarConfig, BlogCluster } from '../types/blog';
import { orderedListings } from './clusters';

const postModules = import.meta.glob<{ default: BlogPost }>('../data/posts/*.json', { eager: true });

const postsBySlug: Record<string, BlogPost> = {};
for (const [path, mod] of Object.entries(postModules)) {
  const slug = path.replace('../data/posts/', '').replace('.json', '');
  postsBySlug[slug] = (mod as { default: BlogPost }).default ?? (mod as unknown as BlogPost);
}

export const allListings: BlogPostListing[] = (postsRegistry as BlogPostListing[])
  .filter((p) => p.isPublished !== false);

export function getPost(slug: string): BlogPost | null {
  return postsBySlug[slug] ?? null;
}

export function getListing(slug: string): BlogPostListing | null {
  return allListings.find((p) => p.slug === slug) ?? null;
}

/**
 * Related guides: order every published post by cluster (fixed cluster order, registry order within a cluster) and take
 * the next `limit` posts after this one, wrapping around. Each post is then linked from exactly `limit` others, and a
 * post's same-cluster neighbours come first.
 */
export function getRelated(slug: string, limit = 3): BlogPostListing[] {
  const ordered = orderedListings();
  const at = ordered.findIndex((p) => p.slug === slug);
  if (at < 0) return [];
  const n = Math.min(limit, ordered.length - 1);
  return Array.from({ length: n }, (_, i) => ordered[(at + 1 + i) % ordered.length]);
}

export function getPillar(slug: string): PillarConfig | null {
  const data = (pillarsData as Record<string, PillarConfig>)[slug];
  return data ?? null;
}

export function getPillarFeatured(slug: string): BlogPostListing[] {
  const pillar = getPillar(slug);
  if (!pillar) return [];
  const featured = pillar.featured
    .map((s) => allListings.find((p) => p.slug === s))
    .filter((p): p is BlogPostListing => Boolean(p));
  if (featured.length >= 6) return featured.slice(0, 6);
  const extras = allListings
    .filter((p) => p.cluster === slug && !pillar.featured.includes(p.slug))
    .slice(0, 6 - featured.length);
  return [...featured, ...extras];
}

export function allSlugs(): string[] {
  return allListings.map((p) => p.slug);
}

// Populated once pillar (topic-hub) pages exist in pillars.json + App.tsx routes.
// Empty at launch so the /blog page renders cleanly with no broken topic links.
export const PILLAR_SLUGS: BlogCluster[] = [];
