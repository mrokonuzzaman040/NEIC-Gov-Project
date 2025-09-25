import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './messages/**/*.json'
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-noto-sans)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'bengali': ['SolaimanLipi', 'Kalpurush', 'var(--font-noto-sans-bengali)', 'Noto Sans Bengali', 'Mukti', 'Lohit Bengali', 'sans-serif'],
        'english': ['var(--font-noto-sans)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mixed': ['SolaimanLipi', 'Kalpurush', 'var(--font-noto-sans-bengali)', 'var(--font-noto-sans)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          green: '#22c55e',
          red: '#ef4444',
          white: '#ffffff'
        },
        accent: '#22c55e',
        danger: '#ef4444',
        muted: '#6b7280',
        bg: '#f9fafb'
      },
      boxShadow: {
        card: '0 6px 18px rgba(2,6,23,0.04)',
        hero: '0 6px 20px rgba(3,18,26,0.06)'
      }
    }
  },
  plugins: []
};

export default config;
