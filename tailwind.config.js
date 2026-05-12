module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#22c55e",
          "green-dark": "#16a34a",
          "green-light": "#4ade80",
          "green-glow": "rgba(34,197,94,0.15)",
        },
        dark: {
          900: "#000000",
          850: "#080808",
          800: "#0d0d0d",
          750: "#111111",
          700: "#141414",
          600: "#1a1a1a",
          500: "#222222",
          400: "#2a2a2a",
          300: "#333333",
          200: "#444444",
          100: "#666666",
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-green": "pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "glow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5, boxShadow: "0 0 20px rgba(34,197,94,0.5)" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        glow: {
          from: { textShadow: "0 0 10px rgba(34,197,94,0.3)" },
          to: { textShadow: "0 0 30px rgba(34,197,94,0.8), 0 0 60px rgba(34,197,94,0.4)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
