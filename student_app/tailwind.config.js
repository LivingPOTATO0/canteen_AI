/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tomato: {
          50: '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff5252', // Main Brand Color
          600: '#ed1c1c',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Premium font
      }
    },
  },
  plugins: [],
}