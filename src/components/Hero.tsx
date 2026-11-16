import { ChevronRight } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';

const avatars = [
  '/assets/avatars/avatar-1.jpg',
  '/assets/avatars/avatar-2.jpg',
  '/assets/avatars/avatar-3.jpg',
];

// Phone/tablet App Store row (below the desktop breakpoint). On phones it sits in the
// text column, above the demo video; on tablets it stays under the video.
function MobileCtas({ className }: { className: string }) {
  return (
    <div className={className}>
      <AppStoreButton className="h-[56px] shrink-0" href={appStoreUrl(CAMPAIGNS.home)} />
      <a
        href={appStoreUrl(CAMPAIGNS.home)}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex shrink-0 items-center justify-center gap-2 px-6 h-[56px] text-base font-bold whitespace-nowrap text-brand-ink bg-brand rounded-2xl shadow-[0_10px_30px_-6px_rgba(217,185,104,0.5)] transition-all duration-200 hover:bg-brand-light hover:-translate-y-0.5"
      >
        Get Started
        <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-4 px-5 py-3 rounded-full bg-surface-card border-2 border-brand/30 mb-8 animate-fade-up-d1">
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-surface-card object-cover ring-1 ring-brand/20"
                    loading="lazy"
                  />
                ))}
              </div>
              <span className="text-base text-white/70 font-medium">Trusted by 1,000+ believers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-up-d2">
              Daily Quran
              <br />
              <span className="text-white/40">On Your Lock Screen</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 animate-fade-up-d3">
              Meet QuranWall, the app that transforms your iPhone lock screen into a daily moment with the Quran.
            </p>

            {/* Phones (below md): App Store row above the demo video */}
            <MobileCtas className="flex md:hidden flex-row flex-wrap gap-3 justify-center items-center w-full animate-fade-up-d4" />

            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden lg:flex flex-row gap-4 justify-start items-center animate-fade-up-d4">
              <AppStoreButton size="lg" href={appStoreUrl(CAMPAIGNS.home)} />
              <a
                href={appStoreUrl(CAMPAIGNS.home)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 h-[60px] text-lg font-bold text-brand-ink bg-brand rounded-2xl shadow-[0_10px_30px_-6px_rgba(217,185,104,0.5)] transition-all duration-200 hover:bg-brand-light hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_rgba(217,185,104,0.6)]"
              >
                Get Started
                <ChevronRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center lg:items-end animate-fade-in-slide">
            <div className="w-full max-w-[500px] flex flex-col items-center gap-8">
              {/* Demo video — the App Store preview clip already renders its own
                  iPhone, so it plays edge-to-edge over a soft brand glow rather
                  than inside a CSS phone frame. */}
              <div className="relative w-[270px] sm:w-[300px]">
                <div className="absolute -inset-10 bg-gradient-to-br from-brand/12 via-brand/4 to-transparent rounded-full blur-[90px] pointer-events-none" aria-hidden="true" />
                <video
                  className="relative w-full rounded-[2.25rem] border border-white/10 shadow-2xl bg-surface"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/quranwall-demo-poster.webp"
                  aria-label="QuranWall app demo: choosing a Quran verse and setting it as a daily iPhone lock screen"
                >
                  <source src="/quranwall-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Tablets (md to lg): App Store row stays below the video */}
              <MobileCtas className="hidden md:flex lg:hidden flex-row flex-wrap gap-3 justify-center items-center w-full mt-4 animate-fade-up-d6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
