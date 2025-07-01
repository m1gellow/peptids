/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A5A5',
          light: '#00C4C4',
          dark: '#008383',
          bg: '#E5F6F6',
        },
        secondary: {
          DEFAULT: '#59BDB6',
          light: '#7BCCC6',
          dark: '#4AA8A1',
        },
        text: {
          DEFAULT: '#333333',
          secondary: '#555555', // Изменено с #777777 на более темный
          light: '#666666', // Изменено с #AAAAAA на более темный
        },
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        divider: '#E5E5E5',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Montserrat', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        play: ['Play', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '13px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '40px',
        '6xl': '50px',
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0px 4px 12px rgba(0, 0, 0, 0.15)',
        'dropdown': '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(0, 131, 131, 0.8) 0%, rgba(0, 165, 165, 0.5) 100%)',
        'parallax-texture': 'url("https://russianpeptide.com/wp-content/uploads/2016/04/fon_pep3.jpg")',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      screens: {
        'xs': '376px',
      },
    },
  },
  plugins: [],
  safelist: [
    'text-primary',
    'bg-primary',
    'bg-primary-bg',
    'text-white',
    'bg-white',
    'shadow-card',
    'rounded-lg',
    'rounded-md',
    'border-primary',
    'hover:bg-primary-light',
    'hover:text-primary',
    'active:bg-primary-dark',
    'hover:bg-primary-bg',
  ],
}