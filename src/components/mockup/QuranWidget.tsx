import type { ShowcaseVerse } from '../../data/showcaseVerses';
import { SHOWCASE_VERSES } from '../../data/showcaseVerses';

type Props = {
  size?: 'small' | 'medium';
  verse?: ShowcaseVerse;
  className?: string;
};

const GOLD = '#E3C46B';

/** Reference line as the app writes it, e.g. ASH-SHARH 94:6 */
export function referenceOf(v: ShowcaseVerse) {
  return `${v.surah.toUpperCase()} ${v.key}`;
}

/**
 * The Home Screen widget: Arabic + translation + reference on a dark glassy card.
 * Width comes from the parent (medium is 2.13:1, small is square); text scales with it.
 */
export default function QuranWidget({ size = 'medium', verse = SHOWCASE_VERSES[0], className = '' }: Props) {
  const medium = size === 'medium';
  const len = verse.arabic.length;
  const arabicSize = medium ? (len <= 26 ? 7.4 : len <= 40 ? 6 : 5) : len <= 26 ? 9 : len <= 40 ? 7.2 : 6;

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ containerType: 'inline-size', aspectRatio: medium ? '2.13 / 1' : '1 / 1' }}
    >
      <div
        className="absolute inset-0 flex flex-col overflow-hidden"
        style={{
          borderRadius: medium ? '6.4cqw' : '14cqw',
          padding: medium ? '5cqw 5.5cqw' : '9cqw 9cqw',
          background: 'linear-gradient(160deg,rgba(40,28,92,0.78),rgba(14,10,38,0.82))',
          boxShadow: 'inset 0 0 0 0.25cqw rgba(255,255,255,0.12), inset 0 0.3cqw 0 rgba(255,255,255,0.08), 0 4cqw 8cqw -3cqw rgba(0,0,0,0.5)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <div className="flex items-center justify-between" style={{ gap: '2cqw' }}>
          <div className="flex items-center" style={{ gap: medium ? '1.8cqw' : '3cqw' }}>
            <img
              src="/icon-app-180.png"
              alt=""
              width={180}
              height={180}
              loading="lazy"
              decoding="async"
              className="shrink-0"
              style={{ width: medium ? '5.4cqw' : '10cqw', height: medium ? '5.4cqw' : '10cqw', borderRadius: medium ? '1.3cqw' : '2.4cqw' }}
            />
            {medium && (
              <span className="font-medium" style={{ fontSize: '3.1cqw', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>
                QuranWall
              </span>
            )}
          </div>
          {medium && (
            <span className="font-semibold uppercase" style={{ fontSize: '2.5cqw', letterSpacing: '0.16em', color: GOLD }}>
              {referenceOf(verse)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ gap: medium ? '1.3cqw' : '2.4cqw' }}>
          <p lang="ar" dir="rtl" className="font-quran" style={{ fontSize: `${arabicSize}cqw`, lineHeight: 1.6, color: GOLD }}>
            {verse.arabic}
          </p>
          <p
            className="font-serif font-medium"
            style={{
              fontSize: medium ? '3.5cqw' : '4.6cqw',
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.92)',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: medium ? 2 : 3,
              overflow: 'hidden',
            }}
          >
            {verse.translation}
          </p>
        </div>

        {!medium && (
          <p className="text-center font-semibold uppercase" style={{ fontSize: '3.7cqw', letterSpacing: '0.14em', color: GOLD }}>
            {referenceOf(verse)}
          </p>
        )}
      </div>
    </div>
  );
}
