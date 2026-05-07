/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    keyframes: {
      glitch: {
        '0%, 100%': { transform: 'translate(0)' },
        '33%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(90deg)' },
        '66%': { transform: 'translate(2px, -2px)', opacity: '0.8' },
      }
    }
  },
  },
  plugins: [],
}
