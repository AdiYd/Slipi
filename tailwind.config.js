/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: 'rgb(51, 122, 183)',
          dark: 'rgb(82, 153, 214)'
        },
        secondary: {
          light: '#2c3e50',
          dark: '#34495e'
        },
        accent: {
          light: '#e74c3c',
          dark: '#c0392b'
        },
        background: {
          light: '#ffffff',
          dark: '#1a1a1a'
        },
        text: {
          light: '#2d3748',
          dark: '#e2e8f0'
        },
        border: {
          light: '#e2e8f0',
          dark: '#4a5568'
        }
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'card': '2px',
        'button': '2px',
        'full': '9999px',
      },
      spacing: {
        'container': '1280px',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px 0 rgba(0,0,0,0.1)',
        'card-dark': '0 2px 4px 0 rgba(255,255,255,0.1)',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} 