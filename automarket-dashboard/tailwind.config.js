/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f7f8fa',
          100: '#edf0f3',
          200: '#d6dce4',
          300: '#b3becb',
          400: '#8a9aad',
          500: '#6b7b93',
          600: '#56647a',
          700: '#475363',
          800: '#3d4653',
          900: '#363c47',
          950: '#1a202c',
        },
        secondary: {
          50: '#f4f6fb',
          100: '#e9edf6',
          200: '#cdd9ea',
          300: '#a3b8d6',
          400: '#7292be',
          500: '#5270a6',
          600: '#3f588b',
          700: '#344670',
          800: '#2e3d5e',
          900: '#2a354f',
          950: '#a3aed0',
        },
        accent: {
          50: '#fff1f2',
          100: '#ffe1e5',
          200: '#ffc7d0',
          300: '#ff9fae',
          400: '#ff6785',
          500: '#ff385c',
          600: '#ed1444',
          700: '#c8102e',
          800: '#a70e2a',
          900: '#8f1028',
        },
        // UI component colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};