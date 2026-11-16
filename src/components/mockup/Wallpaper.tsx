import { useId } from 'react';

export type WallpaperVariant = 'night' | 'emerald' | 'dusk' | 'photo';

// Deterministic star field (same on server and client, so hydration matches).
function makeStars(seed: number, count: number, maxY: number) {
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: Math.round(rand() * 3900) / 10,
    y: Math.round(rand() * maxY * 10) / 10,
    r: Math.round((0.35 + rand() * 0.9) * 100) / 100,
    o: Math.round((0.25 + rand() * 0.65) * 100) / 100,
  }));
}

const NIGHT_STARS = makeStars(94, 70, 560);
const DUSK_STARS = makeStars(61, 26, 300);

const BASE_PROPS = {
  viewBox: '0 0 390 844',
  preserveAspectRatio: 'xMidYMax slice',
  className: 'absolute inset-0 h-full w-full',
  'aria-hidden': true,
  focusable: false,
} as const;

function Night({ id }: { id: string }) {
  return (
    <svg {...BASE_PROPS}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#090731" />
          <stop offset="0.45" stopColor="#16104a" />
          <stop offset="0.8" stopColor="#2a1b68" />
          <stop offset="1" stopColor="#3b2a83" />
        </linearGradient>
        <radialGradient id={`${id}moon`} cx="326" cy="74" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3dfa0" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#c9a8ff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#c9a8ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}hor`} cx="195" cy="760" r="330" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7a56c0" stopOpacity="0.42" />
          <stop offset="1" stopColor="#7a56c0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}sil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0b2c" />
          <stop offset="1" stopColor="#04041a" />
        </linearGradient>
        <mask id={`${id}cres`}>
          <rect width="390" height="844" fill="#fff" />
          <circle cx="336" cy="68" r="18" fill="#000" />
        </mask>
      </defs>
      <rect width="390" height="844" fill={`url(#${id}sky)`} />
      <rect width="390" height="844" fill={`url(#${id}hor)`} />
      {NIGHT_STARS.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={st.o} />
      ))}
      <circle cx="326" cy="74" r="150" fill={`url(#${id}moon)`} />
      <circle cx="326" cy="74" r="20" fill="#f3e4b0" opacity="0.85" mask={`url(#${id}cres)`} />
      {/* soft dome and minaret skyline */}
      <g fill={`url(#${id}sil)`} opacity="0.96">
        <rect x="0" y="796" width="390" height="48" />
        <rect x="62" y="770" width="266" height="80" />
        <path d="M133 772 C133 716 160 690 195 690 C230 690 257 716 257 772 Z" />
        <rect x="193.6" y="670" width="2.8" height="22" />
        <circle cx="195" cy="668" r="3.2" />
        <path d="M61 784 C61 752 76 737 95 737 C114 737 129 752 129 784 Z" />
        <path d="M261 784 C261 752 276 737 295 737 C314 737 329 752 329 784 Z" />
        <rect x="93.8" y="722" width="2.4" height="16" />
        <rect x="293.8" y="722" width="2.4" height="16" />
        {/* minarets */}
        <rect x="26" y="700" width="9" height="100" />
        <path d="M24 700 L30.5 676 L37 700 Z" />
        <rect x="22" y="726" width="17" height="4" rx="1" />
        <rect x="355" y="700" width="9" height="100" />
        <path d="M353 700 L359.5 676 L366 700 Z" />
        <rect x="351" y="726" width="17" height="4" rx="1" />
        <rect x="64" y="754" width="5" height="40" />
        <path d="M63 754 L66.5 740 L70 754 Z" />
        <rect x="321" y="754" width="5" height="40" />
        <path d="M320 754 L323.5 740 L327 754 Z" />
      </g>
    </svg>
  );
}

function Emerald({ id }: { id: string }) {
  return (
    <svg {...BASE_PROPS}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#031f19" />
          <stop offset="0.5" stopColor="#07493a" />
          <stop offset="1" stopColor="#042a22" />
        </linearGradient>
        <radialGradient id={`${id}lit`} cx="195" cy="210" r="380" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a9a73" stopOpacity="0.42" />
          <stop offset="1" stopColor="#2a9a73" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}vig`} cx="195" cy="420" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <pattern id={`${id}khatam`} width="60" height="60" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#e8fff4" strokeWidth="0.8" opacity="0.09">
            <rect x="15" y="15" width="30" height="30" />
            <rect x="15" y="15" width="30" height="30" transform="rotate(45 30 30)" />
          </g>
        </pattern>
      </defs>
      <rect width="390" height="844" fill={`url(#${id}bg)`} />
      <rect width="390" height="844" fill={`url(#${id}khatam)`} />
      <rect width="390" height="844" fill={`url(#${id}lit)`} />
      <rect width="390" height="844" fill={`url(#${id}vig)`} />
    </svg>
  );
}

function Dusk({ id }: { id: string }) {
  return (
    <svg {...BASE_PROPS}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b0f3b" />
          <stop offset="0.4" stopColor="#3b1c5e" />
          <stop offset="0.64" stopColor="#7c3466" />
          <stop offset="0.8" stopColor="#cf6a50" />
          <stop offset="0.92" stopColor="#f2a54a" />
          <stop offset="1" stopColor="#f6c06a" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="250" cy="705" r="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd488" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd488" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill={`url(#${id}sky)`} />
      {DUSK_STARS.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={st.o * 0.7} />
      ))}
      <rect width="390" height="844" fill={`url(#${id}sun)`} />
      <path d="M0 704 C70 668 150 696 235 670 C300 650 350 674 390 662 L390 844 L0 844 Z" fill="#4a2154" />
      <path d="M0 762 C70 732 150 772 232 746 C312 722 352 748 390 738 L390 844 L0 844 Z" fill="#2b1239" />
      <path d="M0 812 C90 790 172 820 262 802 C322 790 362 802 390 797 L390 844 L0 844 Z" fill="#170a25" />
    </svg>
  );
}

// A sample landscape that stands in for "your own photo" in the customiser demo.
function Photo({ id }: { id: string }) {
  return (
    <svg {...BASE_PROPS}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e2a40" />
          <stop offset="0.45" stopColor="#2c5b74" />
          <stop offset="0.72" stopColor="#d7977a" />
          <stop offset="0.8" stopColor="#f0c08a" />
          <stop offset="1" stopColor="#1d3b4a" />
        </linearGradient>
        <linearGradient id={`${id}lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98b74" stopOpacity="0.9" />
          <stop offset="1" stopColor="#10283a" />
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill={`url(#${id}sky)`} />
      <path d="M0 640 L70 590 L120 626 L190 548 L260 618 L310 580 L390 640 L390 700 L0 700 Z" fill="#35586a" opacity="0.85" />
      <path d="M0 676 L60 640 L140 676 L220 620 L300 670 L390 632 L390 710 L0 710 Z" fill="#1f3d4f" />
      <rect y="700" width="390" height="144" fill={`url(#${id}lake)`} />
      <path d="M0 700 L390 700" stroke="#f3cf9a" strokeOpacity="0.5" strokeWidth="1" />
    </svg>
  );
}

/**
 * Original CSS/SVG phone wallpapers (no photos). Fills its positioned parent and is
 * dark enough for white text in the middle of the frame.
 */
export default function Wallpaper({ variant, className = '' }: { variant: WallpaperVariant; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '') + variant;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {variant === 'night' && <Night id={id} />}
      {variant === 'emerald' && <Emerald id={id} />}
      {variant === 'dusk' && <Dusk id={id} />}
      {variant === 'photo' && <Photo id={id} />}
    </div>
  );
}
