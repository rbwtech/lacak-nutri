import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#FF9966",
          hover: "#FF7A4D",
          light: "rgba(255, 153, 102, 0.15)",
        },
        secondary: {
          DEFAULT: "#6B8E23",
          hover: "#5A7A1C",
          light: "rgba(107, 142, 35, 0.15)",
        },
        accent: {
          DEFAULT: "#A1D2D5",
          light: "rgba(161, 210, 213, 0.15)",
        },
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
        warning: "#FFC107",
        error: "#EF5350",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(149, 157, 165, 0.05)",
        card: "0 4px 20px rgba(0, 0, 0, 0.03)",
        floating: "0 10px 30px rgba(255, 153, 102, 0.2)",
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
