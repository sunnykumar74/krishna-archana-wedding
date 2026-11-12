/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F1E7",
        champagne: "#D8C29B",
        rose: "#B98C91",
        sage: "#DCE5D9",
        ink: "#493735",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Playfair Display", "Noto Serif Devanagari", "serif"],
        hindi: ["Noto Serif Devanagari", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(73,55,53,.10)",
      },
    },
  },
  plugins: [],
};
