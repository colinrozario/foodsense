/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#050505',
        'brand-dark': '#0F0F0F',
        'brand-gray': '#1F1F1F',
        'acid-green': '#CCFF00',
        'safe-green': '#10B981',
        'caution-yellow': '#F59E0B',
        'danger-red': '#EF4444',
      },
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
