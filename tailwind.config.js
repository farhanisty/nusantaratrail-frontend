/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf4e7',
          100: '#fbe3c0',
          200: '#f7c97a',
          300: '#f3ae34',
          400: '#e99a1a',
          500: '#c97d10',
          600: '#a6620c',
          700: '#824b09',
          800: '#5e3607',
          900: '#3a2104',
        },
        batik: '#1a0a2e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
