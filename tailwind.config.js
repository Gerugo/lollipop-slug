/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: '#FF77B0',
          hotpink: '#FF3388',
          yellow: '#FFDF6D',
          green: '#7AE582',
          mint: '#99F6E4',
          blue: '#70D6FF',
          sky: '#38BDF8',
          purple: '#C084FC',
          lavender: '#E9D5FF',
          cream: '#FFFBEB',
          chocolate: '#6B4226',
          marshmallow: '#FFFFFF',
          soda: '#06B6D4',
          cherry: '#EF4444',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        candy: ['Fredoka', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'monospace'],
        bungee: ['Bungee', 'cursive'],
      },
      animation: {
        'bounce-soft': 'bounceSoft 1.5s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s infinite ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 119, 176, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 18px rgba(112, 214, 255, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}
