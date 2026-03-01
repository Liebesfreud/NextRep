// Apple-inspired design color system
// Matches the CSS variables in the Next.js version's globals.css

export const Colors = {
    dark: {
        bg: "#000000",         // --bg-app
        bento: "#1C1C1E",      // --bg-bento
        gray2: "#2C2C2E",      // --bg-2
        gray3: "#3A3A3C",      // --bg-3
        gray4: "#8E8D93",      // --text-muted
        blue: "#0A84FF",       // --color-apple-blue
        green: "#30D158",      // --color-apple-green
        orange: "#FF9F0A",     // --color-apple-orange
        red: "#FF453A",        // --color-apple-red
        white: "#FFFFFF",       // --text-main
        black: "#000000",       // --text-inverse
        card: "#1C1C1E",
        border: "rgba(255,255,255,0.06)",
    },
    light: {
        bg: "#F2F2F7",
        bento: "#FFFFFF",
        gray2: "#F6F6F8",      // Lighter than System Gray 6, but not as white as previous iteration
        gray3: "#F5F5F7",      // Even lighter gray for borders/panels
        gray4: "#8E8D93",
        blue: "#007AFF",
        green: "#34C759",
        orange: "#FF9500",
        red: "#FF3B30",
        white: "#000000",
        black: "#FFFFFF",
        card: "#FFFFFF",
        border: "rgba(0,0,0,0.05)",
    },
} as const;

export type ColorScheme = "dark" | "light";
export type ColorTheme = typeof Colors.dark;
