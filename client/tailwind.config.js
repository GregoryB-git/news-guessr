/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: {
          50: '#fbfbfa',
          100: '#f7f6f3',
          200: '#eceae4',
          800: '#1e2229',
          900: '#14181f',
          950: '#0d1015',
        },
        editorial: {
          ink: '#111827',
          gold: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4',
          crimson: '#ef4444',
        },
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        pop: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
