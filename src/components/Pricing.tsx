import { Check } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import StarPattern from './ui/StarPattern';
import { glassCardClass } from './ui/GlassCard';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';

// Feature list mirrors the live App Store listing. No prices, plan names or trial lengths:
// the App Store shows the price before you subscribe.
const features = [
  'An ayah on your Lock Screen wallpaper and Home Screen widget',
  'Uthmani Arabic beside a translation, in 10 languages',
  'Your own background (a preset or your own photo), font and colours',
  'All 114 surahs searchable by surah, ayah or keyword',
  'No ads',
  'Works offline',
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-space relative overflow-hidden bg-gradient-to-b from-surface via-surface-elevated to-surface">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <StarPattern opacity={0.025} fade="left" />
      <div className="container-main relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
          <SectionHeading eyebrow="Pricing" title="Free to download." muted="With an in-app subscription.">
            The App Store shows the price and billing period before you subscribe.
          </SectionHeading>

          <Reveal delay={0.1}>
            <div className={`${glassCardClass} overflow-hidden p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-9`}>
              <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.16),transparent)]" />

              <p className="relative mb-6 text-lg font-bold text-white">What QuranWall does</p>
              <ul className="relative mb-9 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 ring-1 ring-brand/40">
                      <Check size={14} strokeWidth={3} className="text-brand" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="relative border-t border-white/[0.08] pt-7">
                <AppStoreButton href={appStoreUrl(CAMPAIGNS.pricing)} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
