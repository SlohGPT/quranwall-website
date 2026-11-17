import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type Props = {
  /** Visible (true) or fading out (false). */
  show: boolean;
  /** First layer: renders fully visible straight away (server and first client render agree). Later layers fade in. */
  initiallyVisible: boolean;
  seconds: number;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
  children: ReactNode;
};

/** One crossfading layer of a mockup (CSS opacity transition; replaces framer-motion's initial/animate pair). */
export default function FadeLayer({ show, initiallyVisible, seconds, className, style, ariaHidden, children }: Props) {
  const [entered, setEntered] = useState(initiallyVisible);
  useEffect(() => {
    if (entered) return;
    // two frames, so the opacity 0 state is painted before the transition to 1 starts
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [entered]);

  return (
    <div
      className={className}
      style={{ ...style, opacity: show && entered ? 1 : 0, transition: `opacity ${seconds}s ease-in-out` }}
      aria-hidden={ariaHidden ? true : undefined}
    >
      {children}
    </div>
  );
}
