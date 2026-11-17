import type { CSSProperties } from 'react';
import { useInView } from '../../lib/inview';
import type { BlogSection } from '../../types/blog';
import { crescentPath, GOLD, GOLD2 } from './primitives';

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

function Figure({ shape, label }: { shape: StatShape; label: string }) {
  if (shape.kind === 'ring') {
    const C = 2 * Math.PI * 48;
    return (
      <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={label} className="mx-auto mb-4 block h-[120px] w-[120px]" fill="none">
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
      <svg viewBox={`0 0 ${w} 12`} width={w} height="12" role="img" aria-label={label} className="mx-auto mb-4 block h-3 max-w-full" fill={GOLD}>
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
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={label} className="mx-auto mb-4 block max-w-full" style={{ height: 'auto' }} fill="none">
      <DotGrid n={shape.n} />
    </svg>
  );
}

/** A stat card: the number drawn as it is (dots, segments or a ring), the number and label stay as HTML text. */
export function StatBlock({ section, className }: { section: Stat; className: string }) {
  const ref = useInView<HTMLDivElement>();
  const shape = statShape(section.number);
  return (
    <div ref={ref} className={className}>
      {shape && <Figure shape={shape} label={`${section.number} ${section.label}`} />}
      <p className="text-4xl md:text-5xl font-black text-brand">{section.number}</p>
      <p className="text-white font-semibold mt-2">{section.label}</p>
      {section.description && <p className="text-white/65 text-[15px] mt-2">{section.description}</p>}
    </div>
  );
}

/** The verse as a lock screen: iPhone frame, island, a crescent, the existing text and reference as real HTML. */
export function VerseCard({ section }: { section: Verse }) {
  return (
    <blockquote className="relative mx-auto my-8 w-full max-w-[360px] rounded-[2.75rem] border-[6px] border-brand-ink bg-surface-card px-6 pb-10 pt-12 text-center ring-2 ring-brand/45">
      <span aria-hidden="true" className="absolute left-1/2 top-3 h-[18px] w-16 -translate-x-1/2 rounded-full bg-brand-ink" />
      <svg aria-hidden="true" focusable="false" viewBox="0 0 28 28" width="28" height="28" className="mx-auto mb-4 block" fill="rgba(217,185,104,.15)" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round">
        <path d={crescentPath(14, 14, 10)} />
      </svg>
      <p dir="auto" className="font-serif text-[20px] leading-[1.5] text-white min-[1180px]:text-[22px]">"{section.text}"</p>
      <footer className="mt-3 text-[15px] font-semibold tracking-wide text-brand">, {section.reference}</footer>
      <span aria-hidden="true" className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" />
    </blockquote>
  );
}
