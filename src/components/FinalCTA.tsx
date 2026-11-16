import AppStoreButton from './AppStoreButton';
import Reveal from './ui/Reveal';
import StarPattern from './ui/StarPattern';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';

// Designed composition instead of a stock photo: the app icon with a gold halo over the star lattice.
export default function FinalCTA() {
  return (
    <section data-hides-sticky className="section-space bg-surface">
      <div className="container-main">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand/25 bg-gradient-to-b from-surface-elevated via-[#241748] to-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <StarPattern opacity={0.04} />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[44rem] max-w-none -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.22),transparent)]" />
            <div aria-hidden="true" className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

            <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-24 lg:py-28">
              {/* app icon with halo */}
              <div className="relative mb-10 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                <div aria-hidden="true" className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.45),transparent)]" />
                <div aria-hidden="true" className="absolute -inset-5 rounded-full border border-brand/25" />
                <div aria-hidden="true" className="absolute -inset-10 rounded-full border border-brand/10" />
                <img
                  src="/icon-app-256.png"
                  alt="QuranWall app icon"
                  width={112}
                  height={112}
                  className="relative h-full w-full rounded-[22%] shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(217,185,104,0.35)]"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h2 className="mb-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Start every day
                <br />
                <span className="text-white/40">with purpose</span>
              </h2>
              <p className="mb-9 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                Choose an ayah for your Lock Screen and see it every time you pick up your phone.
              </p>

              <AppStoreButton href={appStoreUrl(CAMPAIGNS.home)} />

              <p className="mt-8 text-sm text-white/60">
                Join <span className="font-semibold text-white">1,000+</span> believers
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
