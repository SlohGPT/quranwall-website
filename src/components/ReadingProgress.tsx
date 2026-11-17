import { useEffect, useRef } from 'react';

/**
 * 2 px reading-progress bar for long posts: fixed at the top edge, scaleX driven from a passive scroll listener inside
 * requestAnimationFrame, no React state. Decorative (aria-hidden); the bar reads the article element's extent.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const target = document.getElementById(targetId);
    if (!bar || !target) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      bar.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div ref={barRef} className="h-full origin-left bg-brand" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
