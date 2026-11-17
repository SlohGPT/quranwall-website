import { useInView } from '../../lib/inview';
import { FILL, GOLD, GOLD2, NIGHT } from './primitives';
import { PATHS, type IconName } from './icons';

/** The five beats of the how-to (same order as the HowTo schema), one icon each. */
const STEPS: IconName[] = ['store', 'search', 'palette', 'setup', 'widget'];
const X = [32, 96, 160, 224, 288];

/**
 * A step diagram in a fixed 320x64 box: five icon nodes on a line. The connectors draw once when the figure scrolls
 * into view and a gold spark travels the line on a slow loop (CSS only, paused off screen, off under reduced motion).
 * Decorative: the numbered steps below carry the meaning.
 */
export default function StepDiagram({ className = '' }: { className?: string }) {
  const ref = useInView<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden="true" className={className}>
      <svg
        viewBox="0 0 320 64"
        width="320"
        height="64"
        focusable="false"
        className="qa-scene"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {X.slice(0, -1).map((x, i) => (
          <path key={x} d={`M${x + 24} 32H${X[i + 1] - 24}`} stroke={GOLD2} strokeOpacity=".6" strokeWidth="2" className="qa-draw" style={{ ['--i' as string]: i }} />
        ))}
        <g className="qa-loop qa-travel">
          <circle cx={32} cy={32} r={3.5} fill={GOLD} stroke="none" />
        </g>
        {X.map((x, i) => (
          <g key={x} className="qa-in" style={{ ['--i' as string]: i }}>
            <circle cx={x} cy={32} r={22} fill={i === 3 ? FILL : NIGHT} stroke={GOLD2} />
            <g transform={`translate(${x - 12} 20)`}>
              <path d={PATHS[STEPS[i]]} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
