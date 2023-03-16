/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  important: true,
  content: ['./index.html', './src/components/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        50: '12.5rem'
      }
    },
    textColor: theme => ({
      ...theme('colors'),
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      secondary: 'rgba(0, 0, 0, 0.45)',
      menu: 'rgba(255, 255, 255, 0.75)'
    }),
    backgroundColor: theme => ({
      ...theme('colors'),
      primary: '#1890ff',
      'high-light': '#FFC069'
    }),
    borderColor: theme => ({
      ...theme('colors'),
      primary: '#1890ff'
    })
  },
  plugins: []
}
