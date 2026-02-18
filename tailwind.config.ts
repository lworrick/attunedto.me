import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|outline|ring)-attune-(sand|stone|sage|sageLight|clay|clayLight|slate|ink|mist)(\/[0-9]+)?$/ },
  ],
  theme: {
    extend: {
      colors: {
        attune: {
          sand: "#f5f0e8",
          stone: "#e8e2d9",
          sage: "#9caa8f",
          sageLight: "#c5d4b9",
          clay: "#c4a77d",
          clayLight: "#e5d4bc",
          slate: "#5c6b73",
          ink: "#2d3436",
          mist: "#a8b4b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-attune-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
