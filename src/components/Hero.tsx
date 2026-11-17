import { useEffect, useState } from 'react';
import { ChevronRight, Languages, BookOpen, Smartphone, type LucideIcon } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';
import { SHOWCASE_VERSES } from '../data/showcaseVerses';
import PhoneFrame from './mockup/PhoneFrame';
import LockScreen from './mockup/LockScreen';
import { ReviewScreen } from './mockup/AppScreens';
import type { WallpaperVariant } from './mockup/Wallpaper';
import { usePrefersReducedMotion } from './mockup/utils';

// The review avatars the iOS app shows in onboarding, in the app's order (3, 2, 1). 96 px exports of the 400 px originals.
const avatars = [
  '/assets/avatars/review-3.jpg',
  '/assets/avatars/review-2.jpg',
  '/assets/avatars/review-1.jpg',
];

const WALLPAPERS: WallpaperVariant[] = ['night', 'emerald', 'dusk'];

// Demo loop (ms): the back phone shows the next ayah, a tap on "Make It Mine", the front Lock Screen takes it.
const T_TAP = 3200;
const T_RELEASE = 3550;
const T_FRONT = 3900;
const T_NEXT = 5400;
const T_PERIOD = 6500;
const editionOf = (i: number): 'arabic' | 'translation' => (i % 2 === 0 ? 'translation' : 'arabic');

/*
 * Layout. Two modes, chosen in CSS only (no JS, so the prerendered HTML is the final layout):
 *
 *  - "wide" (>= 1024px wide AND landscape-ish, aspect >= 1.1): text left, phones right, the hero is exactly one
 *    viewport tall (svh), content centred in the space under the fixed nav. The phone stage height --H comes
 *    from the viewport height (and is width-limited so the text column never gets squeezed), so the whole front
 *    phone is always visible.
 *  - "stacked" (phones, portrait tablets, narrow windows): text first, phones underneath. The stage takes the
 *    rest of the first screen (flex:1) and clips the phones at its bottom edge with a fade, so the top of the
 *    phone peeks in as a scroll invitation (or shows fully when the screen is tall enough).
 *
 * Everything inside the stage is sized from --H (stage height) so the phones, chips and pill scale together.
 * Nav bottom edge measured in the browser: 76px (< 768), 88px (md), 92px (lg+), plus safe-area / URL-bar inset.
 */
const HERO_CSS = `
.hero{--svh:1vh;--inset:calc(env(safe-area-inset-top,0px) + var(--browser-top-inset,0px));--nav:calc(4.75rem + var(--inset));--gap:clamp(.875rem,calc(var(--svh)*2.4),1.25rem)}
@supports (height:1svh){.hero{--svh:1svh}}
@media (min-width:768px){.hero{--nav:calc(5.5rem + var(--inset));--gap:clamp(1rem,calc(var(--svh)*2.4),1.5rem)}}
@media (min-width:1024px){.hero{--nav:calc(5.75rem + var(--inset))}}

.hero-fold{display:flex;flex-direction:column;min-height:calc(var(--svh)*100);padding-top:calc(var(--nav) + .75rem)}
.hero-text{text-align:center}
.hero-text > * + *{margin-top:var(--gap)}
.hero-h1{font-size:clamp(1.95rem,8.6vw,2.75rem);line-height:1.1}
.hero-sub{font-size:1rem;line-height:1.55;margin-inline:auto}
.hero-ctas{justify-content:center}

.hero-stage{--H:calc(clamp(14rem,66vw,18rem)*2.326);--cw:.43;position:relative;flex:1 1 0;min-height:9rem;margin-top:var(--gap);overflow:hidden;container-type:size}
.hero-comp{position:absolute;top:0;left:50%;width:calc(var(--H)*var(--cw));height:var(--H);transform:translateX(-50%)}
.hero-front{position:absolute;z-index:20;right:0;top:calc(var(--H)*.045);width:calc(var(--H)*.43)}
.hero-back{position:absolute;z-index:10;left:0;top:calc(var(--H)*.2);width:calc(var(--H)*.325);transform:rotate(-6deg);display:none}
.hero-chip{display:none;position:absolute;z-index:30}
.hero-chip-a{left:0;top:3%}
.hero-chip-b{left:9%;top:10.5%}
.hero-chip-c{left:0;bottom:3%}
.hero-fade{position:absolute;z-index:25;inset-inline:0;bottom:0;height:4.5rem;pointer-events:none}
.hero-pill{position:absolute;z-index:40;left:50%;bottom:.875rem;transform:translateX(-50%)}
.hero-chips-row{padding:.25rem 0 2rem}

@media (min-width:768px){
  .hero-text{padding-inline:1rem}
  .hero-h1{font-size:clamp(2.75rem,1.4rem + 3.4vw,3.5rem)}
  .hero-sub{font-size:1.125rem}
  .hero-stage{--H:clamp(34rem,calc(100cqh - .5rem),50rem);--cw:.72;min-height:18rem}
  .hero-back{display:block}
}

@media (max-width:767px){.hero-pill{display:none}}

@media (min-width:1024px) and (min-aspect-ratio:11/10){
  .hero-fold{flex-direction:row;align-items:center;gap:clamp(2rem,3.5vw,4rem);padding-top:calc(var(--nav) + 1rem);padding-bottom:1.5rem}
  .hero-text{flex:1 1 0;min-width:0;padding-inline:0;text-align:left;container-type:inline-size}
  .hero-h1{font-size:max(2.25rem,min(8.4cqw,calc(var(--svh)*6.4),3.5rem))}
  .hero-sub{font-size:clamp(1rem,calc(.55rem + .55vw + var(--svh)*.4),1.3rem)}
  .hero-ctas{justify-content:flex-start}
  .hero-sub{margin-inline:0}
  .hero-stage{--H:clamp(30rem,min(calc(var(--svh)*100 - var(--nav) - 2.5rem),calc(min(100vw,1600px)*.52)),46rem);flex:none;width:calc(var(--H)*.72);height:var(--H);min-height:0;margin-top:0;overflow:visible;container-type:normal}
  .hero-comp{inset:0;left:0;width:100%;height:100%;transform:none}
  .hero-fade{display:none}
  .hero-chip{display:inline-flex}
  .hero-chips-row{display:none}
  .hero-pill{left:auto;right:calc(var(--H)*.215);bottom:0;transform:translateX(50%)}
}

`;

/**
 * The truthful demo loop: the back phone shows the review sheet for the NEXT ayah, a tap lands on "Make It Mine",
 * then the front Lock Screen takes that ayah. Runs only while the back phone is visible (>= 768px), the tab is
 * visible and motion is allowed. First render is deterministic: front = 0, back = 1, not pressed, step 1.
 */
function useDemoLoop() {
  const reduced = usePrefersReducedMotion();
  const [wide, setWide] = useState(false);
  const [visible, setVisible] = useState(true);
  const [front, setFront] = useState(0);
  const [back, setBack] = useState(1);
  const [pressed, setPressed] = useState(false);
  const [tapKey, setTapKey] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    on();
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const running = wide && visible && !reduced;

  useEffect(() => {
    if (!running) {
      setPressed(false);
      setStep(1);
      // Paused between the front change and the back advance: move the back phone on, so the next tap shows a change.
      setBack((b) => (b === front ? (b + 1) % SHOWCASE_VERSES.length : b));
      return;
    }
    const target = back;
    const ids = [
      setTimeout(() => { setTapKey((k) => k + 1); setPressed(true); setStep(2); }, T_TAP),
      setTimeout(() => setPressed(false), T_RELEASE),
      setTimeout(() => { setFront(target); setStep(3); }, T_FRONT),
      setTimeout(() => { setBack((target + 1) % SHOWCASE_VERSES.length); setStep(1); }, T_NEXT),
      setTimeout(() => setCycle((c) => c + 1), T_PERIOD),
    ];
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, cycle]);

  return { front, back, pressed, tapKey, step, reduced, running };
}

type Cycle = ReturnType<typeof useDemoLoop>;

function Chip({ icon: Icon, label, className, delay, reduced }: { icon: LucideIcon; label: string; className: string; delay: number; reduced: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#241647]/90 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-white/90 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
      style={reduced ? undefined : { animation: `chipFloat 6s ease-in-out ${delay}s infinite` }}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-brand">
        <Icon size={14} strokeWidth={2.2} />
      </span>
      {label}
    </div>
  );
}

const FACTS: { icon: LucideIcon; label: string; delay: number; pos: string }[] = [
  { icon: Smartphone, label: 'Lock Screen + widget', delay: 0, pos: 'hero-chip-a' },
  { icon: Languages, label: '10 languages', delay: 1.5, pos: 'hero-chip-b' },
  { icon: BookOpen, label: 'All 114 surahs', delay: 3, pos: 'hero-chip-c' },
];

// Step caption (wide layout only): follows the loop. Gold step number + label, crossfading in step with the demo.
const STEPS = ['Pick an ayah', 'Tap Make It Mine', 'Set on your Lock Screen'];

// Outgoing label fades out first, the incoming one waits for it, so two labels never overlap mid-swap.
const swap = (on: boolean) => ({ opacity: on ? 1 : 0, transitionDelay: on ? '160ms' : '0ms' });

function StepPill({ cycle }: { cycle: Cycle }) {
  return (
    <div
      aria-hidden="true"
      className="hero-pill relative inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-brand/35 bg-[#241647]/95 py-2 pl-2.5 pr-4 text-[13px] font-semibold text-white shadow-[0_14px_34px_-10px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      {cycle.reduced ? (
        <span className="pl-1.5">Pick an ayah, tap Make It Mine</span>
      ) : (
        <>
          <span className="relative grid h-5 w-5 place-items-center rounded-full bg-brand/20 text-[11px] font-bold text-brand">
            {STEPS.map((_, i) => (
              <span key={i} className="absolute inset-0 grid place-items-center transition-opacity duration-150" style={swap(cycle.step === i + 1)}>
                {i + 1}
              </span>
            ))}
          </span>
          <span className="grid">
            {STEPS.map((label, i) => (
              <span key={label} className="col-start-1 row-start-1 transition-opacity duration-150" style={swap(cycle.step === i + 1)}>
                {label}
              </span>
            ))}
          </span>
        </>
      )}
    </div>
  );
}

// Phone mockup composition: the back phone (tablet width up) is the app's review sheet with the Make It Mine
// button; the front phone is the Lock Screen that takes the ayah after the tap.
function PhoneStage({ cycle }: { cycle: Cycle }) {
  const { front, back, pressed, tapKey, reduced } = cycle;

  return (
    <>
      <div
        role="img"
        aria-label="QuranWall example: the Make It Mine screen of the app and an iPhone Lock Screen that shows the chosen ayah in Arabic or a translation"
        className="hero-stage animate-fade-in-slide"
      >
        <div className="hero-comp">
          {/* soft gold glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(closest-side,rgba(217,185,104,0.22),rgba(217,185,104,0.07) 58%,transparent)' }}
          />

          {/* back phone: the review sheet with "Make It Mine" (tablet width and up) */}
          <div className="hero-back">
            <PhoneFrame>
              <ReviewScreen verse={SHOWCASE_VERSES[back]} edition={editionOf(back)} wallpaper={WALLPAPERS[back % WALLPAPERS.length]} pressed={pressed} tapKey={tapKey} />
              <div className="absolute inset-0 z-20 bg-black/10" aria-hidden="true" />
            </PhoneFrame>
          </div>

          {/* front phone: Lock Screen */}
          <div className="hero-front">
            <PhoneFrame>
              <LockScreen verse={SHOWCASE_VERSES[front]} edition={editionOf(front)} wallpaper={WALLPAPERS[front % WALLPAPERS.length]} />
            </PhoneFrame>
          </div>

          {/* floating fact chips (wide layout only; stacked layouts get a row under the first screen) */}
          {FACTS.map((f) => (
            <Chip key={f.label} icon={f.icon} label={f.label} delay={f.delay} reduced={reduced} className={`hero-chip ${f.pos}`} />
          ))}
        </div>

        {/* stacked layouts: the phone melts into the page where the first screen ends */}
        <div aria-hidden="true" className="hero-fade bg-gradient-to-t from-surface to-transparent" />
        <StepPill cycle={cycle} />
      </div>
    </>
  );
}

export default function Hero() {
  const cycle = useDemoLoop();

  return (
    <section className="hero relative bg-surface overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Static ambient glow - no GPU-heavy animations */}
        <div className="hidden md:block">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] animate-[pulse_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-brand/3 rounded-full blur-[100px] animate-[pulse_15s_ease-in-out_infinite_2s]" />
        </div>
        <div className="md:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[400px] bg-brand/5 rounded-full blur-[80px]" />
      </div>

      <div className="container-main relative">
        <div className="hero-fold">
          <div className="hero-text">
            <div className="inline-flex items-center gap-2.5 sm:gap-4 px-3.5 sm:px-5 py-2 sm:py-3 rounded-full bg-surface-card border-2 border-brand/30 animate-fade-up-d1">
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-surface-card object-cover ring-1 ring-brand/20"
                    loading="lazy"
                  />
                ))}
              </div>
              <span className="text-sm sm:text-base whitespace-nowrap text-white/70 font-medium">Trusted by 1,000+ believers</span>
            </div>

            <h1 className="hero-h1 font-bold text-white tracking-tight animate-fade-up-d2">
              The Quran
              <br />
              <span className="text-white/40">On Your Lock Screen</span>
            </h1>

            <p className="hero-sub text-white/60 max-w-lg animate-fade-up-d3">
              With QuranWall, pick any ayah, tap Make It Mine, and it becomes your iPhone Lock Screen wallpaper. Change it whenever you like.
            </p>

            <div className="hero-ctas flex flex-row flex-wrap gap-x-4 gap-y-3 items-center animate-fade-up-d4">
              <AppStoreButton href={appStoreUrl(CAMPAIGNS.home)} size="lg" />
              <a
                href={appStoreUrl(CAMPAIGNS.home)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center justify-center gap-2 px-6 sm:px-7 lg:px-8 h-12 lg:h-14 text-base lg:text-lg font-bold whitespace-nowrap text-brand-ink bg-brand rounded-xl shadow-[0_10px_30px_-6px_rgba(217,185,104,0.5)] transition-all duration-200 hover:bg-brand-light hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_rgba(217,185,104,0.6)]"
              >
                Get Started
                <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <PhoneStage cycle={cycle} />
        </div>

        {/* Stacked layouts: the fact chips sit just under the first screen (the wide layout floats them around the phones) */}
        <div className="hero-chips-row flex flex-wrap justify-center gap-2">
          {FACTS.map((f) => (
            <Chip key={f.label} icon={f.icon} label={f.label} delay={f.delay} reduced className="" />
          ))}
        </div>
      </div>
    </section>
  );
}
