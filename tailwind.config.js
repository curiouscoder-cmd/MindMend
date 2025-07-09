/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffe4d6',
          200: '#ffd6e0',
          300: '#ffe9b3',
          400: '#ffe6a7',
          500: '#ffd59a',
          600: '#fbbf77',
          700: '#f59e42',
          800: '#e07a2b',
          900: '#b45309',
        },
        calm: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#b6e2d3',
          500: '#a7f3d0',
          600: '#6ee7b7',
          700: '#34d399',
          800: '#059669',
          900: '#065f46',
        },
        accent: {
          50: '#fdf6f0',
          100: '#fbeee6',
          200: '#f7d6e0',
          300: '#f9c6d3',
          400: '#fbb1b1',
          500: '#f9848a',
          600: '#f87171',
          700: '#ef4444',
          800: '#be123c',
          900: '#881337',
        },
      },
      fontFamily: {
        hand: ['"Caveat"', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
