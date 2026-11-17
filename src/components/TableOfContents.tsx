import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TocEntry } from '../lib/headings';

const RAIL_QUERY = '(min-width: 1180px)';
const TABLET_QUERY = '(min-width: 768px)';

/**
 * Table of contents, server-rendered as plain <a href="#id"> lists:
 * - under 1180 px a native <details> (closed on phones, opened on mount from 768 px up; the server cannot know the
 *   width, so it renders closed and the effect opens it, which causes no hydration mismatch);
 * - from 1180 px a sticky right rail, the same list, with the section in view highlighted.
 * Both carry data-toc; CSS shows one and hides the other, so every anchor is in the prerendered HTML either way.
 */
export default function TableOfContents({ entries, variant }: { entries: TocEntry[]; variant: 'details' | 'rail' }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== 'details') return;
    if (window.matchMedia(TABLET_QUERY).matches) detailsRef.current?.setAttribute('open', '');
  }, [variant]);

  useEffect(() => {
    if (variant !== 'rail') return;
    const mq = window.matchMedia(RAIL_QUERY);
    let io: IntersectionObserver | null = null;
    const start = () => {
      io?.disconnect();
      io = null;
      if (!mq.matches || typeof IntersectionObserver === 'undefined') return;
      const heads = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => !!el);
      io = new IntersectionObserver(
        (hits) => {
          const hit = hits.filter((h) => h.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (hit) setActive(hit.target.id);
        },
        { rootMargin: '-96px 0px -70% 0px' },
      );
      heads.forEach((h) => io!.observe(h));
    };
    start();
    mq.addEventListener('change', start);
    return () => {
      mq.removeEventListener('change', start);
      io?.disconnect();
    };
  }, [variant, entries]);

  const label = `On this page (${entries.length})`;

  if (variant === 'details') {
    return (
      <details ref={detailsRef} data-toc className="group mt-8 rounded-2xl border border-surface-border bg-surface-card min-[1180px]:hidden">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[16px] font-semibold text-white [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded-2xl">
          {label}
          <ChevronDown className="h-5 w-5 shrink-0 text-white/65 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <nav aria-label="On this page">
          <ol className="px-2 pb-2">
            {entries.map((e) => (
              <li key={e.id}>
                <a href={`#${e.id}`} className="flex min-h-[44px] items-center rounded-lg px-2 text-[15px] leading-snug text-white/80 hover:text-white">
                  {e.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    );
  }

  return (
    <aside data-toc className="hidden min-[1180px]:block">
      <nav
        aria-label="On this page"
        className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto pr-1"
      >
        <p className="mb-3 text-[15px] font-semibold text-white">{label}</p>
        <ol className="space-y-0.5 border-l border-white/10">
          {entries.map((e) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                aria-current={active === e.id ? 'location' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 text-[15px] leading-snug transition-colors ${
                  active === e.id ? 'border-brand text-white' : 'border-transparent text-white/65 hover:text-white'
                }`}
              >
                {e.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
