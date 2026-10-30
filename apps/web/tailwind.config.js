/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nuit: { 950: '#0d0b10', 900: '#15121b', 800: '#1e1a26', 700: '#2a2433', 600: '#3a3245' },
        braise: { 300: '#ffc98a', 400: '#f9a65a', 500: '#ec8336', 600: '#c8621d' },
        parchemin: { 100: '#f4ead8', 200: '#e6d7bc', 300: '#cdb994' },
        mousse: { 400: '#7fc49a', 500: '#4fa574' },
        sang: { 400: '#f07b7b', 500: '#d94f4f' },
      },
      fontFamily: {
        titre: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        recit: ['"Literata"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        tumble: {
          '0%': { transform: 'rotate(0deg) scale(0.6)', opacity: '0' },
          '60%': { transform: 'rotate(600deg) scale(1.15)', opacity: '1' },
          '100%': { transform: 'rotate(720deg) scale(1)' },
        },
        fadein: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        flicker: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
      },
      animation: {
        tumble: 'tumble 1.1s cubic-bezier(.2,.8,.3,1) both',
        fadein: 'fadein .35s ease-out both',
        flicker: 'flicker 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
