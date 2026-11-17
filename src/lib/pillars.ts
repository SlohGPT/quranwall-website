import pillarsData from '../data/pillars.json';
import type { BlogCluster, PillarConfig } from '../types/blog';

// Kept apart from posts.ts on purpose: posts.ts eagerly imports every post body, and /blog only needs the pillar list.

export function getPillar(slug: string): PillarConfig | null {
  const data = (pillarsData as Record<string, PillarConfig>)[slug];
  return data ?? null;
}

// Populated once pillar (topic-hub) pages exist in pillars.json + App.tsx routes.
// Empty at launch so the /blog page renders cleanly with no broken topic links.
export const PILLAR_SLUGS: BlogCluster[] = [];
