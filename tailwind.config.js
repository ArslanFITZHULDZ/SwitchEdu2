/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'sans-serif'] },
      boxShadow: { soft: '0 16px 45px rgba(36, 56, 113, .07)' }
    }
  },
  plugins: []
}
