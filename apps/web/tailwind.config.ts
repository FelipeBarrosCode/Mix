import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
