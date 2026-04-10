/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0c0118",
          elevated: "#130d22",
          surface: "#1a1430",
          hover: "#221a3a",
        },
        border: {
          DEFAULT: "#241c3a",
          strong: "#2f2548",
          subtle: "#16101e",
        },
        fg: {
          DEFAULT: "#f0eef5",
          muted: "#8a86a0",
          dim: "#5a5768",
          faint: "#353042",
        },
        accent: {
          DEFAULT: "#9370ff",
          hover: "#a78bfa",
          glow: "#9370ff",
          soft: "rgba(147, 112, 255, 0.15)",
        },
        category: {
          content: '#EC4899',
          design: '#3B82F6',
          docs: '#22C55E',
          video: '#F97316',
          business: '#EAB308',
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Monaco", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(147, 112, 255, 0.35)",
        card: "0 4px 20px rgba(147, 112, 255, 0.08)",
        modal:
          "0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pop-check": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pop-check": "pop-check 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
