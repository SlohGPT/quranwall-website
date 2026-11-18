import { Star } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import InstallHandoff from './InstallHandoff';
import { appStoreUrl } from '../lib/app-store';
import { useIsAndroid } from '../hooks/useIsAndroid';
import facts from '../data/facts.json';

interface AppNudgeProps {
  /** App Store campaign token for this placement (CAMPAIGNS.blogMid or CAMPAIGNS.blogEnd in src/lib/app-store.ts). */
  campaign: string;
  /** Where the card sits, written to data-install-card. */
  placement: 'mid' | 'end';
  /**
   * End card: the post's own closing copy. Both are plain paragraphs (a card holds no headings) and replace
   * the default product line. The mid card passes neither.
   */
  title?: string;
  description?: string;
  className?: string;
}

/** "4.5 on the US App Store", only while facts.rating.show is on. Public App Store data, no structured data. */
export function RatingLine({ className = '' }: { className?: string }) {
  if (!facts.rating.show) return null;
  return (
    <p className={`flex items-center gap-1.5 ${className}`}>
      <Star className="h-4 w-4 shrink-0 fill-current text-amber-300" aria-hidden="true" />
      <span>{`${facts.rating.value} on the ${facts.rating.storefront.toUpperCase()} App Store`}</span>
    </p>
  );
}

/**
 * Install card for the blog posts, centered (2026-11-18): app icon, one product line, requirements, Apple's badge
 * at 56/64 px, and on desktop (lg+) a small "On a computer?" line that opens the QR code and "Copy link". No headings inside, and data-nosnippet on the card only,
 * so Google never lifts card text into a snippet. The server and the first client render produce identical
 * markup: the Android check runs in an effect (see useIsAndroid).
 */
export default function AppNudge({
  campaign,
  placement,
  title,
  description,
  className = '',
}: AppNudgeProps) {
  const href = appStoreUrl(campaign);
  const isAndroid = useIsAndroid();

  return (
    <div
      role="group"
      aria-label="Get QuranWall on iPhone"
      data-install-card={placement}
      data-nosnippet=""
      className={`relative isolate overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-b from-brand/[0.16] to-brand/[0.04] px-6 py-8 text-center sm:px-10 sm:py-10 ${className}`}
    >
      {/* soft glow behind the icon; decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-44 w-[30rem] max-w-full -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand/25 blur-3xl" />
      <img
        src="/icon-app-180.png"
        alt=""
        width={72}
        height={72}
        className="mx-auto h-[72px] w-[72px] rounded-[18px] shadow-[0_14px_34px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
        loading="lazy"
        decoding="async"
      />
          {title && <p className="mt-5 text-[22px] font-bold leading-snug text-white sm:text-[24px]">{title}</p>}
      <p className={title ? 'mx-auto mt-2 max-w-[30rem] text-[16px] leading-relaxed text-white/75' : 'mx-auto mt-5 max-w-[28rem] text-[20px] font-bold leading-snug text-white [text-wrap:balance] sm:text-[22px]'}>
        {title ? description : 'A Quran ayah on your iPhone Lock Screen and Home Screen widget.'}
      </p>
          {/* one row, but each fact its own item: the install line stays a standalone line (lint free-download-prose) */}
          <ul className="mt-2 flex flex-wrap justify-center gap-x-2 text-[15px] leading-snug text-white/60">
            {['iPhone', facts.minIOSText, facts.installLine.replace(/\.$/, '')].map((t, k) => (
              <li key={t} className={k > 0 ? "before:mr-2 before:content-['·']" : undefined}>
                {t}
              </li>
            ))}
          </ul>
          <RatingLine className="mt-1 justify-center text-[15px] leading-snug text-white/60" />
          {isAndroid && <p className="mt-1 text-[15px] leading-snug text-white/75">QuranWall is made for iPhone.</p>}
      {/* Apple's badge rules: clear space of at least a quarter of its height (14-16 px) on every side. */}
      <div className="mt-7 flex justify-center">
        <AppStoreButton theme="light" size="xl" href={href} />
      </div>
      <InstallHandoff collapsed className="mt-6" />
    </div>
  );
}
