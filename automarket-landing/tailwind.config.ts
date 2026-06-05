import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "from-blue-900",
    "to-FF385C",
    "text-blue-900",
    "bg-blue-50",
    "dark:bg-blue-900/20",
    "dark:text-FF385C",
    "hover:text-blue-900",
    "dark:hover:text-FF385C",
    "hover:border-blue-900/50",
    "dark:hover:border-FF385C/50",
    "shadow-blue-900/20",
    "hover:shadow-blue-900/30",
    "bg-FF385C",
    "bg-FF385C-700",
    "text-FF385C-700",
    "text-FF385C-800",
    "border-FF385C",
    "focus-visible:ring-blue-900/50",
    "focus-visible:ring-FF385C/50",
    "dark:focus-visible:ring-FF385C/50",
    "dark:focus-visible:border-FF385C/50",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Circular", "system-ui", "sans-serif"],
        circular: ["Circular", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gray: {
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#222222", // Our secondary color
          950: "#1a1a1a",
        },
        blue: {
          50: "#eef6ff",
          100: "#d8eafd",
          200: "#b9dbfe",
          300: "#8ac6fc",
          400: "#53a9f8",
          500: "#2c8af1",
          600: "#186ce4",
          700: "#1557c2",
          800: "#174a9c",
          900: "#0f3460", // Deep blue - primary brand color
          950: "#0d2b4e",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4", // Light teal - accent color
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488", // Teal - secondary brand color
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        yellow: {
          50: "#FFF5F6",
          100: "#FFE9EC",
          200: "#FFD3D9",
          300: "#FFBDC6",
          400: "#FF8A9C",
          500: "#FF5C73", // Main color
          600: "#FF385C", // New primary color
          700: "#E62E50",
          800: "#CC2846",
          900: "#B3233D",
          950: "#8C1B30",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scroll-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "scroll-continuous": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scroll-slower": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll-left": "scroll-left 30s linear infinite",
        "scroll-right": "scroll-right 30s linear infinite",
        "scroll-continuous": "scroll-continuous 25s linear infinite",
        "scroll-slower": "scroll-slower 45s linear infinite", // Slower animation for a smoother experience
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
