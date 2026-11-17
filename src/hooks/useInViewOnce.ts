import { useEffect, useState, type RefObject } from 'react';

/** True once the element has been at least `amount` visible (0 to 1). One IntersectionObserver, disconnected after the first hit. */
export function useInViewOnce(ref: RefObject<Element>, amount = 0.5): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, seen]);
  return seen;
}
