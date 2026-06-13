const themeTokens = require("./tailwind.theme.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // DESIGN.md hex values from tailwind.theme.json (base layer)
        ...themeTokens.theme.extend.colors,
        // Shadcn CSS variable mappings (override theme.json where conflicts exist)
        input: "var(--input)",
        ring: "var(--theme-accent)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // DESIGN.md CSS variable mappings
        accent: {
          DEFAULT: "var(--theme-accent)",
          foreground: "var(--theme-accent-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        tertiary: "var(--tertiary)",
        overlay: "var(--overlay)",
      },
      fontFamily: {
        sans: ["System"],
      },
      fontSize: {
        ...themeTokens.theme.extend.fontSize,
      },
      borderRadius: themeTokens.theme.extend.borderRadius,
      spacing: {
        bento: "16px",
        ...themeTokens.theme.extend.spacing,
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      addUtilities({
        ".font-variant-numeric-tabular-nums": {
          fontVariant: ["tabular-nums"],
        },
      });
    },
  ],
};
