/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Poker green felt
        felt: {
          DEFAULT: '#1a5c38',
          dark: '#0f3d26',
          light: '#2a7a4b',
        },
      },
    },
  },
  plugins: [],
}
