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
    },
  },
};
