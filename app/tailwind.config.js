/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colours resolve to CSS vars so the light/dark + silver-glass theme
      // can switch via [data-theme] without dark: variants everywhere.
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        sub: 'var(--sub)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        accentOn: 'var(--accent-on)',
        accentSoft: 'var(--accent-soft)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        tile: '20px',
        sheet: '28px',
      },
      boxShadow: {
        tile: 'var(--shadow-tile)',
        pop: 'var(--shadow-pop)',
      },
      maxWidth: {
        col: '480px',
      },
    },
  },
  plugins: [],
}
