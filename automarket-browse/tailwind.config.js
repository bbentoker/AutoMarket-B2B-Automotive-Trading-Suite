/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'c-red': 'rgba(32, 191, 182, 1)',
        'c-red-dark': 'rgba(20, 150, 143, 1)',
        'c-white': 'rgba(255, 255, 255, 1)',
        'c-grey': 'rgba(246, 246, 246, 1)',
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}