import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { skipMotion, whenNear } from '../../lib/reveal';

interface RevealProps {
  children: ReactNode;
  /** Seconds. Capped at 0.18 (the whole stagger of a group stays within 180 ms). */
  delay?: number;
  /** Rise in px, capped at 16. */
  y?: number;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'article';
}

/**
 * Gentle fade-up, once, for content below the first screen. The server (and a visitor without JS) gets plain visible
 * markup: after mount, only elements that are still below the viewport get the `reveal-pending` class (opacity 0 plus a
 * small offset, see index.css) and lose it a little before they scroll into view (shared observer in lib/reveal.ts,
 * with scrollend / 150 ms, back/forward and #hash fallbacks). Anything already on or above the screen, reduced motion,
 * a back/forward restore and a #hash entry are left alone.
 */
export default function Reveal({ children, delay = 0, y = 14, className = '', id, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const d = Math.min(delay, 0.18);

  useEffect(() => {
    const el = ref.current;
    if (!el || skipMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('reveal-pending');
    let timer: number | undefined;
    const cancel = whenNear(el, () => {
      el.classList.remove('reveal-pending');
      // The stagger delay belongs to the entrance only, not to later hover or focus transitions.
      timer = window.setTimeout(() => el.style.removeProperty('--reveal-delay'), (d + 0.6) * 1000);
    });
    return () => {
      cancel();
      window.clearTimeout(timer);
      el.classList.remove('reveal-pending');
    };
  }, [d]);

  const style = { '--reveal-delay': `${d}s`, '--reveal-y': `${Math.min(y, 16)}px` } as CSSProperties;
  return createElement(as, { ref, id, className: `reveal ${className}`.trim(), style }, children);
}
