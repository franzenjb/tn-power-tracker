import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rc-red': '#ed1b2e',
        'rc-dark-red': '#c8102e',
        'rc-gray': '#53565a',
      },
      fontFamily: {
        'sans': ['Barlow', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
