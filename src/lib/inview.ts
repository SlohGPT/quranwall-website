import { useEffect, useRef } from 'react';

/**
 * The one shared IntersectionObserver of the visual layer. It only toggles classes: `is-inview` while the figure is
 * on screen (loops run only then, see index.css) and `is-seen`, set once, which plays the entrance. With no JS or
 * before hydration neither class is there, so every figure shows its finished state.
 */
let io: IntersectionObserver | null = null;

function observer(): IntersectionObserver | null {
  if (!io && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle('is-inview', e.isIntersecting);
          if (e.isIntersecting) e.target.classList.add('is-seen');
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
  }
  return io;
}

/** Ref for the element that carries the animated figure. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    const o = observer();
    if (!el || !o) return;
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return ref;
}
