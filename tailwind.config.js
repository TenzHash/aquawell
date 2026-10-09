/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brandBlue: "#1e3a8a", // <--- Your exact royal blue color
      },
    },
  },
  plugins: [],
};
