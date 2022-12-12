/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      spacing: {
        50: '12.5rem'
      }
    },
    textColor: theme => ({
      ...theme('colors'),
      menu: 'rgba(255, 255, 255, 0.75)'
    })
  },
  plugins: [],
}
