import { starPath } from './primitives';

/** Line icons on a 24 grid, 1.5 px stroke, round caps and joins. Decorative: always aria-hidden. */
export const PATHS = {
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
  /** Phone with a down arrow: get the app. */
  store: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM12 8v6M9.5 11.5 12 14l2.5-2.5',
  /** Magnifier: search. */
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20',
  /** Palette: background, font, colour. */
  palette: 'M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.4-1-2.5 0-1 .8-1.6 1.9-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3ZM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
  /** Four tiles: the widget. */
  widget: 'M4 4h6.5v6.5H4ZM13.5 4H20v6.5h-6.5ZM4 13.5h6.5V20H4ZM13.5 13.5H20V20h-6.5Z',
  /** Globe: languages. */
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z',
  /** Wi-Fi with a slash: offline. */
  offline: 'M3 9a14 14 0 0 1 4-2.5M21 9a14 14 0 0 0-8-3.9M6 12.5a9 9 0 0 1 3-1.8M18 12.5a9 9 0 0 0-3.5-2.1M9.5 16a4.5 4.5 0 0 1 5 0M12 19.5v.01M4 4l16 16',
  /** Two people. */
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.3 2.7-6 6.5-6s6.5 2.7 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.3c2 .8 3.5 2.7 3.5 5.7',
  /** Open book. */
  book: 'M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5ZM12 6.5v13',
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
