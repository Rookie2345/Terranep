/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1220', // Primary deep background
          850: '#0F182A',
          800: '#142036',
          700: '#1C2C4A',
        },
        cyan: {
          glow: '#3DD6F5',
          accent: '#06B6D4',
        },
        quake: {
          light: '#FBBF24',
          moderate: '#FB923C',
          strong: '#F97316',
          major: '#EF4444',
          severe: '#DC2626',
        },
      },
      fontFamily: {
        nepali: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-cyan': '0 0 20px -3px rgba(61, 214, 245, 0.35)',
        'glow-orange': '0 0 20px -3px rgba(249, 115, 22, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
