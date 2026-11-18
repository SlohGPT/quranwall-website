import { useMemo, type CSSProperties } from 'react';
import { SHOWCASE_VERSES, type ShowcaseVerse } from '../../data/showcaseVerses';
import Wallpaper, { type WallpaperVariant } from './Wallpaper';
import { referenceOf, refDir } from './QuranWidget';
import { useLayers } from './utils';
import FadeLayer from './FadeLayer';

type Props = {
  verse?: ShowcaseVerse;
  wallpaper?: WallpaperVariant;
  /**
   * Which text the wallpaper carries. The app renders ONE edition per ayah (WallpaperRenderer: verse, optional
   * transliteration, reference), never Arabic and a translation together.
   */
  edition?: Edition;
  /** Text colour (the user picks one in the app). Default: gold for Arabic, white for a translation. */
  accent?: string;
  /** Translation face: the verse serif (default) or the page sans. */
  serif?: boolean;
  /** Reference line override (blog verse figures pass "Quran 13:28"); default: surah name and ayah number. */
  reference?: string;
  className?: string;
};

export type Edition = 'arabic' | 'translation';

const GOLD = '#E3C46B';
const shadow = '0 0.25cqw 1.4cqw rgba(0,0,0,0.4)';

export function StatusBarIcons({ color = '#fff' }: { color?: string }) {
  return (
    <div className="flex items-center" style={{ gap: '1.6cqw' }} aria-hidden="true">
      <svg viewBox="0 0 18 12" style={{ width: '4.6cqw', height: '3cqw' }} fill={color}>
        <rect x="0" y="8" width="3" height="4" rx="0.8" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
        <rect x="10" y="3" width="3" height="9" rx="0.8" />
        <rect x="15" y="0" width="3" height="12" rx="0.8" />
      </svg>
      <svg viewBox="0 0 16 12" style={{ width: '4.2cqw', height: '3.2cqw' }} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <path d="M1 4.2a10 10 0 0 1 14 0" />
        <path d="M3.6 7a6.2 6.2 0 0 1 8.8 0" />
        <circle cx="8" cy="10" r="1" fill={color} stroke="none" />
      </svg>
      <svg viewBox="0 0 27 13" style={{ width: '6.8cqw', height: '3.3cqw' }} fill="none">
        <rect x="0.5" y="0.5" width="22" height="12" rx="3.6" stroke={color} strokeOpacity="0.45" />
        <rect x="2" y="2" width="19" height="9" rx="2.4" fill={color} />
        <path d="M24.2 4.4v4.2c.9-.3 1.5-1.2 1.5-2.1s-.6-1.8-1.5-2.1Z" fill={color} fillOpacity="0.5" />
      </svg>
    </div>
  );
}

/** The phone Lock Screen as the app sets it: clock, then one text of the ayah (Arabic or a translation) and its reference. */
export default function LockScreen({ verse = SHOWCASE_VERSES[0], wallpaper = 'night', edition = 'translation', accent, serif = true, reference, className = '' }: Props) {
  const text = useMemo(() => ({ verse, edition, accent }), [verse, edition, accent]);
  const verseLayers = useLayers(text);
  const wallLayers = useLayers(wallpaper);

  const textStyle: CSSProperties = { textShadow: shadow };

  return (
    <div className={`absolute inset-0 overflow-hidden text-white ${className}`} style={{ containerType: 'inline-size' }}>
      {wallLayers.map((l) => (
        <FadeLayer key={l.id} show initiallyVisible={l.id === 0} seconds={0.9} className="absolute inset-0">
          <Wallpaper variant={l.value} />
        </FadeLayer>
      ))}
      {/* legibility veil */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.12),rgba(0,0,0,0) 35%,rgba(0,0,0,0.28))' }} aria-hidden="true" />

      {/* status bar */}
      <div className="absolute inset-x-0 flex items-center justify-between" style={{ top: '4.2cqw', height: '6cqw', padding: '0 8.5cqw 0 9.5cqw' }} aria-hidden="true">
        <span />
        <StatusBarIcons />
      </div>

      {/* lock glyph, date, clock */}
      <div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: '15cqw', ...textStyle }}>
        <svg viewBox="0 0 16 20" style={{ width: '4.2cqw', height: '5.2cqw', opacity: 0.9 }} fill="none" aria-hidden="true">
          <rect x="1.5" y="8.5" width="13" height="10" rx="2.6" fill="#fff" />
          <path d="M4.4 8.5V6a3.6 3.6 0 0 1 7.2 0v2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p className="font-medium" style={{ marginTop: '3.2cqw', fontSize: '4.7cqw', color: 'rgba(255,255,255,0.86)', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
          Friday, 20 June
        </p>
        <p
          className="font-semibold"
          style={{ fontSize: '27cqw', lineHeight: 1, letterSpacing: '-0.045em', color: 'rgba(255,255,255,0.94)', fontFamily: 'system-ui,-apple-system,sans-serif', fontVariantNumeric: 'tabular-nums' }}
        >
          9:41
        </p>
      </div>

      {/* the ayah, as the app sets it under the clock */}
      <div className="absolute inset-x-0" style={{ top: '61cqw', padding: '0 7cqw' }}>
        {verseLayers.map((l, i) => {
          const latest = i === verseLayers.length - 1;
          return (
            <FadeLayer
              key={l.id}
              show={latest}
              initiallyVisible={l.id === 0}
              seconds={0.9}
              ariaHidden={!latest}
              className="absolute inset-x-0 flex flex-col items-center text-center"
              style={{ padding: '0 7cqw', ...textStyle }}
            >
              {l.value.edition === 'arabic' ? (
                <p lang="ar" dir="rtl" className="font-quran" style={{ fontSize: '8.4cqw', lineHeight: 1.75, color: l.value.accent ?? GOLD }}>
                  {l.value.verse.arabic}
                </p>
              ) : (
                <p className={`${serif ? 'font-serif' : 'font-sans'} font-medium`} style={{ fontSize: '5.6cqw', lineHeight: 1.4, color: l.value.accent ?? 'rgba(255,255,255,0.96)' }}>
                  {l.value.verse.translation}
                </p>
              )}
              {/* the app draws the reference in the text colour at 78 %; on an Arabic edition it is the Arabic surah name in
                  the same Arabic face (Amiri Quran) at 0.78 x the verse size (WallpaperRenderer.referenceFontScale) */}
              {l.value.edition === 'arabic' ? (
                <p
                  {...refDir(true)}
                  className="font-quran"
                  style={{ marginTop: '2cqw', fontSize: '6.55cqw', lineHeight: 1.6, color: l.value.accent ?? GOLD, opacity: 0.78 }}
                >
                  {referenceOf(l.value.verse, true)}
                </p>
              ) : (
                <p className="font-semibold" style={{ marginTop: '4cqw', fontSize: '4.4cqw', color: l.value.accent ?? '#fff', opacity: 0.78 }}>
                  {reference ?? referenceOf(l.value.verse)}
                </p>
              )}
            </FadeLayer>
          );
        })}
      </div>

      {/* flashlight + camera */}
      <div className="absolute inset-x-0" style={{ bottom: '11.5cqw', padding: '0 9.5cqw' }} aria-hidden="true">
        <div className="flex items-center justify-between">
          {[
            <svg key="f" viewBox="0 0 24 24" style={{ width: '5.4cqw', height: '5.4cqw' }} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
              <path d="M7.5 3h9l-1.2 5.2a2 2 0 0 1-.4.8l-.9 1v10.2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10l-.9-1a2 2 0 0 1-.4-.8L7.5 3Z" />
              <path d="M12 12.5v3" />
            </svg>,
            <svg key="c" viewBox="0 0 24 24" style={{ width: '5.6cqw', height: '5.6cqw' }} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
              <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1.5 1.5 0 0 0 1.3-.8l.5-.9A1.5 1.5 0 0 1 10.8 3.5h2.4a1.5 1.5 0 0 1 1.3.8l.5.9a1.5 1.5 0 0 0 1.3.8h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
              <circle cx="12" cy="12.5" r="3.3" />
            </svg>,
          ].map((icon, i) => (
            <span key={i} className="grid place-items-center" style={{ width: '12.4cqw', height: '12.4cqw', borderRadius: '50%', background: 'rgba(20,16,44,0.5)', boxShadow: 'inset 0 0 0 0.25cqw rgba(255,255,255,0.1)' }}>
              {icon}
            </span>
          ))}
        </div>
      </div>

      {/* home indicator */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '2.6cqw', width: '34cqw', height: '1.3cqw', borderRadius: '1cqw', background: 'rgba(255,255,255,0.92)' }}
      />
    </div>
  );
}
