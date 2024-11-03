/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mobile': '600px',
      'tablet': '800px',
      'laptop': '1000px'
    }
  },
  screens: {
    'mobile': '600px',
    'tablet': '800px',
    'laptop': '1000px',
  },
  plugins: [
    require('daisyui'),
  ],
}