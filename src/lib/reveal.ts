/**
 * The one shared observer behind every below-the-fold entrance (Reveal, counters). Elements are watched with an early
 * bottom margin (15 %), so they start fading before they enter the screen. Fallbacks, so nothing is ever left blank:
 * when scrolling stops (`scrollend`, or 150 ms after the last scroll event) every pending element whose top is above
 * the viewport bottom is shown at once; a back/forward restore (`pageshow` persisted) and a #hash change show all.
 */
type Callback = () => void;

const EARLY_MARGIN = '0px 0px 15% 0px';
const pending = new Map<Element, Callback>();
let io: IntersectionObserver | null = null;
let wired = false;
let timer = 0;

function fire(el: Element) {
  const cb = pending.get(el);
  if (!cb) return;
  pending.delete(el);
  io?.unobserve(el);
  cb();
}

function flush(onlyVisible: boolean) {
  for (const el of Array.from(pending.keys())) {
    if (!onlyVisible || el.getBoundingClientRect().top < window.innerHeight) fire(el);
  }
}

function wire() {
  if (wired) return;
  wired = true;
  const settle = () => flush(true);
  window.addEventListener('scrollend', settle, { passive: true });
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 150);
    },
    { passive: true },
  );
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) flush(false);
  });
  window.addEventListener('hashchange', () => flush(false));
}

/** Watches `el`; calls `cb` once, when it comes within 15 % of the viewport bottom (or the fallbacks fire). Returns a cancel function. */
export function whenNear(el: Element, cb: Callback): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb();
    return () => {};
  }
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) fire(e.target);
      },
      { rootMargin: EARLY_MARGIN, threshold: 0 },
    );
  }
  wire();
  pending.set(el, cb);
  io.observe(el);
  return () => {
    pending.delete(el);
    io?.unobserve(el);
  };
}

/** True when the page should show everything at once: reduced motion, a #hash entry, or a back/forward restore. */
export function skipMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (window.location.hash) return true;
  const nav = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'back_forward';
}
