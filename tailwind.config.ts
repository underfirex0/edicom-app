import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F2",
        panel: "#FFFFFF",
        line: "#E7E3DA",
        ink: "#211E1A",
        muted: "#847E71",
        teal: { DEFAULT: "#2F6F63", soft: "#E3EEEA", dark: "#204B43" },
        copper: { DEFAULT: "#BD8A4F", soft: "#F3E9D8" },
        coral: { DEFAULT: "#C1584F", soft: "#F6E5E3" },
        amber: { DEFAULT: "#CE9A45", soft: "#F6EEDC" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(33,30,26,0.04), 0 8px 24px -12px rgba(33,30,26,0.10)",
        panel: "0 1px 0 rgba(33,30,26,0.03), 0 20px 40px -24px rgba(33,30,26,0.14)",
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};
export default config;
