import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CUE-NATION Design System Tokens
        felt: {
          DEFAULT: "var(--felt, #0A5551)",
          dark: "var(--felt-dark, #063B38)",
          light: "#2FA39A",
        },
        brass: {
          DEFAULT: "var(--brass, #C5A059)",
          dark: "var(--brass-dark, #9A7B38)",
          glow: "#D9B166",
        },
        charcoal: {
          DEFAULT: "var(--charcoal, #121615)",
          card: "var(--charcoal-card, #18201E)",
        },
        ivory: {
          DEFAULT: "var(--ivory, #F6EFDF)",
          soft: "#FBF7EC",
        },
        ink: {
          DEFAULT: "var(--ink, #070909)",
        },
        stone: {
          DEFAULT: "var(--stone, #8A857B)",
        },
        table: {
          free: "var(--table-free, #2FA39A)",
          booked: "var(--table-booked, #D9A441)",
          running: "var(--table-running, #C5A059)",
          maintenance: "var(--table-maintenance, #7A7F7E)",
        },

        // Legacy / Original Theme Compatibility Tokens
        cream:    { DEFAULT: "#EDDFC2", soft: "#F6EFDF", card: "#FBF7EC" },
        baize:    { DEFAULT: "#0A5551", dark: "#063B38", light: "#2FA39A" },
        bronze:   { DEFAULT: "#6D5330", dark: "#5A4427", glow: "#B8925A", glowdark: "#A67F49" },
        midnight: { DEFAULT: "#010101", card: "#0D1716", line: "#1E2B29" },
        ash:  "#5C5446",
        mist: "#B9AE97",
        amber:  { DEFAULT: "#D9A441", text: "#8A5E10" },
        cue:    { DEFAULT: "#A3303E", light: "#E27D88" },
        slate:  { DEFAULT: "#5C5446", dark: "#7A7F7E" },
        status: {
          free: "#2FA39A",
          booked: "#D9A441",
          running: "#EDDFC2",
          maintenance: "#7A7F7E",
        },

        // Standard Semantic CSS Variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius, 14px)",
        md: "calc(var(--radius, 14px) - 2px)",
        sm: "calc(var(--radius, 14px) - 4px)",
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(1,1,1,.06), 0 8px 24px rgba(1,1,1,.10)",
        lamp: "0 0 40px rgba(197, 160, 89, 0.22)",
        glow: "0 0 25px rgba(10, 85, 81, 0.35)",
      },
      backgroundImage: {
        hero: "linear-gradient(180deg, #063B38 0%, #010101 100%)",
        scrim: "linear-gradient(to top, rgba(1,1,1,.85), rgba(1,1,1,0))",
      },
      gridTemplateColumns: {
        "16": "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;
