/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    
  ],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html'
  ],
  theme: {    
    extend: {
      colors: {
        'parmas': '#00E892',
        'active': '#0093E9',
        'main':'#80D0C7'
        },
      backgroundImage: {
        'header_bg': "url('/assets/bg1.jpg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    
  },
 
}
