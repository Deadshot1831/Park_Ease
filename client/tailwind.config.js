/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep near-black / navy surfaces
        ink: {
          950: '#06060b',
          900: '#0a0a12',
          850: '#0f0f1a',
          800: '#15131f',
          700: '#1c1a2b',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Secondary neon accent (magenta/fuchsia, like the reference glow)
        neon: {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        available: '#34d399',
        limited: '#fbbf24',
        full: '#fb7185',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #d946ef 100%)',
        'brand-soft': 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(217,70,239,0.12) 100%)',
        'glass-sheen': 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.05)',
        'glow-brand': '0 0 0 1px rgba(124,58,237,0.4), 0 8px 30px -6px rgba(124,58,237,0.55)',
        'glow-soft': '0 0 40px -10px rgba(168,85,247,0.45)',
        'glow-danger': '0 0 30px -4px rgba(251,113,133,0.6)',
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.08)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
