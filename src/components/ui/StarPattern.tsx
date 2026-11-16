// Faint 8-point star (khatam) lattice. Pure decoration: sits behind content, fades out toward the edges.
// Built from two overlapping squares per 64px tile; the SVG ships as a data URI so there is no extra request.
const TILE = 64;
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">` +
  `<g fill="none" stroke="#D9B968" stroke-width="1" stroke-linejoin="round">` +
  `<rect x="18" y="18" width="28" height="28"/>` +
  `<polygon points="32,12.2 51.8,32 32,51.8 12.2,32"/>` +
  `</g><circle cx="0" cy="0" r="1.4" fill="#D9B968"/><circle cx="${TILE}" cy="0" r="1.4" fill="#D9B968"/>` +
  `<circle cx="0" cy="${TILE}" r="1.4" fill="#D9B968"/><circle cx="${TILE}" cy="${TILE}" r="1.4" fill="#D9B968"/></svg>`;
const DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const MASKS = {
  center: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 0%, transparent 100%)',
  top: 'radial-gradient(ellipse 80% 80% at 50% 0%, #000 0%, transparent 100%)',
  right: 'radial-gradient(ellipse 80% 90% at 100% 40%, #000 0%, transparent 100%)',
  left: 'radial-gradient(ellipse 80% 90% at 0% 40%, #000 0%, transparent 100%)',
} as const;

interface StarPatternProps {
  className?: string;
  /** 0.03 to 0.06 reads as texture; higher starts to compete with content. */
  opacity?: number;
  fade?: keyof typeof MASKS;
}

export default function StarPattern({ className = '', opacity = 0.05, fade = 'center' }: StarPatternProps) {
  const mask = MASKS[fade];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: DATA_URI,
        backgroundSize: `${TILE}px ${TILE}px`,
        opacity,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
