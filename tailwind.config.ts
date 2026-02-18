import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|outline|ring)-attune-(sand|stone|sage|sageLight|clay|clayLight|slate|ink|mist|iconFood|iconWater|iconCraving|iconMovement|iconSleep|iconStress)(\/[0-9]+)?$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        canela: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        /* Figma theme - use CSS vars in components; these are fallbacks */
        attune: {
          sand: "#EAE3D6",
          bone: "#F4EFE6",
          clay: "#C87A5A",
          sage: "#7C8A7A",
          dust: "#B8A999",
          basalt: "#2F2A26",
          adobe: "#B65E3C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
