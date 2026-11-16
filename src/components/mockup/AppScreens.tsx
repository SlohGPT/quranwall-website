import { motion } from 'framer-motion';
import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { SHOWCASE_VERSES, type ShowcaseVerse } from '../../data/showcaseVerses';
import LockScreen, { StatusBarIcons, type Edition } from './LockScreen';
import { referenceOf, refDir } from './QuranWidget';
import Wallpaper, { type WallpaperVariant } from './Wallpaper';
import { useLayers, usePrefersReducedMotion } from './utils';

// Coded mini versions of the QuranWall app screens for the How it works storyboard. Purely presentational:
// no focusable elements, no motion, every size in container-query units so they scale with the phone they
// sit in (put them inside <PhoneFrame>). The only Arabic is the verse from showcaseVerses.ts.

const INK = '#0C0D24';
const GOLD = '#E3C46B';
const GOLD_DEEP = '#D9B968';
const APP_BG = '#191738';
const ELEV = '#2D2B66'; // the app's elevated surface (search bar, tab track, editor box)
const VERSE = SHOWCASE_VERSES[0]; // 94:6

const root: CSSProperties = { containerType: 'inline-size' };
const sans: CSSProperties = { fontFamily: 'system-ui,-apple-system,sans-serif' };

function Screen({ background, children }: { background: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden text-white" style={{ ...root, background, ...sans }}>
      <div className="absolute inset-x-0 flex items-center justify-between" style={{ top: '4.2cqw', height: '6cqw', padding: '0 8.5cqw 0 9.5cqw' }} aria-hidden="true">
        <span />
        <StatusBarIcons />
      </div>
      {children}
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '2.6cqw', width: '34cqw', height: '1.3cqw', borderRadius: '1cqw', background: 'rgba(255,255,255,0.85)' }}
      />
    </div>
  );
}

/* 1. The App Store page */
export function AppStoreScreen() {
  return (
    <Screen background="#0b0b13">
      <div className="absolute flex items-center" style={{ top: '17cqw', left: '5.5cqw', right: '5.5cqw', gap: '4cqw' }}>
        <img
          src="/icon-app-180.png"
          alt=""
          width={180}
          height={180}
          loading="lazy"
          decoding="async"
          className="shrink-0"
          style={{ width: '25cqw', height: '25cqw', borderRadius: '5.6cqw', boxShadow: '0 1cqw 3cqw rgba(0,0,0,0.5)' }}
        />
        <div className="min-w-0">
          <p className="font-bold" style={{ fontSize: '5.6cqw', lineHeight: 1.15 }}>Quran Widget: QuranWall</p>
          <p style={{ fontSize: '3.9cqw', lineHeight: 1.3, marginTop: '1cqw', color: 'rgba(255,255,255,0.55)' }}>Lifestyle</p>
        </div>
      </div>

      <div className="absolute flex items-center justify-between" style={{ top: '49cqw', left: '5.5cqw', right: '5.5cqw' }}>
        <span className="font-bold uppercase" style={{ fontSize: '4.4cqw', letterSpacing: '0.04em', padding: '2cqw 7.5cqw', borderRadius: '9cqw', background: 'rgba(255,255,255,0.14)', color: '#4da3ff' }}>
          Get
        </span>
        <svg viewBox="0 0 24 24" style={{ width: '6cqw', height: '6cqw' }} fill="none" stroke="#4da3ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 15V4M8 7.5 12 3.5l4 4" />
          <path d="M6.5 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5" />
        </svg>
      </div>

      {/* screenshot strip: two Lock Screens, the second cut by the edge like on the real page */}
      <div className="absolute flex" style={{ top: '95cqw', left: '5.5cqw', gap: '3.5cqw' }} aria-hidden="true">
        {(['night', 'emerald'] as const).map((variant) => (
          <div key={variant} className="relative shrink-0 overflow-hidden" style={{ width: '50cqw', height: '104cqw', borderRadius: '5cqw', boxShadow: 'inset 0 0 0 0.3cqw rgba(255,255,255,0.14)' }}>
            <Wallpaper variant={variant} />
            <p className="absolute inset-x-0 text-center font-semibold" style={{ top: '16cqw', fontSize: '11cqw', lineHeight: 1, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.9)' }}>9:41</p>
            <p lang="ar" dir="rtl" className="absolute inset-x-0 text-center font-quran" style={{ top: '40cqw', padding: '0 4cqw', fontSize: '5.8cqw', lineHeight: 1.8, color: GOLD }}>
              {VERSE.arabic}
            </p>
            <p {...refDir(true)} className="absolute inset-x-0 text-center font-quran" style={{ top: '62cqw', fontSize: '4.5cqw', lineHeight: 1.6, color: GOLD, opacity: 0.78 }}>{appRef(VERSE, true)}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/** The app writes the reference as the surah name and the ayah number, e.g. "Ash-Sharh 6". */
function appRef(v: ShowcaseVerse, arabic = false) {
  return referenceOf(v, arabic);
}

const SEARCH_PLACEHOLDER = "Search ayahs or reference (e.g. 'mercy', 'Al-Baqarah 255')";

/* 2. Choose an ayah: the picker (Explore / Search / Write), search field, language button, results */
export function ChooseAyahScreen() {
  const tabs = ['Explore', 'Search', 'Write'];
  const picked = SHOWCASE_VERSES[0]; // 94:6, one edition: the translation
  const others = [SHOWCASE_VERSES[1], SHOWCASE_VERSES[2]];
  return (
    <Screen background={APP_BG}>
      <p className="absolute font-bold" style={{ top: '15cqw', left: '5.5cqw', fontSize: '7cqw', lineHeight: 1.1 }}>
        Choose Your Ayah
      </p>

      {/* Explore / Search / Write capsule, gold pill on the selected segment */}
      <div className="absolute flex" style={{ top: '28cqw', left: '5.5cqw', right: '5.5cqw', padding: '1cqw', gap: '1cqw', borderRadius: '9cqw', background: ELEV }}>
        {tabs.map((t) => {
          const on = t === 'Search';
          return (
            <span key={t} className="flex-1 text-center font-semibold" style={{ fontSize: '4.1cqw', lineHeight: '10.4cqw', borderRadius: '9cqw', background: on ? GOLD_DEEP : 'transparent', color: on ? INK : '#fff' }}>
              {t}
            </span>
          );
        })}
      </div>

      {/* search field + Language button */}
      <div className="absolute flex items-center" style={{ top: '45cqw', left: '5.5cqw', right: '5.5cqw', gap: '3cqw' }}>
        <div className="flex min-w-0 flex-1 items-center" style={{ height: '11.5cqw', padding: '0 2.8cqw', gap: '2cqw', borderRadius: '2.6cqw', background: ELEV }}>
          <svg viewBox="0 0 24 24" style={{ width: '4.4cqw', height: '4.4cqw', flexShrink: 0 }} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <span className="min-w-0 flex-1 truncate" style={{ fontSize: '3.7cqw', color: 'rgba(255,255,255,0.5)' }}>{SEARCH_PLACEHOLDER}</span>
        </div>
        <span className="flex shrink-0 items-center font-semibold" style={{ height: '8cqw', padding: '0 2.6cqw', gap: '1.1cqw', borderRadius: '9cqw', background: ELEV, color: GOLD_DEEP, fontSize: '3.4cqw' }}>
          <svg viewBox="0 0 24 24" style={{ width: '3.4cqw', height: '3.4cqw' }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
          </svg>
          Language
          <svg viewBox="0 0 24 24" style={{ width: '2.6cqw', height: '2.6cqw' }} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {/* results: the picked ayah (one edition + reference), then more */}
      <div className="absolute" style={{ top: '64cqw', left: '5.5cqw', right: '5.5cqw' }}>
        <div className="relative" style={{ padding: '4.5cqw 4.5cqw 4cqw', borderRadius: '4.4cqw', background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 0.45cqw ${GOLD_DEEP}` }}>
          <span className="absolute grid place-items-center" style={{ top: '3cqw', right: '3cqw', width: '6cqw', height: '6cqw', borderRadius: '50%', background: GOLD_DEEP }} aria-hidden="true">
            <svg viewBox="0 0 24 24" style={{ width: '3.8cqw', height: '3.8cqw' }} fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <p className="font-semibold" style={{ fontSize: '3.9cqw', color: GOLD_DEEP }}>{appRef(picked)}</p>
          <p className="font-medium" style={{ marginTop: '1.6cqw', paddingRight: '7cqw', fontSize: '4.5cqw', lineHeight: 1.4, color: 'rgba(255,255,255,0.92)' }}>{picked.translation}</p>
        </div>
        {others.map((v) => (
          <div key={v.key} style={{ marginTop: '3cqw', padding: '4.5cqw 4.5cqw 4cqw', borderRadius: '4.4cqw', background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-semibold" style={{ fontSize: '3.9cqw', color: GOLD_DEEP }}>{appRef(v)}</p>
            <p className="font-medium" style={{ marginTop: '1.6cqw', fontSize: '4.5cqw', lineHeight: 1.4, color: 'rgba(255,255,255,0.8)' }}>{v.translation}</p>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0" style={{ height: '40cqw', background: `linear-gradient(to bottom,rgba(25,23,56,0),${APP_BG} 85%)` }} />
    </Screen>
  );
}

/* 3. The review sheet: reference, edition, editable text, styling toolbar, wallpaper preview, "Make It Mine" */
type ReviewProps = {
  verse?: ShowcaseVerse;
  edition?: Edition;
  /** Button pressed state (scale + brightness), driven by the hero. */
  pressed?: boolean;
  /** Increment to play the tap ripple on the button (0 or unchanged = none). */
  tapKey?: number;
  wallpaper?: WallpaperVariant;
};

const RIPPLE_CSS = `@keyframes qwReviewRipple{from{transform:translate(-50%,-50%) scale(0.15);opacity:0.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes qwReviewTouch{0%{transform:translate(-50%,-50%) scale(1.5);opacity:0}18%{transform:translate(-50%,-50%) scale(1);opacity:1}62%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1.15);opacity:0}}`;

const toolIcon: CSSProperties = { width: '5.2cqw', height: '5.2cqw' };
const toolProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'rgba(255,255,255,0.85)', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: toolIcon, 'aria-hidden': true };

/** Fades between the previous and the current content of a sheet region (same idea as LockScreen). */
function Faded<T>({ layers, className, style, render }: { layers: { id: number; value: T }[]; className?: string; style?: CSSProperties; render: (v: T) => ReactNode }) {
  return (
    <div className={className} style={style}>
      {layers.map((l, i) => {
        const latest = i === layers.length - 1;
        return (
          <motion.div
            key={l.id}
            className="absolute inset-x-0 top-0"
            initial={l.id === 0 ? false : { opacity: 0 }}
            animate={{ opacity: latest ? 1 : 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            aria-hidden={latest ? undefined : true}
          >
            {render(l.value)}
          </motion.div>
        );
      })}
    </div>
  );
}

export function ReviewScreen({ verse = SHOWCASE_VERSES[0], edition = 'translation', pressed = false, tapKey = 0, wallpaper = 'night' }: ReviewProps) {
  const reduced = usePrefersReducedMotion();
  const content = useMemo(() => ({ verse, edition }), [verse, edition]);
  const layers = useLayers(content);

  return (
    <Screen background={APP_BG}>
      <style>{RIPPLE_CSS}</style>

      {/* nav row */}
      <div className="absolute flex items-center justify-between" style={{ top: '13cqw', left: '5.5cqw', right: '5.5cqw', height: '9cqw', fontSize: '4.6cqw' }}>
        <span style={{ color: GOLD_DEEP }}>Cancel</span>
      </div>

      {/* reference + edition name */}
      <Faded
        layers={layers}
        className="absolute"
        style={{ top: '24cqw', left: '5.5cqw', right: '5.5cqw', height: '16cqw' }}
        render={(c) => (
          <div>
            <p {...refDir(c.edition === 'arabic')} className="font-bold" style={{ fontSize: '7.2cqw', lineHeight: 1.15, color: GOLD_DEEP, textAlign: 'left' }}>{appRef(c.verse, c.edition === 'arabic')}</p>
            <p className="font-medium" style={{ marginTop: '2cqw', fontSize: '3.85cqw', color: 'rgba(255,255,255,0.55)' }}>
              {c.edition === 'arabic' ? 'Arabic — Uthmani' : c.verse.translationName}
            </p>
          </div>
        )}
      />

      {/* Edit Ayah Text */}
      <p className="absolute flex items-center font-bold" style={{ top: '42cqw', left: '6.5cqw', gap: '1.8cqw', fontSize: '3.6cqw', color: 'rgba(255,255,255,0.55)' }}>
        <svg viewBox="0 0 24 24" style={{ width: '4cqw', height: '4cqw' }} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15.5 4.5 19.5 8.5 8.5 19.5 4 20l.5-4.5L15.5 4.5Z" />
          <path d="M3 22.5h8" />
        </svg>
        Edit Ayah Text
      </p>

      {/* editor box */}
      <div className="absolute overflow-hidden" style={{ top: '49cqw', left: '5.5cqw', right: '5.5cqw', height: '25cqw', borderRadius: '4.1cqw', background: ELEV }}>
        <Faded
          layers={layers}
          className="absolute inset-0"
          render={(c) =>
            c.edition === 'arabic' ? (
              <p lang="ar" dir="rtl" className="font-quran" style={{ padding: '3.4cqw', fontSize: '7.4cqw', lineHeight: 1.75, color: '#fff' }}>{c.verse.arabic}</p>
            ) : (
              <p style={{ padding: '3.4cqw', fontSize: '4.4cqw', lineHeight: 1.4, color: '#fff' }}>{c.verse.translation}</p>
            )
          }
        />
      </div>

      {/* styling toolbar: font, colour, alignment, highlight, size, shadow (generic icons) */}
      <div className="absolute flex items-center justify-around" style={{ top: '78cqw', left: '5.5cqw', right: '5.5cqw', height: '12cqw', borderRadius: '4.1cqw', background: ELEV }} aria-hidden="true">
        <svg {...toolProps}><path d="M4 19 10 5l6 14M6.2 14h7.6M16.5 19l3.5-8 2 4.5" /></svg>
        <span style={{ width: '5cqw', height: '5cqw', borderRadius: '50%', background: GOLD, boxShadow: '0 0 0 0.5cqw rgba(255,255,255,0.35)' }} />
        <svg {...toolProps}><path d="M4 6h16M7 12h10M5 18h14" /></svg>
        <svg {...toolProps}><path d="m4 16 8-10 5 4-8 10-5 0 0-4Z" /><path d="M14 20h6" /></svg>
        <svg {...toolProps}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>
        <svg {...toolProps}><rect x="4" y="4" width="11" height="11" rx="2.4" /><path d="M18.5 9v8.5a2 2 0 0 1-2 2H9" /></svg>
      </div>

      {/* wallpaper preview, partly cut by the button area */}
      <div className="absolute overflow-hidden" style={{ top: '94cqw', bottom: '30cqw', left: 0, right: 0 }} aria-hidden="true">
        <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden" style={{ top: 0, width: '54cqw', height: '116cqw', borderRadius: '6cqw', boxShadow: 'inset 0 0 0 0.3cqw rgba(255,255,255,0.16)' }}>
          <LockScreen verse={verse} edition={edition} wallpaper={wallpaper} />
        </div>
      </div>

      {/* bottom: divider + Make It Mine */}
      <div className="absolute inset-x-0 bottom-0" style={{ background: APP_BG, paddingBottom: '9cqw' }}>
        <div style={{ height: '0.3cqw', background: 'rgba(255,255,255,0.12)', marginBottom: '4cqw' }} />
        <div
          className="relative mx-auto flex items-center justify-center overflow-hidden font-bold"
          style={{
            width: '89cqw',
            height: '15cqw',
            gap: '2.2cqw',
            borderRadius: '4.1cqw',
            fontSize: '4.7cqw',
            background: GOLD_DEEP,
            color: INK,
            boxShadow: '0 1.3cqw 2.6cqw rgba(217,185,104,0.3)',
            transform: pressed ? 'scale(0.96)' : 'scale(1)',
            filter: pressed ? 'brightness(1.1)' : 'none',
            transition: reduced ? 'none' : 'transform 0.18s ease-out, filter 0.18s ease-out',
          }}
        >
          Make It Mine
          <svg viewBox="0 0 24 24" style={{ width: '5.6cqw', height: '5.6cqw' }} aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill={INK} />
            <path d="M6.5 12h10M12.5 7.5 17 12l-4.5 4.5" fill="none" stroke={GOLD_DEEP} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {tapKey > 0 && !reduced && (
            <span
              key={tapKey}
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{ left: '50%', top: '50%', width: '90cqw', height: '90cqw', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'qwReviewRipple 0.7s ease-out forwards' }}
            />
          )}
        </div>
        {/* touch indicator, like iOS screen recordings show a finger tap */}
        {tapKey > 0 && !reduced && (
          <span
            key={`t${tapKey}`}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ left: '62%', top: '11.8cqw', width: '12cqw', height: '12cqw', borderRadius: '50%', background: 'rgba(255,255,255,0.42)', boxShadow: 'inset 0 0 0 0.5cqw rgba(255,255,255,0.85), 0 0.8cqw 3cqw rgba(0,0,0,0.3)', opacity: 0, animation: 'qwReviewTouch 0.95s ease-out forwards' }}
          />
        )}
      </div>
    </Screen>
  );
}
