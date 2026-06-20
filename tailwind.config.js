import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // QuranWall brand accent — gold (matches the iOS app's Color.appGold ramp).
        brand: {
          DEFAULT: '#D9B968',
          light: '#E3C46B',
          dark: '#C2A451',
          glow: 'rgba(217, 185, 104, 0.4)',
          ink: '#0C0D24', // deep-indigo ink for text/icons placed ON a gold fill
        },
        // Alias used by inline link styling on the legal pages (text-primary).
        primary: '#D9B968',
        // QuranWall dark surfaces — warm deep purple-indigo (Color.appDark* ramp).
        surface: {
          DEFAULT: '#1E1338',
          elevated: '#2C1C58',
          card: '#362266',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      // Long-form legal pages (Privacy, Terms, EULA) use `prose prose-invert`.
      // Tune the inverted (dark-surface) variant to the brand: readable warm-white
      // body text, white headings, and gold accents for links/bullets.
      typography: {
        // Let the page's own max-w-4xl wrapper control measure, not prose's 65ch.
        DEFAULT: {
          css: { maxWidth: 'none' },
        },
        invert: {
          css: {
            '--tw-prose-invert-body': 'rgba(255, 255, 255, 0.78)',
            '--tw-prose-invert-headings': '#ffffff',
            '--tw-prose-invert-links': '#D9B968',
            '--tw-prose-invert-bold': '#ffffff',
            '--tw-prose-invert-counters': 'rgba(255, 255, 255, 0.6)',
            '--tw-prose-invert-bullets': 'rgba(217, 185, 104, 0.7)',
            '--tw-prose-invert-hr': 'rgba(255, 255, 255, 0.12)',
            '--tw-prose-invert-quotes': '#ffffff',
            '--tw-prose-invert-quote-borders': 'rgba(217, 185, 104, 0.5)',
            '--tw-prose-invert-captions': 'rgba(255, 255, 255, 0.6)',
            '--tw-prose-invert-th-borders': 'rgba(255, 255, 255, 0.22)',
            '--tw-prose-invert-td-borders': 'rgba(255, 255, 255, 0.12)',
          },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [typography],
};
