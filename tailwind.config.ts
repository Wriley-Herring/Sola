import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F5F1E9",
        charcoal: "#1E1C1A",
        olive: "#5F684A",
        gold: "#9C7B3C",
        slate: "#5D6673"
      },
      boxShadow: {
        soft: "0 10px 30px -15px rgba(0,0,0,0.2)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
