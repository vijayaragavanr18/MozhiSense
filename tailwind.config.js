/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'baloo': ['"Baloo 2"', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          'from': { transform: 'translateY(32px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
