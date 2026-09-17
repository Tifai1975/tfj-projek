/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,ts}',
    './components/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        orari: {
          red: '#CC0000',
          'red-dark': '#A80000',
          yellow: '#F5B800',
          'yellow-dark': '#D4A000',
          navy: '#1E3A5F',
          'navy-light': '#2A4A7F',
          'navy-dark': '#152844',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}