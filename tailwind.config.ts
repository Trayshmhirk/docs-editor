import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "404px",
      sm: "576px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        xs: "360px",
      },
    },
    extend: {
      colors: {
        blue: {
          100: "#B4C6EE",
          400: "#417BFF",
          500: "#3371FF",
        },
        red: {
          400: "#DD4F56",
          500: "#DC4349",
        },
        dark: {
          100: "#09111F",
          200: "#0B1527",
          300: "#0F1C34",
          350: "#12213B",
          400: "#27344D",
          500: "#2E3D5B",
        },
      },
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
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
    boxShadow: {
      sm: "0 1px 2px 0px rgb(0 0 0 / 0.1)", // Small shadow
      "sm-dark": "0 1px 3px 0px rgb(0 0 0 / 0.5)", // Small shadow (dark mode)
      md: "0 2px 4px 0px rgb(0 0 0 / 0.1)", // Medium shadow
      "md-dark": "0 2px 5px 0px rgb(0 0 0 / 0.6)", // Medium shadow (dark mode)
      lg: "0 4px 6px -1px rgb(0 0 0 / 0.1)", // Large shadow
      "lg-dark": "0 4px 7px -1px rgb(0 0 0 / 0.7)", // Large shadow (dark mode)
      xl: "0 5px 10px 0px rgb(0 0 0 / 0.15)", // Extra large shadow
      "xl-dark": "0 6px 10px 2px rgb(0 0 0 / 0.8)", // Extra large shadow (dark mode)
    },
  },
  // plugins: [require("tailwindcss-animate")],
} satisfies Config;
