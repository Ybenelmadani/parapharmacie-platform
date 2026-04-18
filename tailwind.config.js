/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        para: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          marine: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#03045e',
          },
          cream: {
            50: '#fffdfa',
            100: '#fefbf3',
            200: '#fdf3d1',
            300: '#fce3a2',
          },
          leaf: '#e5eedb', // soft subtle green background
        }
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'soft-glow': 'soft-glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'soft-glow': {
          '0%': { boxShadow: '0 0 10px rgba(236, 72, 153, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(22, 163, 74, 0.2), 0 0 30px rgba(236, 72, 153, 0.15)' },
        }
      },
      backgroundImage: {
        'para-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fefcf5 50%, #f0fdf4 100%)',
        'para-hero': 'linear-gradient(135deg, #fce7f3 0%, #dcfce7 100%)',
        'health-gradient': 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}

