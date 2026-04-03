import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: "#0a0e1a",
          surface: "#0f1420",
          border: "rgba(255,255,255,0.08)",
        },
        accent: {
          cyan: "#00d4aa",
          indigo: "#6366f1",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
        text: {
          primary: "#e8eaf0",
          secondary: "#8b92a5",
          muted: "#4a5068",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
