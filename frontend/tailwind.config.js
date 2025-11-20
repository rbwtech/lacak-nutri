import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#FF9966",
          hover: "#FF7A4D",
        },
        secondary: "#6B8E23",
        accent: "#A1D2D5",
        bg: {
          base: "#FDFDF5",
          surface: "#FFFFF7",
        },
        text: {
          primary: "#333333",
          secondary: "#8C8C8C",
        },
        border: "#EBE3D5",
        success: "#4CAF50",
        warning: {
          DEFAULT: "#FFC107",
          text: "#F57C00",
        },
        error: {
          DEFAULT: "#EF5350",
          text: "#D32F2F",
        },
      },
      fontSize: {
        caption: "12px",
        label: "14px",
        base: "16px",
        h4: "20px",
        h3: "24px",
        h2: "32px",
        h1: "40px",
      },
      lineHeight: {
        base: "1.5",
      },
      spacing: {
        grid: "8px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    typography, // Tambahkan plugin typography
  ],
};
