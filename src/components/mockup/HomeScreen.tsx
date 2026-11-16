import { SHOWCASE_VERSES, type ShowcaseVerse } from '../../data/showcaseVerses';
import QuranWidget from './QuranWidget';
import { StatusBarIcons } from './LockScreen';
import Wallpaper, { type WallpaperVariant } from './Wallpaper';

type Props = {
  verse?: ShowcaseVerse;
  wallpaper?: WallpaperVariant;
  edition?: 'arabic' | 'translation';
  className?: string;
};

// Neutral, muted placeholder app icons (no brand logos).
const TONES: [string, string][] = [
  ['#6f7f9a', '#4a5873'], ['#8a9a86', '#5f7060'], ['#b08a8f', '#80585f'], ['#b3a284', '#85755a'],
  ['#7d7aa6', '#55537c'], ['#6e9a9a', '#477171'], ['#a38aa8', '#78607f'], ['#8f8f98', '#62626b'],
  ['#9a8470', '#6e5b4a'], ['#7a93ad', '#526a84'], ['#a0a58a', '#737858'], ['#a8828a', '#7b5660'],
  ['#7d8aa3', '#566179'], ['#8da08f', '#627565'], ['#ad9a7e', '#7f6e55'], ['#8a82a8', '#605880'],
];

function Glyph({ i }: { i: number }) {
  const k = i % 4;
  return (
    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
      {k === 0 && <span style={{ width: '38%', height: '38%', borderRadius: '50%', border: '0.5cqw solid rgba(255,255,255,0.4)' }} />}
      {k === 1 && <span style={{ width: '36%', height: '36%', borderRadius: '22%', background: 'rgba(255,255,255,0.3)' }} />}
      {k === 2 && <span style={{ width: '40%', height: '8%', borderRadius: '1cqw', background: 'rgba(255,255,255,0.38)', boxShadow: '0 -1.8cqw 0 rgba(255,255,255,0.22), 0 1.8cqw 0 rgba(255,255,255,0.22)' }} />}
      {k === 3 && <span style={{ width: '34%', height: '34%', transform: 'rotate(45deg)', borderRadius: '14%', border: '0.5cqw solid rgba(255,255,255,0.36)' }} />}
    </span>
  );
}

function AppIcon({ i, label = true }: { i: number; label?: boolean }) {
  const [a, b] = TONES[i % TONES.length];
  return (
    <div className="flex flex-col items-center" style={{ gap: '1.5cqw' }}>
      <span
        className="relative block"
        style={{
          width: '16cqw',
          height: '16cqw',
          borderRadius: '4cqw',
          background: `linear-gradient(150deg,${a},${b})`,
          boxShadow: 'inset 0 0.3cqw 0 rgba(255,255,255,0.22), 0 1cqw 2cqw -0.6cqw rgba(0,0,0,0.4)',
        }}
      >
        <Glyph i={i} />
      </span>
      {label && <span aria-hidden="true" className="block" style={{ width: '9cqw', height: '1.5cqw', borderRadius: '1cqw', background: 'rgba(255,255,255,0.42)' }} />}
    </div>
  );
}

/** A Home Screen with the medium QuranWall widget on top, neutral app icons and a dock. */
export default function HomeScreen({ verse = SHOWCASE_VERSES[0], wallpaper = 'night', edition = 'translation', className = '' }: Props) {
  return (
    <div className={`absolute inset-0 overflow-hidden text-white ${className}`} style={{ containerType: 'inline-size' }}>
      <Wallpaper variant={wallpaper} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.05) 40%,rgba(0,0,0,0.3))' }} aria-hidden="true" />

      <div className="absolute inset-x-0 flex items-center justify-between" style={{ top: '4.2cqw', height: '6cqw', padding: '0 8.5cqw 0 9.5cqw' }} aria-hidden="true">
        <span className="font-semibold" style={{ fontSize: '4.1cqw', fontFamily: 'system-ui,-apple-system,sans-serif' }}>9:41</span>
        <StatusBarIcons />
      </div>

      <div className="absolute" style={{ top: '20cqw', left: '6.5cqw', right: '6.5cqw' }}>
        <QuranWidget size="medium" verse={verse} edition={edition} />
      </div>

      <div
        className="absolute grid grid-cols-4"
        style={{ top: '70cqw', left: '6.5cqw', right: '6.5cqw', rowGap: '5.5cqw', justifyItems: 'center' }}
        aria-hidden="true"
      >
        {Array.from({ length: 16 }, (_, i) => (
          <AppIcon key={i} i={i} />
        ))}
      </div>

      {/* page dots */}
      <div className="absolute inset-x-0 flex justify-center" style={{ bottom: '31cqw', gap: '1.8cqw' }} aria-hidden="true">
        {[1, 0.4, 0.4].map((o, i) => (
          <span key={i} style={{ width: '1.7cqw', height: '1.7cqw', borderRadius: '50%', background: `rgba(255,255,255,${o})` }} />
        ))}
      </div>

      {/* dock */}
      <div
        className="absolute flex items-center justify-around"
        style={{
          left: '4cqw', right: '4cqw', bottom: '4cqw', height: '23.5cqw', borderRadius: '8cqw',
          background: 'rgba(255,255,255,0.16)', boxShadow: 'inset 0 0 0 0.25cqw rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}
        aria-hidden="true"
      >
        {[4, 9, 2, 13].map((i) => (
          <AppIcon key={i} i={i} label={false} />
        ))}
      </div>
    </div>
  );
}
