import { useRef, useEffect, useState } from 'react';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { usePrefersReducedMotion } from './mockup/utils';
import Reveal from './ui/Reveal';
import StarPattern from './ui/StarPattern';
import Icon, { type IconName } from './visuals/icons';

// NOTE: these numbers ship in the static/SSR HTML that crawlers and AI engines
// read, so they must be true and consistent with the rest of the site
// (Hero + FinalCTA both say "1,000+"). Update them all together when the real
// figures change. No App Store rating stat here yet — add one back (and the
// aggregateRating in index.html) only once there's a genuine public rating.
const stats: { value: number; label: string; suffix: string; icon: IconName }[] = [
  { value: 92, label: 'Early users feel closer to Allah', suffix: '%', icon: 'highlight' },
  { value: 1000, label: 'Believers using QuranWall', suffix: '+', icon: 'users' },
  { value: 114, label: 'Surahs, all searchable', suffix: '', icon: 'book' },
];

function formatCount(n: number, decimals: number, suffix: string) {
  if (decimals === 0 && n >= 1000) {
    return Math.floor(n).toLocaleString('en-US') + suffix;
  }
  return n.toFixed(decimals) + suffix;
}

function Counter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInViewOnce(ref, 0.5);
  const reduceMotion = usePrefersReducedMotion();
  // Render the FINAL value ("92%" / "1,000+" / "114") in SSR so crawlers and
  // AI bots that don't execute JS read the real numbers, not "0.0". The
  // count-up still runs on the client when the section scrolls into view
  // (off-screen on load, so users never see a reset). React-state-based update
  // means React tracks the text changes (no direct DOM mutation, no drift).
  const [display, setDisplay] = useState(() => formatCount(value, decimals, suffix));

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    // rAF tween 0 -> value over 1.6 s with an ease-out curve (same feel as the old cubic-bezier(0.22, 1, 0.36, 1)).
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(formatCount(value * eased, decimals, suffix));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, reduceMotion, value, decimals, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

export default function SocialProof() {
  return (
    <section aria-label="QuranWall in numbers" className="relative overflow-hidden bg-surface py-16 sm:py-20">
      <div className="container-main">
        <Reveal>
          <div className="relative">
            {/* hairlines top and bottom frame the band */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[min(90%,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.10),transparent)]" />
            <StarPattern opacity={0.03} />

            <dl className="relative grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse items-center justify-end px-6 py-10 text-center sm:py-14 lg:py-16">
                  <dt className="mt-3 max-w-[16rem] text-sm font-medium leading-snug text-white/60 sm:text-base">
                    {stat.label}
                  </dt>
                  <dd className="bg-gradient-to-b from-brand-light to-brand bg-clip-text text-6xl font-bold leading-none tracking-tight text-transparent sm:text-5xl lg:text-7xl">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </dd>
                  {/* flex-col-reverse: last in the DOM, first on screen. A pointed-arch badge, fixed 48x56 box. */}
                  <span aria-hidden="true" className="mb-5 flex h-14 w-12 items-center justify-center rounded-t-full border border-brand/35 bg-brand/[0.08] text-brand">
                    <Icon name={stat.icon} className="h-6 w-6" />
                  </span>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
