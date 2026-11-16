import { useId } from 'react';
import type { ShowcaseVerse } from '../../data/showcaseVerses';
import { SHOWCASE_VERSES } from '../../data/showcaseVerses';

type Props = {
  size?: 'small' | 'medium';
  verse?: ShowcaseVerse;
  /** Which text the widget shows. The real widget shows ONE text (an Arabic ayah or a translation) and the reference. */
  edition?: 'arabic' | 'translation';
  className?: string;
};

const GOLD = '#D9B968'; // the widget's brandGold

/** Reference line as the app writes it: surah name and ayah number, e.g. "Ash-Sharh 6" */
export function referenceOf(v: ShowcaseVerse) {
  return `${v.surah} ${v.key.split(':')[1]}`;
}

/** The app's star-and-crescent symbol (StarCrescentSymbol in the widget source): a disc with a bite taken out, plus a five-point star. */
function Crescent({ width, height }: { width: string; height: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  // star centred at (50,50), outer radius 15, inner radius 6
  const star = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 15 : 6;
    const a = (-90 + i * 36) * (Math.PI / 180);
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="shrink-0" style={{ width, height }}>
      <mask id={id}>
        <rect width="100" height="100" fill="#fff" />
        <circle cx="63" cy="50" r="40" fill="#000" />
      </mask>
      <circle cx="42" cy="50" r="40" fill={GOLD} mask={`url(#${id})`} />
      <polygon points={star} fill={GOLD} />
    </svg>
  );
}

/**
 * The Home Screen widget as the app draws it: indigo card, a small gold crescent, ONE text of the ayah and its reference.
 * Width comes from the parent (medium is 2.13:1, small is square); text scales with it.
 */
export default function QuranWidget({ size = 'medium', verse = SHOWCASE_VERSES[0], edition = 'translation', className = '' }: Props) {
  const medium = size === 'medium';
  const arabic = edition === 'arabic';
  const len = verse.arabic.length;
  const arabicSize = medium ? (len <= 26 ? 6.4 : len <= 40 ? 5.2 : 4.4) : len <= 26 ? 10 : len <= 40 ? 8 : 6.6;

  const text = arabic ? (
    <p lang="ar" dir="rtl" className="font-quran" style={{ fontSize: `${arabicSize}cqw`, lineHeight: 1.7, color: '#fff' }}>
      {verse.arabic}
    </p>
  ) : (
    <p
      className="font-medium"
      style={{
        fontSize: medium ? '4.1cqw' : '7.6cqw',
        lineHeight: 1.3,
        color: '#fff',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: medium ? 4 : 6,
        overflow: 'hidden',
      }}
    >
      {verse.translation}
    </p>
  );

  const ref = (
    <p className="font-semibold" style={{ fontSize: medium ? '3.5cqw' : '6.3cqw', color: GOLD, lineHeight: 1.2 }}>
      {referenceOf(verse)}
    </p>
  );

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ containerType: 'inline-size', aspectRatio: medium ? '2.13 / 1' : '1 / 1' }}
    >
      <div
        className="absolute inset-0 flex overflow-hidden"
        style={{
          borderRadius: medium ? '6.4cqw' : '14cqw',
          padding: medium ? '4.1cqw' : '7.6cqw',
          gap: medium ? '4.7cqw' : undefined,
          flexDirection: medium ? 'row' : 'column',
          background: 'linear-gradient(135deg,#2D2B66,#191738)',
          boxShadow: 'inset 0 0 0 0.25cqw rgba(255,255,255,0.08), 0 4cqw 8cqw -3cqw rgba(0,0,0,0.5)',
        }}
      >
        {medium ? (
          <>
            <div className="flex shrink-0 flex-col items-center" style={{ width: '17cqw', gap: '1.8cqw' }}>
              <Crescent width="7.1cqw" height="9.5cqw" />
              <span className="font-medium" style={{ fontSize: '3cqw', color: 'rgba(217,185,104,0.85)', lineHeight: 1 }}>QuranWall</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between" style={{ gap: '1.8cqw' }}>
              <div className="my-auto">{text}</div>
              {ref}
            </div>
          </>
        ) : (
          <>
            <Crescent width="7.6cqw" height="10.1cqw" />
            <div className="flex flex-1 items-center" style={{ minHeight: 0 }}>
              <div className="w-full">{text}</div>
            </div>
            {ref}
          </>
        )}
      </div>
    </div>
  );
}
