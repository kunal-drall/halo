/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3A0CA3", // Deep Indigo
          foreground: "#FFFFFF",
          50: "#F3F0FF",
          100: "#E9E2FF",
          200: "#D6CBFF",
          300: "#B8A4FF",
          400: "#9B7CFF",
          500: "#7C3AED",
          600: "#3A0CA3", // Main
          700: "#2D0A82",
          800: "#200561",
          900: "#160340"
        },
        secondary: {
          DEFAULT: "#4CC9F0", // Neon Green/Blue
          foreground: "#000000",
          50: "#F0FCFF",
          100: "#E0F9FF",
          200: "#BAF2FF",
          300: "#7CE7FF",
          400: "#4CC9F0", // Main
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E"
        },
        accent: {
          DEFAULT: "#F72585", // Warm Pink
          foreground: "#FFFFFF",
          50: "#FFF1F5",
          100: "#FFE4EC",
          200: "#FFCCD9",
          300: "#FF9FBB",
          400: "#FF6B9D",
          500: "#F72585", // Main
          600: "#EC0868",
          700: "#C70650",
          800: "#A50E43",
          900: "#8A103C"
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#64748B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-right": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(60, 12, 163, 0.4)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(60, 12, 163, 0.8)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
}