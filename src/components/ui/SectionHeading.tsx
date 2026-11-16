import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  /** Muted second line of the headline (text-white/40). */
  muted?: ReactNode;
  /** Optional supporting paragraph under the headline. */
  children?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
  className?: string;
}

// One heading for every homepage section: gold tracked eyebrow with a short rule, bold DM Sans headline,
// muted second line. Keeps the rhythm identical from section to section.
export default function SectionHeading({
  eyebrow,
  title,
  muted,
  children,
  align = 'left',
  id,
  className = '',
}: SectionHeadingProps) {
  const center = align === 'center';
  return (
    <Reveal className={`${center ? 'text-center mx-auto' : 'text-left'} ${className}`}>
      <p
        className={`mb-5 flex items-center gap-3 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.2em] text-brand ${
          center ? 'justify-center' : ''
        }`}
      >
        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-brand/60" />
        {eyebrow}
        {center && <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-brand/60" />}
      </p>
      <h2 id={id} className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white">
        {title}
        {muted && (
          <>
            {' '}
            <span className="block text-white/40">{muted}</span>
          </>
        )}
      </h2>
      {children && (
        <p className={`mt-5 text-base sm:text-lg leading-relaxed text-white/60 ${center ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
          {children}
        </p>
      )}
    </Reveal>
  );
}
