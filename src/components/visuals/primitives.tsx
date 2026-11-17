import { useId, type ReactNode } from 'react';

/**
 * Shared parts of the spot scenes: palette (site tokens only), the pointed arch every scene sits in, the iPhone,
 * the khatam star and the crescent. Scenes are 320x240 at 2 px, round caps and joins; fills are gold at 0.12-0.18
 * or plum; the only gradient is the sky inside the arch. No Arabic or Quran text is ever drawn: ayah lines are bars.
 */
export const GOLD = '#D9B968';
export const GOLD2 = '#C2A451';
export const NIGHT = '#1E1338';
export const DUSK = '#2C1C58';
export const PLUM = '#362266';
export const INK = '#0C0D24';
export const FILL = 'rgba(217,185,104,.15)';

const r1 = (v: number) => Math.round(v * 10) / 10;

/** The mihrab outline: a pointed arch with a straight base, filling most of the 320x240 box. */
const ARCH = 'M40 232V120C40 72 100 40 160 8C220 40 280 72 280 120V232';
const ARCH_IN = 'M52 232V122C52 82 104 52 160 24C216 52 268 82 268 122V232';

/** 8-point star (khatam): two squares turned 45 degrees, as one outline. */
export function starPath(cx: number, cy: number, R: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 ? R * 0.765 : R;
    pts.push(`${r1(cx + rad * Math.cos(a))} ${r1(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Crescent opening to the right. */
export function crescentPath(cx: number, cy: number, r: number): string {
  const x = r1(cx + r * 0.35);
  return `M${x} ${r1(cy - r * 0.94)}A${r} ${r} 0 1 0 ${x} ${r1(cy + r * 0.94)}A${r1(r * 0.95)} ${r1(r * 0.95)} 0 0 1 ${x} ${r1(cy - r * 0.94)}Z`;
}

export function Star({ cx, cy, R, fill = FILL, className }: { cx: number; cy: number; R: number; fill?: string; className?: string }) {
  return <path d={starPath(cx, cy, R)} fill={fill} className={className} />;
}

export function Crescent({ cx, cy, r, className }: { cx: number; cy: number; r: number; className?: string }) {
  return <path d={crescentPath(cx, cy, r)} fill={FILL} className={className} />;
}

/**
 * Root of every scene: the arch, its sky and inner line. Children are drawn inside; the outline goes on top.
 * `clipped` is drawn clipped to the arch. Ids come from useId so several scenes on one page never share an id.
 */
export function SceneSvg({ children, clipped }: { children: ReactNode; clipped?: ReactNode }) {
  const uid = useId().replace(/:/g, '');
  const sky = `qa-sky-${uid}`;
  const arch = `qa-arch-${uid}`;
  return (
    <svg
      viewBox="0 0 320 240"
      width="320"
      height="240"
      aria-hidden="true"
      focusable="false"
      className="qa-scene"
      fill="none"
      stroke={GOLD}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={DUSK} />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        {clipped && (
          <clipPath id={arch}>
            <path d={`${ARCH}Z`} />
          </clipPath>
        )}
      </defs>
      <path d={`${ARCH}Z`} fill={`url(#${sky})`} stroke="none" />
      <path d={ARCH_IN} stroke={GOLD2} strokeOpacity=".4" strokeWidth="1.5" />
      {clipped && <g clipPath={`url(#${arch})`}>{clipped}</g>}
      {children}
      <path d={`${ARCH}Z`} />
    </svg>
  );
}

/** iPhone: round corners and a Dynamic Island (never a squircle). Children use phone coordinates (0,0 = top-left). */
export function Phone({ x, y, w, fill = NIGHT, children }: { x: number; y: number; w: number; fill?: string; children?: ReactNode }) {
  const h = r1(w * 2.05);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={r1(w * 0.2)} fill={fill} />
      <rect x={r1(w * 0.33)} y={r1(w * 0.05)} width={r1(w * 0.34)} height={r1(w * 0.085)} rx={r1(w * 0.043)} fill={INK} stroke="none" />
      {children}
    </g>
  );
}

/** A lock screen in phone coordinates: a quiet clock bar, ayah as three abstract lines, a gold reference line. */
export function Lock({ w, clock = true, lines = true }: { w: number; clock?: boolean; lines?: boolean }) {
  const c = w / 2;
  const h = w * 2.05;
  const y0 = r1(w * 0.78);
  const bar = (cx: number, y: number, len: number) => `M${r1(cx - len / 2)} ${r1(y)}h${r1(len)}`;
  return (
    <>
      {clock && <path d={bar(c, w * 0.36, w * 0.42)} stroke="#fff" strokeOpacity=".8" strokeWidth="6" />}
      {lines && (
        <>
          <path d={bar(c, y0, w * 0.62) + bar(c, y0 + 9, w * 0.5) + bar(c, y0 + 18, w * 0.38)} stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" />
          <path d={bar(c, y0 + 31, w * 0.2)} />
        </>
      )}
      <path d={bar(c, h - 8, w * 0.32)} stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    </>
  );
}

/** Tasbih beads on a circle of radius R (angles in degrees, SVG orientation); thread drawn when `thread`. */
export function Beads({ cx, cy, R, n, from = 0, to = 360, br = 4.5, closed = false }: { cx: number; cy: number; R: number; n: number; from?: number; to?: number; br?: number; closed?: boolean }) {
  const step = closed ? (to - from) / n : n > 1 ? (to - from) / (n - 1) : 0;
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((from + step * i) * Math.PI) / 180;
    out.push(<circle key={i} cx={r1(cx + R * Math.cos(a))} cy={r1(cy + R * Math.sin(a))} r={br} fill={FILL} />);
  }
  return <>{out}</>;
}
