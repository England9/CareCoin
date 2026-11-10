import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#f0faf7",
          100: "#d8efe6",
          200: "#b8e6d5",
          300: "#7dceba",
          400: "#3fafa0",
          500: "#1a9a8b",
          600: "#0d7377",
          700: "#0d7377",
          800: "#095456",
          900: "#0b2e2b",
          950: "#071f1d",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(11, 46, 43, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
