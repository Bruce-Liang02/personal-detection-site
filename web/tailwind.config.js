/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf7',
          100: '#d4efe7',
          200: '#a9dfd1',
          300: '#73ccb8',
          400: '#45b59c',
          500: '#2a9a82',
          600: '#1f7d6a',
          700: '#1B6B5A',   // ← primary brand
          800: '#175a4b',
          900: '#144d40',
          950: '#0a2e26',
        },
        accent: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7ff',
          300: '#a5a5ff',
          400: '#8484f5',
          500: '#6d5ef5',
          600: '#5B5BD6',   // ← secondary accent
          700: '#4c4bb8',
          800: '#404099',
          900: '#373780',
        },
        ink: {
          DEFAULT: '#1e252e',
          2: '#4a5069',
          3: '#767d97',
        },
        line: '#e5e7eb',
        // Layer gradients (used via inline styles, not Tailwind classes)
        l1: '#12A594',
        l2: '#3E7BFA',
        l3: '#7C6CF0',
        l4: '#D4639E',
        // Semantic
        success: { DEFAULT: '#288463', soft: '#d7f8e8' },
        warning: { DEFAULT: '#C87F2C', soft: '#ffeccc' },
        danger:  { DEFAULT: '#D73431', soft: '#ffe7e4' },
        info:    { DEFAULT: '#1777b8', soft: '#dff1ff' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(46,50,90,.06)',
        'card-hover': '0 8px 32px rgba(46,50,90,.10)',
      },
    },
  },
  plugins: [],
}
