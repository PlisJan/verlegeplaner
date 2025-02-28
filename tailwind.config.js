/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode:"class",
  theme: {
    extend: {
      colors: {
        primary: 'hsla(160, 100%, 37%, 1)',
      },
    },
  },
  plugins: [],
}
