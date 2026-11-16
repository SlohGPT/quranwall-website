import { useEffect, useState } from 'react';
import { ChevronRight, Languages, BookOpen, Smartphone, type LucideIcon } from 'lucide-react';
import { motion, MotionConfig } from 'framer-motion';
import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';
import { SHOWCASE_VERSES } from '../data/showcaseVerses';
import PhoneFrame from './mockup/PhoneFrame';
import LockScreen from './mockup/LockScreen';
import HomeScreen from './mockup/HomeScreen';
import type { WallpaperVariant } from './mockup/Wallpaper';
import { usePrefersReducedMotion } from './mockup/utils';

const avatars = [
  '/assets/avatars/avatar-1.jpg',
  '/assets/avatars/avatar-2.jpg',
  '/assets/avatars/avatar-3.jpg',
];

// Phone/tablet App Store row (below the desktop breakpoint). On phones it sits in the
// text column, above the phone mockup; on tablets it stays under the mockup.
function MobileCtas({ className }: { className: string }) {
  return (
    <div className={className}>
      <AppStoreButton href={appStoreUrl(CAMPAIGNS.home)} />
      <a
        href={appStoreUrl(CAMPAIGNS.home)}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex shrink-0 items-center justify-center gap-2 px-6 h-11 text-base font-bold whitespace-nowrap text-brand-ink bg-brand rounded-xl shadow-[0_10px_30px_-6px_rgba(217,185,104,0.5)] transition-all duration-200 hover:bg-brand-light hover:-translate-y-0.5"
      >
        Get Started
        <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
}

const WALLPAPERS: WallpaperVariant[] = ['night', 'emerald', 'dusk'];
const CYCLE_MS = 5500;

function Chip({ icon: Icon, label, className, delay, reduced }: { icon: LucideIcon; label: string; className: string; delay: number; reduced: boolean }) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#241647]/90 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-white/90 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-brand">
        <Icon size={14} strokeWidth={2.2} />
      </span>
      {label}
    </motion.div>
  );
}

// Phone mockup composition: the front phone cycles through the verified ayat and
// wallpapers; a second phone with the Home Screen widget sits behind it on large screens.
function PhoneComposition() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SHOWCASE_VERSES.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [paused, reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="img"
        aria-label="QuranWall on an iPhone Lock Screen showing an ayah in Arabic with the Saheeh International translation"
        className="relative flex w-full max-w-[420px] flex-col items-center lg:block lg:h-[640px] lg:w-[420px] lg:max-w-none xl:h-[680px] xl:w-[500px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* soft gold glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(closest-side,rgba(217,185,104,0.22),rgba(217,185,104,0.07) 58%,transparent)' }}
        />

        {/* back phone: Home Screen + widget (lg and up) */}
        <div className="absolute left-0 top-[150px] z-10 hidden w-[196px] -rotate-[6deg] lg:block xl:w-[230px]">
          <PhoneFrame>
            <HomeScreen verse={SHOWCASE_VERSES[3]} wallpaper="night" />
            <div className="absolute inset-0 z-20 bg-black/25" aria-hidden="true" />
          </PhoneFrame>
        </div>

        {/* front phone: Lock Screen */}
        <div className="relative z-20 w-[260px] sm:w-[280px] lg:absolute lg:right-0 lg:top-[48px] lg:w-[262px] xl:w-[300px]">
          <PhoneFrame>
            <LockScreen verse={SHOWCASE_VERSES[index]} wallpaper={WALLPAPERS[index % WALLPAPERS.length]} />
          </PhoneFrame>
        </div>

        {/* floating chips: a row under the phone on small screens, floating around the phones on lg */}
        <div className="z-30 mt-8 flex flex-wrap justify-center gap-2 lg:contents">
          <Chip icon={Smartphone} label="Lock Screen + widget" delay={0} reduced={reduced} className="lg:absolute lg:left-0 lg:top-[26px]" />
          <Chip icon={Languages} label="10 languages" delay={1.5} reduced={reduced} className="lg:absolute lg:bottom-[44px] lg:left-[18px]" />
          <Chip icon={BookOpen} label="All 114 surahs" delay={3} reduced={reduced} className="lg:absolute lg:bottom-[2px] lg:right-[34px]" />
        </div>
      </div>
    </MotionConfig>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Static ambient glow - no GPU-heavy animations */}
        <div className="hidden md:block">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] animate-[pulse_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-brand/3 rounded-full blur-[100px] animate-[pulse_15s_ease-in-out_infinite_2s]" />
        </div>
        <div className="md:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[400px] bg-brand/5 rounded-full blur-[80px]" />
      </div>

      <div className="container-main relative pt-32 md:pt-40 pb-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-surface-card border-2 border-brand/30 mb-8 animate-fade-up-d1">
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-surface-card object-cover ring-1 ring-brand/20"
                    loading="lazy"
                  />
                ))}
              </div>
              <span className="text-sm sm:text-base whitespace-nowrap text-white/70 font-medium">Trusted by 1,000+ believers</span>
            </div>

            <h1 className="text-[2.125rem] sm:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-up-d2">
              Daily Quran
              <br />
              <span className="text-white/40">On Your Lock Screen</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 animate-fade-up-d3">
              Meet QuranWall, the app that transforms your iPhone lock screen into a daily moment with the Quran.
            </p>

            {/* Phones (below md): App Store row above the phone mockup */}
            <MobileCtas className="flex md:hidden flex-row flex-wrap gap-3 justify-center items-center w-full animate-fade-up-d4" />

            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden lg:flex flex-row gap-4 justify-start items-center animate-fade-up-d4">
              <AppStoreButton href={appStoreUrl(CAMPAIGNS.home)} />
              <a
                href={appStoreUrl(CAMPAIGNS.home)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-7 h-11 text-base font-bold text-brand-ink bg-brand rounded-xl shadow-[0_10px_30px_-6px_rgba(217,185,104,0.5)] transition-all duration-200 hover:bg-brand-light hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_rgba(217,185,104,0.6)]"
              >
                Get Started
                <ChevronRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center lg:items-end animate-fade-in-slide">
            <div className="w-full max-w-[500px] flex flex-col items-center gap-8 lg:max-w-none lg:items-end">
              <PhoneComposition />

              {/* Tablets (md to lg): App Store row stays below the phone */}
              <MobileCtas className="hidden md:flex lg:hidden flex-row flex-wrap gap-3 justify-center items-center w-full mt-4 animate-fade-up-d6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
