const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        side: token('side'),
        raised: token('raised'),
        sunken: token('sunken'),
        ink: token('ink'),
        body: token('body'),
        muted: token('muted'),
        line: token('line'),
        accent: token('accent'),
        onaccent: token('onaccent'),
        again: token('again'),
        known: token('known'),
        streak: token('streak'),
        gold: token('gold'),
      },
      borderColor: { DEFAULT: token('line') },
      boxShadow: {
        soft: '0 1px 2px rgb(31 37 68 / 0.06), 0 4px 14px rgb(31 37 68 / 0.05)',
      },
      fontFamily: {
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
