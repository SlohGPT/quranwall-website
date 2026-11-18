import type { CSSProperties } from 'react';
import { useInView } from '../../lib/inview';
import type { BlogSection } from '../../types/blog';
import { GOLD, GOLD2 } from './primitives';
import PhoneFrame from '../mockup/PhoneFrame';
import LockScreen from '../mockup/LockScreen';
import type { WallpaperVariant } from '../mockup/Wallpaper';
import type { ShowcaseVerse } from '../../data/showcaseVerses';

type Stat = Extract<BlogSection, { type: 'stat' }>;
type Verse = Extract<BlogSection, { type: 'verse' }>;

/** What a stat number can truthfully be drawn as: a count up to 200 (dots; segments up to 6), or a percentage (ring). */
export type StatShape = { kind: 'ring'; pct: number } | { kind: 'dots'; n: number } | { kind: 'segments'; n: number };

export function statShape(number: string): StatShape | null {
  const pct = /^\s*(\d{1,3})\s*%\s*$/.exec(number);
  if (pct) return Number(pct[1]) <= 100 ? { kind: 'ring', pct: Number(pct[1]) } : null;
  const count = /^\s*(\d{1,3})(?:\s+[A-Za-z][A-Za-z -]*)?\s*$/.exec(number);
  if (!count) return null;
  const n = Number(count[1]);
  if (n < 1 || n > 200) return null;
  return n <= 6 ? { kind: 'segments', n } : { kind: 'dots', n };
}

const CELL = 16;
const COLS = 20;
const stepVar = (i: number) => ({ '--i': i }) as CSSProperties;

function DotGrid({ n }: { n: number }) {
  const cols = Math.min(n, COLS);
  const rows = Math.ceil(n / cols);
  const rowsOut = [];
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(cols, n - r * cols);
    // A zero-length subpath with a round cap is one dot.
    const d = `M${CELL / 2} ${r * CELL + CELL / 2}${'h.01m16 0'.repeat(inRow).replace(/m16 0$/, '')}`;
    rowsOut.push(<path key={r} d={d} className="qa-in" style={stepVar(r)} />);
  }
  return (
    <g stroke={GOLD} strokeWidth="9" strokeLinecap="round">
      {rowsOut}
    </g>
  );
}

function Figure({ shape }: { shape: StatShape }) {
  if (shape.kind === 'ring') {
    const C = 2 * Math.PI * 48;
    return (
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" focusable="false" className="mx-auto mb-4 block h-[120px] w-[120px]" fill="none">
        <circle cx="60" cy="60" r="48" stroke={GOLD2} strokeOpacity=".3" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke={GOLD}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(shape.pct / 100) * C} ${C}`}
          transform="rotate(-90 60 60)"
          className="qa-in"
        />
      </svg>
    );
  }
  if (shape.kind === 'segments') {
    const w = shape.n * 52 - 8;
    return (
      <svg viewBox={`0 0 ${w} 12`} width={w} height="12" aria-hidden="true" focusable="false" className="mx-auto mb-4 block h-3 max-w-full" fill={GOLD}>
        {Array.from({ length: shape.n }, (_, i) => (
          <rect key={i} x={i * 52} width="44" height="12" rx="6" className="qa-in" style={stepVar(i)} />
        ))}
      </svg>
    );
  }
  const cols = Math.min(shape.n, COLS);
  const w = cols * CELL;
  const h = Math.ceil(shape.n / cols) * CELL;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" focusable="false" className="mx-auto mb-4 block max-w-full" style={{ height: 'auto' }} fill="none">
      <DotGrid n={shape.n} />
    </svg>
  );
}

/** A stat card: the number drawn as it is (dots, segments or a ring), the number and label stay as HTML text. */
export function StatBlock({ section, className, quiet = false }: { section: Stat; className: string; quiet?: boolean }) {
  const ref = useInView<HTMLDivElement>();
  // quiet (visual rhythm, src/lib/visualRhythm.ts): the number and words only, no drawing
  const shape = quiet ? null : statShape(section.number);
  return (
    <div ref={ref} className={className}>
      {shape && <Figure shape={shape} />}
      <p className="text-4xl md:text-5xl font-black text-brand">{section.number}</p>
      <p className="text-white font-semibold mt-2">{section.label}</p>
      {section.description && <p className="text-white/65 text-[15px] mt-2">{section.description}</p>}
    </div>
  );
}

/** "Quran 13:28 (Sahih International)" → "Quran 13:28": the lock screen shows the short reference, the page keeps the full one. */
function shortReference(reference: string): string {
  return reference.replace(/\s*\([^)]*\)\s*$/, '');
}

/** Deterministic wallpaper per reference, so the same ayah always gets the same sky (no 'photo': it is a heavy image). */
function wallpaperFor(reference: string): WallpaperVariant {
  const skies: WallpaperVariant[] = ['night', 'emerald', 'dusk'];
  let h = 0;
  for (const ch of reference) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return skies[h % skies.length];
}

/**
 * The verse on a real iPhone Lock Screen, the same mockup as the homepage: clock, the translation and its reference.
 * Only the top of the phone shows; the lower edge fades into the page. The full reference (with the translation
 * name) is the caption, so the quote stays attributed as real text.
 */
export function VerseCard({ section }: { section: Verse }) {
  const verse: ShowcaseVerse = {
    key: '0:0',
    surah: '',
    surahNameAr: '',
    arabic: '',
    translation: section.text,
    translationName: '',
  };
  return (
    <figure className="mx-auto my-10 flex w-full max-w-[290px] flex-col items-center">
      <blockquote
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_bottom,#000_78%,transparent)]"
        style={{ aspectRatio: section.text.length > 150 ? '1 / 1.62' : '1 / 1.45' }}
      >
        <PhoneFrame>
          <LockScreen verse={verse} wallpaper={wallpaperFor(section.reference)} reference={shortReference(section.reference)} />
        </PhoneFrame>
      </blockquote>
      <figcaption className="mt-3 text-center text-[14px] text-white/60">{section.reference} on an iPhone Lock Screen</figcaption>
    </figure>
  );
}

/** The quiet form of a verse (visual rhythm): a gold rule, the ayah in the serif, the reference below. */
export function VerseQuote({ section }: { section: Verse }) {
  return (
    <blockquote className="my-7 border-l-[3px] border-brand py-1 pl-5">
      <p dir="auto" className="font-serif text-[20px] leading-[1.55] text-white/90 md:text-[22px] [text-wrap:pretty]">
        {section.text}
      </p>
      <cite className="mt-2.5 block text-[13px] font-semibold not-italic uppercase tracking-[0.12em] text-brand">{section.reference}</cite>
    </blockquote>
  );
}
