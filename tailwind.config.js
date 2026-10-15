/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cioco: {
          dark: '#4A3B32',
          brown: '#5C4033',
          cream: '#F5EBE6',
          bg: '#FDFBF7',
          blue: '#00A3FF'
        }
      }
    },
  },
  plugins: [],
}