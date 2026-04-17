/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#f5f4ed",
        ivory: "#faf9f5",
        "anthropic-black": "#141413",
        terracotta: "#c96442",
        coral: "#d97757",
        crimson: "#b53333",
        "focus-blue": "#3898ec",
        "warm-sand": "#e8e6dc",
        "dark-surface": "#30302e",
        "charcoal-warm": "#4d4c48",
        "olive-gray": "#5e5d59",
        "stone-gray": "#87867f",
        "dark-warm": "#3d3d3a",
        "warm-silver": "#b0aea5",
        "border-cream": "#f0eee6",
        "border-warm": "#e8e6dc",
        "border-dark": "#30302e",
        "ring-warm": "#d1cfc5",
        "ring-subtle": "#dedc01",
        "ring-deep": "#c2c0b6",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      lineHeight: {
        relaxed: "1.60",
        tight: "1.10",
      },
      boxShadow: {
        ring: "0 0 0 1px var(--tw-ring-color)",
        whisper: "0 4px 24px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "sharp": "4px",
        "subtle": "6px",
        "comfortable": "8px",
        "generous": "12px",
        "very": "16px",
        "highly": "24px",
        "maximum": "32px",
      },
    },
  },
  plugins: [],
}
