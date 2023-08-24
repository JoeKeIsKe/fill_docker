/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    
  ],
  content: [
    './pages/**/*.{js,jsx,tsx,mdx}',
    './components/**/*.{js,jsx,tsx,mdx}',
    './app/**/*.{js,jsx,tsx,mdx}',
    './public/**/*.html'
  ],
  theme: {    
    extend: {
      colors: {
        "border":'#e5e7eb',
        'parmas': '#1e40af',
        'hover': '#0093E9',
        'active': '#0273b5',
        bgColor: 'rgba(255,255,255,0.6)',
        bgHover:'rgba(0,232,146,0.2)',
        },
      backgroundImage: {
        // 'header_bg': "url('/assets/bg1.jpg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
}
