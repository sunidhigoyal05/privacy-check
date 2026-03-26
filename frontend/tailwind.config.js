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
    defaultTheme: "dark",
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
      dark: {
        colors: {
          background: "#08080E",
          foreground: "#E8E8FA",
          primary: {
            50: "#071828",
            100: "#0D2840",
            200: "#163D60",
            300: "#1E5484",
            400: "#2B70AD",
            500: "#5AA8E8",
            600: "#7AC0F0",
            700: "#9AD4F8",
            800: "#BDE6FC",
            900: "#E0F4FE",
            DEFAULT: "#5AA8E8",
            foreground: "#FFFFFF",
          },
          secondary: {
            DEFAULT: "#2DD4BF",
            foreground: "#08080E",
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
          default: {
            50: "#0E0E1A",
            100: "#13131F",
            200: "#191926",
            300: "#1E1E2E",
            400: "#26263A",
            500: "#363650",
            600: "#6060A0",
            700: "#9090C0",
            800: "#B8B8D8",
            900: "#DCDCF0",
            DEFAULT: "#1E1E2E",
            foreground: "#E8E8FA",
          },
          content1: "#0E0E1A",
          content2: "#141420",
          content3: "#1A1A28",
          content4: "#202030",
          focus: "#5AA8E8",
          divider: "#1E1E2E",
          overlay: "#000000",
        },
      },
    },
  })],
};
