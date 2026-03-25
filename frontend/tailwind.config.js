/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wb: {
          blue: '#002244',
          sky: '#0071BC',
          teal: '#009CA7',
          lightblue: '#E8F4FD',
          warm: '#F8F9FA',
          sand: '#F5F0EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          background: "#FAFAFA",
          foreground: "#1A1A2E",
          primary: {
            50: "#E8F4FD",
            100: "#B8DFFA",
            200: "#88CAF6",
            300: "#58B5F3",
            400: "#28A0EF",
            500: "#0071BC",
            600: "#005A96",
            700: "#004370",
            800: "#002C4B",
            900: "#001525",
            DEFAULT: "#0071BC",
            foreground: "#FFFFFF",
          },
          secondary: {
            DEFAULT: "#009CA7",
            foreground: "#FFFFFF",
          },
          success: {
            DEFAULT: "#17C964",
            foreground: "#FFFFFF",
          },
          warning: {
            DEFAULT: "#F5A524",
            foreground: "#FFFFFF",
          },
          danger: {
            DEFAULT: "#F31260",
            foreground: "#FFFFFF",
          },
        },
      },
    },
  })],
};
