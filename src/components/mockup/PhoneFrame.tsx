import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const metal = 'linear-gradient(135deg,#8b8e99 0%,#4a4c55 16%,#2b2c32 42%,#3d3f47 68%,#6e717b 88%,#a2a5af 100%)';
const buttonMetal = 'linear-gradient(90deg,#1e1f24,#5b5e68 45%,#2a2b31)';

/**
 * A modern iPhone drawn in CSS. The frame is its own size container: set its width from
 * the parent (w-[260px], w-full ...) and everything inside scales (container query units).
 */
export default function PhoneFrame({ children, className = '', style }: Props) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ containerType: 'inline-size', aspectRatio: '1 / 2.1', ...style }}
    >
      {/* side buttons (behind the frame so only the outer edge shows) */}
      <span aria-hidden="true" className="absolute" style={{ left: '-0.75cqw', top: '14%', width: '1.2cqw', height: '3.4%', borderRadius: '0.5cqw', background: buttonMetal }} />
      <span aria-hidden="true" className="absolute" style={{ left: '-0.75cqw', top: '20.5%', width: '1.2cqw', height: '6.4%', borderRadius: '0.5cqw', background: buttonMetal }} />
      <span aria-hidden="true" className="absolute" style={{ left: '-0.75cqw', top: '28.5%', width: '1.2cqw', height: '6.4%', borderRadius: '0.5cqw', background: buttonMetal }} />
      <span aria-hidden="true" className="absolute" style={{ right: '-0.75cqw', top: '25%', width: '1.2cqw', height: '10%', borderRadius: '0.5cqw', background: buttonMetal, transform: 'scaleX(-1)' }} />

      {/* titanium band */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: '15.5cqw',
          background: metal,
          boxShadow: [
            'inset 0 0 0 0.3cqw rgba(255,255,255,0.28)',
            'inset 0 0 1.2cqw rgba(0,0,0,0.5)',
            '0 3cqw 6cqw -1cqw rgba(0,0,0,0.45)',
            '0 14cqw 28cqw -4cqw rgba(0,0,0,0.6)',
          ].join(','),
        }}
      >
        {/* black bezel */}
        <div
          className="absolute"
          style={{ inset: '0.9cqw', borderRadius: '14.6cqw', background: '#000', boxShadow: 'inset 0 0 0 0.2cqw rgba(255,255,255,0.06)' }}
        >
          {/* screen */}
          {/* clip-path + isolation: WebKit ignores overflow + radius for children on their own compositing layer (transform, animation, filter) */}
          <div className="absolute overflow-hidden" style={{ inset: '1.7cqw', borderRadius: '12.9cqw', background: '#05040f', clipPath: 'inset(0 round 12.9cqw)', isolation: 'isolate' }}>
            {children}
            {/* dynamic island */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 z-30 -translate-x-1/2 bg-black"
              style={{ top: '2.5cqw', width: '29cqw', height: '8.4cqw', borderRadius: '9cqw' }}
            />
            {/* glass reflection */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30"
              style={{ background: 'linear-gradient(115deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0) 32%)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
