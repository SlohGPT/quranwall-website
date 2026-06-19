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
  plugins: [],
};
