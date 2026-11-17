import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import { glassCardClass, glassCardHoverClass } from './ui/GlassCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Scene } from './visuals';
import type { SceneName } from './visuals/scenes';

// In-body links from Home to the pages that answer the questions people ask before installing.
const links: { to: string; anchor: string; body: string; scene: SceneName }[] = [
  {
    to: '/features',
    scene: 'reading',
    anchor: 'Everything QuranWall does',
    body: 'The Lock Screen wallpaper, the Home Screen widget, translations in 10 languages and how you can customise the look.',
  },
  {
    to: '/blog/quran-verse-iphone-lock-screen',
    scene: 'lockscreen',
    anchor: 'How to put a Quran verse on your iPhone Lock Screen',
    body: 'A guide to getting an ayah onto the screen you see most.',
  },
  {
    to: '/blog/best-islamic-lock-screen-app-iphone',
    scene: 'fan',
    anchor: 'The best Islamic lock screen app for iPhone',
    body: 'A ranking of the apps that put Islamic content on your Lock Screen.',
  },
  {
    to: '/blog/best-muslim-app-for-iphone-2026',
    scene: 'grid',
    anchor: 'The best Muslim app for iPhone in 2026',
    body: 'An honest ranking of Muslim apps, and what each one is good for.',
  },
];

export default function ExploreMore() {
  return (
    <section id="learn-more" className="section-space relative overflow-hidden bg-gradient-to-b from-surface via-surface-elevated to-surface">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="container-main">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <SectionHeading eyebrow="Learn more" title="Before you download" className="lg:sticky lg:top-32" />

          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {links.map((link, i) => (
              <li key={link.to} className="flex">
                <Reveal delay={i * 0.08} className="flex w-full">
                  <Link
                    to={link.to}
                    className={`${glassCardClass} ${glassCardHoverClass} group flex w-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-7`}
                  >
                    <Scene name={link.scene} className="mx-auto mb-5 w-full max-w-[168px]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-3 block text-lg font-semibold leading-snug text-white sm:text-xl">
                      {link.anchor}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-white/60 sm:text-base">{link.body}</span>
                    <span
                      aria-hidden="true"
                      className="mt-6 flex h-10 w-10 items-center justify-center self-end rounded-full border border-white/10 bg-white/[0.04] text-brand transition duration-300 group-hover:border-brand/40 group-hover:bg-brand group-hover:text-brand-ink motion-reduce:transition-none"
                    >
                      <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
