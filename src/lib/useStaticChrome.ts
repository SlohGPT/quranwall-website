import { useEffect, useState } from 'react';

/**
 * Fixed chrome (the nav, the sticky install bar) stops being fixed when it would cover the page:
 * - while pinch-zoomed: window.visualViewport.scale above ZOOM_SCALE (trackpad or phone pinch);
 * - on short viewports: SHORT_VIEWPORT, which is Cmd+ zoom at 200 % and up on a 14" MacBook, and phones in landscape.
 *
 * The CSS side lives in index.css (`.chrome-pin`): the short-viewport media query works with no JS, and the
 * `vv-zoomed` class this hook toggles on <html> covers pinch zoom. SSR-safe: the server and the first client render
 * return false (the normal fixed header); the hook only reads the viewport after mount.
 */
export const ZOOM_SCALE = 1.01;
export const SHORT_VIEWPORT = '(max-height: 480px)';

export function isPinchZoomed(): boolean {
  if (typeof window === 'undefined') return false;
  const vv = window.visualViewport;
  return !!vv && vv.scale > ZOOM_SCALE;
}

export default function useStaticChrome(): boolean {
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    const mq = window.matchMedia(SHORT_VIEWPORT);
    const sync = () => {
      const zoomed = isPinchZoomed();
      document.documentElement.classList.toggle('vv-zoomed', zoomed);
      setIsStatic(zoomed || mq.matches);
    };
    sync();
    vv?.addEventListener('resize', sync);
    mq.addEventListener('change', sync);
    return () => {
      vv?.removeEventListener('resize', sync);
      mq.removeEventListener('change', sync);
      document.documentElement.classList.remove('vv-zoomed');
    };
  }, []);

  return isStatic;
}
