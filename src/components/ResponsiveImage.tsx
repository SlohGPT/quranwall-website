import type { CSSProperties } from 'react';
import { coverSize, coverSrcSet, type COVER_WIDTHS } from '../lib/covers';

type CoverWidth = (typeof COVER_WIDTHS)[number];

interface Props {
  /** Site path of the cover (the 1600 px JPEG). Anything else renders a plain <img>. */
  src: string;
  alt: string;
  sizes: string;
  widths: readonly CoverWidth[];
  className?: string;
  style?: CSSProperties;
  loading?: 'eager' | 'lazy';
  /** The one LCP image on a page: loading eager plus fetchpriority high. */
  priority?: boolean;
}

/**
 * <picture> with AVIF, WebP and the JPEG fallback. width/height are the real file pixels (never a guessed ratio);
 * CSS aspect-ratio and object-cover set the displayed crop, so layout never shifts.
 */
export default function ResponsiveImage({ src, alt, sizes, widths, className, style, loading, priority }: Props) {
  const size = coverSize(src);
  const sets = coverSrcSet(src, widths);
  // React 18 does not know fetchPriority; the lowercase attribute passes through to the HTML as written.
  const prio = priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {};
  const img = (
    <img
      src={src}
      alt={alt}
      {...(size ? { width: size.width, height: size.height } : {})}
      className={className}
      style={style}
      loading={priority ? 'eager' : loading}
      decoding="async"
      {...prio}
    />
  );
  if (!sets) return img;
  return (
    <picture>
      <source type="image/avif" srcSet={sets.avif} sizes={sizes} />
      <source type="image/webp" srcSet={sets.webp} sizes={sizes} />
      {img}
    </picture>
  );
}
