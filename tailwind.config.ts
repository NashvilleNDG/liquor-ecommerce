import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-nunito)", "Nunito Sans", "sans-serif"],
        heading: ["var(--font-rubik)", "Rubik", "sans-serif"],
      },
      colors: {
        stone: {
          950: "#0C0A09",
          900: "#1C1917",
          800: "#292524",
          700: "#44403C",
          600: "#57534E",
          500: "#78716C",
          400: "#A8A29E",
          300: "#D6D3D1",
          200: "#E7E5E4",
          100: "#F5F5F4",
        },
        gold: {
          DEFAULT: "#CA8A04",
          light:   "#EAB308",
          dark:    "#A16207",
          50:      "rgba(202,138,4,0.05)",
          100:     "rgba(202,138,4,0.10)",
          200:     "rgba(202,138,4,0.20)",
          300:     "rgba(202,138,4,0.30)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease forwards",
        "slide-up":  "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
