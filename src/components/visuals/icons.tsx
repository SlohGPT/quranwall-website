import { starPath } from './primitives';

/** Line icons on a 24 grid, 1.5 px stroke, round caps and joins. Decorative: always aria-hidden. */
const PATHS = {
  /** Lightbulb. */
  tip: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z',
  /** The pointed arch with an exclamation mark. */
  important: 'M5 21V12C5 8 9 5 12 2.5 15 5 19 8 19 12v9ZM12 9.5v5M12 17.6v.01',
  /** Crescent. */
  highlight: 'M16 4.5A8.5 8.5 0 1 0 19.5 16 7 7 0 0 1 16 4.5Z',
  /** Khatam (8-point star). */
  answer: starPath(12, 12, 9.5),
  /** Phone with a few lines: setting it up. */
  setup: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM10.5 5.6h3M9 12h6M9.5 15h5',
  /** Arch with a question mark. */
  questions: 'M5 21V12C5 8 9 5 12 2.5 15 5 19 8 19 12v9ZM10.3 10.4a1.9 1.9 0 1 1 2.6 1.7c-.5.3-.9.7-.9 1.3M12 16.4v.01',
  /** Padlock: privacy. */
  privacy: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6ZM12 15v2',
  /** Envelope. */
  mail: 'M4 6h16v12H4ZM4.5 6.5 12 13l7.5-6.5',
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = 'h-6 w-6' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
