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
  /** The post's own copy already says "free to download": show only the subscription half of the install line. */
  subscriptionOnly?: boolean;
  /** The post's own copy already says both "free to download" and "subscription": skip the price line. */
  omitPriceLine?: boolean;
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
 * Install card for the blog posts: app icon, one product line, install line, requirements, Apple's badge,
 * and on desktop (lg+) a QR code with "Copy link". No headings inside, and data-nosnippet on the card only,
 * so Google never lifts card text into a snippet. The server and the first client render produce identical
 * markup: the Android check runs in an effect (see useIsAndroid).
 */
export default function AppNudge({
  campaign,
  placement,
  title,
  description,
  subscriptionOnly = false,
  omitPriceLine = false,
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
      className={`rounded-2xl border border-brand/30 bg-brand/10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 text-left ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-4">
          <img
            src="/icon-app-180.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-[11px]"
            loading="lazy"
            decoding="async"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            {title ? (
              <>
                <p className="text-[19px] font-bold leading-snug text-white">{title}</p>
                {description && <p className="text-[16px] leading-snug text-white/80">{description}</p>}
              </>
            ) : (
              <p className="text-[17px] font-bold leading-snug text-white">
                A Quran ayah on your iPhone Lock Screen and Home Screen widget.
              </p>
            )}
            {!omitPriceLine && (
              <p className="text-[15px] leading-snug text-white/75">
                {subscriptionOnly ? facts.subscriptionLine : facts.installLine}
              </p>
            )}
            <p className="text-[15px] leading-snug text-white/65">{`iPhone · ${facts.minIOSText}`}</p>
            <RatingLine className="text-[15px] leading-snug text-white/65" />
            {isAndroid && <p className="text-[15px] leading-snug text-white/75">QuranWall is made for iPhone.</p>}
          </div>
        </div>
        {/* Apple's badge rules: clear space of at least a quarter of its height (11 px) on every side. */}
        <div className="mt-5">
          <AppStoreButton href={href} theme="light" />
        </div>
      </div>
      <InstallHandoff />
    </div>
  );
}
