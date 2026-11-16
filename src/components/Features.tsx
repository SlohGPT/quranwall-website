import { useEffect, useState, type ReactNode } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Ban, Image as ImageIcon, Plane, Search, WifiOff } from 'lucide-react';
import { APP_LANGUAGES, SHOWCASE_VERSES, VERSE_94_6_TRANSLATIONS } from '../data/showcaseVerses';
import PhoneFrame from './mockup/PhoneFrame';
import LockScreen from './mockup/LockScreen';
import QuranWidget, { referenceOf } from './mockup/QuranWidget';
import Wallpaper, { type WallpaperVariant } from './mockup/Wallpaper';
import { usePrefersReducedMotion } from './mockup/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

type TileProps = {
  title: string;
  description: string;
  className?: string;
  /** Extra classes for the title/description block (used to keep it clear of absolutely positioned art). */
  textClassName?: string;
  /** Absolutely positioned art that is allowed to bleed to the tile edges. */
  backdrop?: ReactNode;
  children?: ReactNode;
};

function Tile({ title, description, className = '', textClassName = '', backdrop, children }: TileProps) {
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -3 }}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-300 hover:border-brand/30 sm:p-7 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(90% 60% at 0% 0%,rgba(217,185,104,0.07),transparent 70%)' }}
      />
      {backdrop}
      <div className={`relative z-10 ${textClassName}`}>
        <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/55 sm:text-[15px]">{description}</p>
      </div>
      {children && <div className="relative z-10 mt-6 flex flex-1 flex-col justify-end">{children}</div>}
    </motion.article>
  );
}

/* 1. Lock Screen ---------------------------------------------------------------- */
function LockScreenArt() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full md:left-auto md:right-[-60px] md:translate-x-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2"
        style={{ background: 'radial-gradient(closest-side,rgba(217,185,104,0.2),transparent)' }}
      />
      <div
        role="img"
        aria-label="The top of an iPhone Lock Screen with the clock and Ash-Sharh 6 in the Saheeh International translation"
        className="absolute left-1/2 top-[160px] z-10 w-[250px] -translate-x-1/2 sm:w-[270px] md:left-auto md:right-[7%] md:top-[44px] md:translate-x-0 lg:left-1/2 lg:right-auto lg:top-[215px] lg:w-[300px] lg:-translate-x-1/2"
      >
        <PhoneFrame>
          <LockScreen verse={SHOWCASE_VERSES[0]} wallpaper="night" edition="translation" />
        </PhoneFrame>
      </div>
    </>
  );
}

/* 2. Home Screen widget --------------------------------------------------------- */
function WidgetArt() {
  return (
    <div
      role="img"
      aria-label="The QuranWall widget on an iPhone Home Screen, in a medium and a small size, each showing one ayah and its reference"
      className="relative flex flex-wrap items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.08] p-4"
    >
      <Wallpaper variant="dusk" />
      {/* soft, out-of-focus home screen icons behind the widgets */}
      <div aria-hidden="true" className="absolute inset-0 flex items-end justify-between px-5 pb-4 opacity-70">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-10 w-10 rounded-[11px] bg-white/25" style={{ opacity: 0.5 + (i % 3) * 0.15 }} />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-black/15 backdrop-blur-[6px]" />
      <div className="relative z-10 w-full max-w-[280px]">
        <QuranWidget size="medium" verse={SHOWCASE_VERSES[0]} />
      </div>
      <div className="relative z-10 w-[148px] shrink-0">
        <QuranWidget size="small" verse={SHOWCASE_VERSES[3]} />
      </div>
    </div>
  );
}

/* 3. Ten languages --------------------------------------------------------------- */
const LANGUAGE_OF: Record<string, string> = {
  English: 'English',
  Français: 'French',
  Deutsch: 'German',
  Türkçe: 'Turkish',
  'Bahasa Indonesia': 'Indonesian',
  'Bahasa Melayu': 'Malay',
  اردو: 'Urdu',
};

function LanguagesArt() {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (hover || reduced) return;
    const t = setInterval(() => setActive((i) => (i + 1) % (VERSE_94_6_TRANSLATIONS.length + 1)), 3600);
    return () => clearInterval(t);
  }, [hover, reduced]);

  const v = SHOWCASE_VERSES[0];
  // The app writes the surah name in the edition's language: Arabic script for the Arabic and Urdu editions.
  const choices = [
    { key: 'ar', lang: 'ar', dir: 'rtl', language: 'Arabic', name: 'Uthmani', text: v.arabic, arabic: true, arabicRef: true },
    ...VERSE_94_6_TRANSLATIONS.map((t) => ({ key: t.lang, lang: t.lang, dir: t.dir, language: t.language, name: t.name, text: t.text, arabic: false, arabicRef: t.lang === 'ur' })),
  ];
  const activeLanguage = choices[active].arabic ? 'Arabic' : LANGUAGE_OF[choices[active].language];

  return (
    <div className="flex flex-col gap-4" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="grid min-h-[132px] rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-4">
        {choices.map((t, i) => {
          const on = i === active;
          return (
            <div
              key={t.key}
              aria-hidden={on ? undefined : true}
              className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 text-center transition-[opacity,transform] duration-500 ease-out"
              style={{ opacity: on ? 1 : 0, transform: on ? 'translateY(0)' : 'translateY(5px)' }}
            >
              <p
                lang={t.lang}
                dir={t.dir}
                className={
                  t.arabic
                    ? 'font-quran text-[30px] leading-[2] text-brand-light sm:text-[34px]'
                    : 'font-serif text-[15px] font-medium leading-snug text-white sm:text-base'
                }
              >
                {t.text}
              </p>
              {t.arabicRef ? (
                <p lang="ar" dir="rtl" className="font-quran text-[14px] leading-[1.4] text-brand-light/80">{referenceOf(v, true)}</p>
              ) : (
                <p className="text-[12px] font-semibold text-brand-light/80">{referenceOf(v)}</p>
              )}
              <p className="flex items-center gap-2 text-[11px] text-white/50">
                <span lang={t.lang} dir={t.dir} className="font-semibold text-brand-light">{t.language}</span>
                <span aria-hidden="true">·</span>
                <span>{t.name}</span>
              </p>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-wrap justify-center gap-1.5" aria-label="The ten languages in the app: Arabic and nine translation languages">
        {APP_LANGUAGES.map((name) => {
          const on = name === activeLanguage;
          return (
            <li
              key={name}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-500 ${
                on ? 'border-brand/50 bg-brand/15 text-brand-light' : 'border-white/[0.08] bg-white/[0.04] text-white/60'
              }`}
            >
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* 4. Search ----------------------------------------------------------------------- */
const SEARCH_PLACEHOLDER = "Search ayahs or reference (e.g. 'mercy', 'Al-Baqarah 255')";
const SEARCH_RESULTS = [SHOWCASE_VERSES[0], SHOWCASE_VERSES[3]];

function SearchArt() {
  return (
    <div
      role="img"
      aria-label="The search field of the QuranWall Choose Your Ayah screen, with ayah results showing a reference and one text each: Ash-Sharh 6 and At-Talaq 3"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-black/25 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <Search size={16} className="shrink-0 text-white/50" />
        <span className="min-w-0 flex-1 truncate text-sm text-white/50">{SEARCH_PLACEHOLDER}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {SEARCH_RESULTS.map((v, i) => (
          <li
            key={v.key}
            className={`rounded-xl border px-3 py-2.5 ${
              i === 0 ? 'border-brand/30 bg-brand/[0.07]' : 'border-white/[0.06] bg-white/[0.03]'
            }`}
          >
            <p className="text-[12px] font-semibold text-brand-light">{referenceOf(v)}</p>
            <p className="mt-1 text-[13px] leading-snug text-white/80">{v.translation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 5. Customiser -------------------------------------------------------------------- */
const BACKGROUNDS: { id: WallpaperVariant; label: string }[] = [
  { id: 'night', label: 'Dark' },
  { id: 'emerald', label: 'Green' },
  { id: 'dusk', label: 'Violet' },
  { id: 'photo', label: 'Your photo' },
];
const FONTS = [
  { id: 'serif', label: 'Serif', cls: 'font-serif' },
  { id: 'sans', label: 'Sans', cls: 'font-sans' },
] as const;
const COLOURS = [
  { id: 'gold', label: 'Gold', value: '#E3C46B' },
  { id: 'white', label: 'White', value: '#FFFFFF' },
  { id: 'mint', label: 'Soft mint', value: '#B7E6CF' },
] as const;

function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{children}</p>;
}

function CustomiserArt() {
  const [bg, setBg] = useState<WallpaperVariant>('night');
  const [font, setFont] = useState<'serif' | 'sans'>('serif');
  const [colour, setColour] = useState<(typeof COLOURS)[number]['id']>('gold');
  const accent = COLOURS.find((c) => c.id === colour)!.value;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div
        role="img"
        aria-label="Preview of a Lock Screen showing Ash-Sharh 6 in the Saheeh International translation, with an example background, font and colour"
        className="relative aspect-[3/4] w-[190px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.14] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.7)]"
      >
        <div className="absolute left-0 top-0 w-full" style={{ aspectRatio: '1 / 2.17' }}>
          <LockScreen verse={SHOWCASE_VERSES[0]} wallpaper={bg} edition="translation" accent={accent} serif={font === 'serif'} />
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-5">
        <div role="group" aria-label="Background">
          <GroupLabel>Background</GroupLabel>
          <div className="flex gap-2.5">
            {BACKGROUNDS.map((b) => {
              const on = bg === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Background: ${b.label}`}
                  aria-pressed={on}
                  onClick={() => setBg(b.id)}
                  className="group/sw flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <span
                    className={`relative block h-[58px] w-11 overflow-hidden rounded-xl transition-all duration-200 group-focus-visible/sw:ring-2 group-focus-visible/sw:ring-brand ${
                      on ? 'ring-2 ring-brand ring-offset-2 ring-offset-[#241647]' : 'ring-1 ring-white/15 group-hover/sw:ring-white/40'
                    }`}
                  >
                    <Wallpaper variant={b.id} />
                    {b.id === 'photo' && (
                      <span className="absolute inset-0 grid place-items-center bg-black/25 text-white">
                        <ImageIcon size={16} />
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] font-medium ${on ? 'text-brand-light' : 'text-white/45'}`}>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-5">
          <div role="group" aria-label="Font">
            <GroupLabel>Font</GroupLabel>
            <div className="flex gap-2">
              {FONTS.map((f) => {
                const on = font === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-label={`Font: ${f.label}`}
                    aria-pressed={on}
                    onClick={() => setFont(f.id)}
                    className={`flex h-11 min-w-[56px] flex-col items-center justify-center rounded-xl border px-3 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
                      on ? 'border-brand/60 bg-brand/15 text-brand-light' : 'border-white/[0.1] bg-white/[0.04] text-white/70 hover:border-white/30'
                    }`}
                  >
                    <span className={`${f.cls} text-lg font-semibold leading-none`}>Aa</span>
                    <span className="mt-1 text-[9px] font-medium uppercase tracking-wider opacity-70">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div role="group" aria-label="Colour">
            <GroupLabel>Colour</GroupLabel>
            <div className="flex gap-1">
              {COLOURS.map((c) => {
                const on = colour === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Example text colour ${COLOURS.indexOf(c) + 1}`}
                    aria-pressed={on}
                    onClick={() => setColour(c.id)}
                    className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <span
                      className={`block h-7 w-7 rounded-full transition-all duration-200 ${
                        on ? 'ring-2 ring-white ring-offset-2 ring-offset-[#241647]' : 'ring-1 ring-white/20'
                      }`}
                      style={{ background: c.value }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 6. No ads, offline ----------------------------------------------------------------- */
function OfflineArt() {
  return (
    <div
      role="img"
      aria-label="Airplane mode switched on and Wi-Fi off, with a QuranWall widget still showing one ayah, and a No ads badge"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-bold text-brand-light">
          <Ban size={13} strokeWidth={2.4} />
          No ads
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FF9F0A] text-white">
            <Plane size={15} />
          </span>
          <span className="text-sm font-medium text-white">Airplane Mode</span>
          <span className="ml-auto flex h-6 w-10 items-center justify-end rounded-full bg-[#34C759] p-0.5">
            <span className="h-5 w-5 rounded-full bg-white shadow" />
          </span>
        </div>
        <div className="flex items-center gap-3 border-t border-white/[0.06] px-3.5 py-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white/70">
            <WifiOff size={15} />
          </span>
          <span className="text-sm font-medium text-white/80">Wi-Fi</span>
          <span className="ml-auto text-xs text-white/45">Off</span>
        </div>
      </div>
      <QuranWidget size="medium" verse={SHOWCASE_VERSES[4]} />
    </div>
  );
}

/* Section ------------------------------------------------------------------------------ */
export default function Features() {
  return (
    <section id="features" className="section-space relative bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%,rgba(217,185,104,0.06),transparent 70%)' }}
      />
      <div className="container-main relative">
        <MotionConfig reducedMotion="user">
          <div className="mb-14 text-center sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brand">Features</p>
              <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Made for the screen
                <br />
                <span className="text-white/40">you see most</span>
              </h2>
            </motion.div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-4 sm:gap-5 md:grid-cols-2 md:grid-flow-dense lg:auto-rows-[minmax(280px,auto)] lg:grid-cols-4"
          >
            <Tile
              title="The Quran on your Lock Screen"
              description="The ayah you choose, as your iPhone Lock Screen wallpaper, in Arabic or a translation."
              className="min-h-[540px] md:col-span-2 md:min-h-[480px] lg:row-span-2 lg:min-h-[620px]"
              // md only: the phone sits at right-[7%] w-[270px]; stop the text 16px short of its left edge (93% of the tile minus 270 + 28 padding + 16)
              textClassName="md:max-w-[calc(93%-262px)] lg:max-w-none"
              backdrop={<LockScreenArt />}
            />

            <Tile
              title="A Home Screen widget"
              description="Add the widget to your Home Screen or Lock Screen. Turn on auto-rotate and it shows a new ayah every day, every 8 hours or every hour."
              className="lg:col-span-2"
            >
              <WidgetArt />
            </Tile>

            <Tile title="Ten languages" description="Read it in Arabic or a translation: 10 languages." className="lg:col-span-2">
              <LanguagesArt />
            </Tile>

            <Tile title="All 114 surahs, searchable" description="Search all 114 surahs by surah, ayah or keyword.">
              <SearchArt />
            </Tile>

            <Tile
              title="Your background, font and colours"
              description="Pick a gradient, a photo from the gallery or your own photo, then choose the font and text colour you like."
              className="md:col-span-2 lg:col-span-2"
            >
              <CustomiserArt />
            </Tile>

            <Tile title="No ads. Offline browsing." description="QuranWall shows no ads. Browse and search all 114 surahs offline.">
              <OfflineArt />
            </Tile>
          </motion.div>
        </MotionConfig>
      </div>
    </section>
  );
}
