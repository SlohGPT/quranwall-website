import { useEffect, useRef, useState } from 'react';

/** Container-query width unit helper: cq(5) -> "5cqw". Every mockup sizes itself from its own width. */
export const cq = (n: number) => `${n}cqw`;

/** SSR-safe prefers-reduced-motion (false on the server and on the first client render). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export type Layer<T> = { id: number; value: T };

/**
 * Keeps the previous value mounted for a moment so a change can crossfade.
 * Layer 0 is the first (deterministic) render; later layers are appended on change
 * and the older ones are dropped once the fade has settled.
 */
export function useLayers<T>(value: T, settleMs = 1100): Layer<T>[] {
  const [layers, setLayers] = useState<Layer<T>[]>([{ id: 0, value }]);
  const counter = useRef(0);

  useEffect(() => {
    setLayers((prev) => {
      if (Object.is(prev[prev.length - 1].value, value)) return prev;
      counter.current += 1;
      return [...prev, { id: counter.current, value }];
    });
  }, [value]);

  useEffect(() => {
    if (layers.length <= 1) return;
    const t = setTimeout(() => setLayers((p) => p.slice(-1)), settleMs);
    return () => clearTimeout(t);
  }, [layers, settleMs]);

  return layers;
}
