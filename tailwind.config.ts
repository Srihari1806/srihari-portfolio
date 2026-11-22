import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Normal Mode: Warm Ivory & Lime Accent
        ivory: {
          50: "#FAF9F5",
          100: "#F5F3EB",
          200: "#ECE7DA",
          300: "#DDD5C1",
          400: "#C4B89B",
          500: "#A99978",
          800: "#363124",
          900: "#1E1B14",
        },
        limeaccent: {
          DEFAULT: "#84CC16",
          bright: "#BEF264",
          punch: "#A3E635",
          dark: "#4D7C0F",
          glow: "#D9F99D",
        },
        // TFI Mode: Cinematic Dark & Amber/Gold accents
        cinema: {
          bg: "#0A0B0E",
          card: "#12151C",
          surface: "#1A1E27",
          border: "#292F3D",
          amber: "#FFB020",
          gold: "#F59E0B",
          crimson: "#E11D48",
          reel: "#8E5123",
          wood: "#2C1B12",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        card: "0 10px 30px -4px rgba(0, 0, 0, 0.08)",
        cinema: "0 0 35px -5px rgba(245, 158, 11, 0.15)",
        drawer: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
