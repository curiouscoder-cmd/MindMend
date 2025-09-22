/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: '#bee9e8',
        ocean: '#62b6cb',
        navy: '#1b4965',
        sky: '#cae9ff',
        highlight: '#5fa8d3',
        // Backward-compatible aliases for existing class usage
        primary: {
          50: '#e9f7fb',   // light tint
          100: '#d7f0fb',
          200: '#cae9ff',  // sky
          300: '#bfe2f8',
          400: '#8ccce4',
          500: '#62b6cb',  // ocean
          600: '#5fa8d3',  // highlight
          700: '#3e8fb6',
          800: '#1b4965',  // navy
          900: '#14374b',
        },
        calm: {
          50: '#f2fcfb',   // near white mint
          100: '#e9f7f6',
          200: '#bee9e8',  // mint
          300: '#b1e0df',
          400: '#a4d7d6',
          500: '#8bc9cd',
          600: '#62b6cb',  // ocean as deeper calm
          700: '#5fa8d3',  // highlight variant
          800: '#2f6f8a',
          900: '#1b4965',  // navy
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        hand: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        soft: '0 4px 16px rgba(27, 73, 101, 0.08)',
        elevated: '0 10px 25px rgba(27, 73, 101, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'glow': 'glow 1.6s ease-in-out infinite',
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
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(98, 182, 203, 0.4)' },
          '70%': { boxShadow: '0 0 0 8px rgba(98, 182, 203, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(98, 182, 203, 0)' },
        },
      },
    },
  },
  plugins: [],
}
