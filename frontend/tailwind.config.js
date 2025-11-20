import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        bg: {
          base: "var(--color-bg-base)",
          surface: "var(--color-bg-surface)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        border: "var(--color-border)",
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#EF5350",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [typography],
};
