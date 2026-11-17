/** Cover helpers: real pixel sizes and responsive variant names (see scripts/build-blog-thumbnails.mjs). */
import coverSizes from '../data/cover-sizes.json';

export type ImageSize = { width: number; height: number };

const SIZES = coverSizes as Record<string, ImageSize>;

/** Real pixel size of a site cover (from src/data/cover-sizes.json, written by scripts/build-blog-thumbnails.mjs), or null. */
export function coverSize(path: string): ImageSize | null {
  return SIZES[path] ?? null;
}

/** Widths of the AVIF/WebP variants written next to every cover. */
export const COVER_WIDTHS = [240, 480, 640, 800, 960, 1280] as const;
type CoverWidth = (typeof COVER_WIDTHS)[number];

const COVER_RE = /^\/blog-thumbnails\/([a-z0-9-]+)\.jpg$/;

/** srcset strings for a cover path, or null when the path is not one of the generated covers. */
export function coverSrcSet(path: string, widths: readonly CoverWidth[]): { avif: string; webp: string } | null {
  const m = COVER_RE.exec(path);
  if (!m) return null;
  const size = SIZES[path];
  const set = (ext: 'avif' | 'webp') =>
    widths
      .filter((w) => !size || w < size.width)
      .map((w) => `/blog-thumbnails/${m[1]}-${w}.${ext} ${w}w`)
      .join(', ');
  return { avif: set('avif'), webp: set('webp') };
}

/** The generic site card (og-image.png): shared by every page, so it is never used as a post cover or hero. */
export const GENERIC_CARD = '/og-image.png';

/** Hero sizes: the 768 px column from md up, the full viewport below. */
export const HERO_SIZES = '(min-width: 768px) 768px, 100vw';
export const HERO_WIDTHS = [640, 960, 1280] as const;
