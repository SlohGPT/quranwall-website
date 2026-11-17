import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'article';
}

/**
 * Gentle fade-up, once, for content below the first screen. The server (and a visitor without JS) gets plain visible
 * markup: after mount, only elements that are still below the fold get the `reveal-pending` class (opacity 0 plus a
 * small offset, see index.css) and lose it when they scroll into view. Anything already on screen is left alone.
 */
export default function Reveal({ children, delay = 0, y = 20, className = '', id, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight - 60) return;
    el.classList.add('reveal-pending');
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove('reveal-pending');
        io.disconnect();
        // The stagger delay belongs to the entrance only, not to later hover or focus transitions.
        timer = window.setTimeout(() => el.style.removeProperty('--reveal-delay'), (delay + 0.7) * 1000);
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      el.classList.remove('reveal-pending');
    };
  }, [delay]);

  const style = { '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px` } as CSSProperties;
  return createElement(as, { ref, id, className: `reveal ${className}`.trim(), style }, children);
}
