import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#FBF9F8",
        "surface-dim": "#DCD9D9",
        "surface-bright": "#FBF9F8",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F6F3F2",
        "surface-container": "#F0EDED",
        "surface-container-high": "#EAE8E7",
        "surface-container-highest": "#E4E2E1",
        "surface-variant": "#E4E2E1",
        "on-surface": "#1B1C1C",
        "on-surface-variant": "#454742",
        "inverse-surface": "#1E2224",
        "inverse-on-surface": "#FFFFFF",
        "outline": "#767872",
        "outline-variant": "#C6C7C0",
        "primary": "#5E5E5C",
        "on-primary": "#FFFFFF",
        "primary-container": "#FDFBF7",
        "on-primary-container": "#747471",
        "gold": "#D4AF37",
        "gold-hover": "#B89628",
        "gold-light": "#F9F3DC",
        "spa-blue": "#E3EEED",
        "blush-pink": "#F9EBEA",
        "error": "#BA1A1A",
        "on-error": "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 10px 30px -5px rgba(27, 28, 28, 0.04)",
        elevated: "0 20px 40px -10px rgba(27, 28, 28, 0.08)",
        gold: "0 4px 20px -2px rgba(212, 175, 55, 0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
