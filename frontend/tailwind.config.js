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
        // Jucier-inspired Palette (Organic/Fresh)
        bg: {
          primary: '#F2F0E9', // Cream/Off-white
          secondary: '#FFFFFF', // Pure White
          glass: 'rgba(242, 240, 233, 0.8)', // Cream glass
        },
        text: {
          primary: '#1A1A1A', // Soft Black
          secondary: '#4A4A4A', // Dark Gray
          muted: '#8A8A8A', // Muted Gray
        },
        accent: {
          DEFAULT: '#FF5C00', // Vibrant Orange (Citrus energy)
          glow: 'rgba(255, 92, 0, 0.2)',
          secondary: '#96C93D', // Fresh Green
        },
        border: {
          light: 'rgba(26, 26, 26, 0.08)',
        },
        status: {
          success: '#96C93D', // Fresh Green
          warning: '#FFB800', // Warm Yellow
          error: '#FF4D4D',   // Soft Red
        }
      },
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, rgba(255, 92, 0, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(150, 201, 61, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(255, 184, 0, 0.1) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
