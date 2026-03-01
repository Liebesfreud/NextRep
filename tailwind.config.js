/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "apple-black": "#000000",
        "apple-gray": "#1C1C1E",
        "apple-gray2": "#2C2C2E",
        "apple-gray3": "#3A3A3C",
        "apple-gray4": "#8E8D93",
        "apple-blue": "#30D158",
        "apple-green": "#30D158",
        "apple-orange": "#FF9F0A",
        "apple-red": "#FF453A",
        "apple-white": "#FFFFFF",
      },
      fontFamily: {
        sans: ["System"],
      },
      spacing: {
        bento: "16px",
      },
      borderRadius: {
        "bento-lg": "24px",
        "bento-sm": "16px",
      },
    },
  },
  plugins: [],
};
