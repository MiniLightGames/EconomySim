import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        economy: {
          ink: "#12110f",
          panel: "#1d1b18",
          line: "#3b3831",
          gold: "#d7a84f",
          teal: "#4fb7a5",
          clay: "#b26b50"
        }
      }
    }
  },
  plugins: []
};

export default config;
