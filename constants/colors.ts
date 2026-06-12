// Semantic color bridge that mirrors global.css tokens for runtime usage.

export const Colors = {
    dark: {
        bg: "#09090B",
        background: "#09090B",
        bento: "#111113",
        gray2: "#18181B",
        gray3: "#27272A",
        gray4: "#A1A1AA",
        blue: "#0A84FF",       // info/accent-blue
        green: "#FAFAFA",
        orange: "#FF9F0A",     // primary
        red: "#EF4444",
        white: "#FAFAFA",
        foreground: "#FAFAFA",
        black: "#000000",       // --text-inverse
        card: "#111113",
        border: "rgba(255,255,255,0.09)",
        overlay: "rgba(0,0,0,0.6)",
        primaryForeground: "#18181B",
        accentForeground: "#FAFAFA",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#A1A1AA",
    },
    light: {
        bg: "#FAFAFA",
        background: "#FAFAFA",
        bento: "#FFFFFF",
        gray2: "#F4F4F5",
        gray3: "#E4E4E7",
        gray4: "#71717A",
        blue: "#007AFF",
        green: "#18181B",
        orange: "#FF9500",
        red: "#DC2626",
        white: "#18181B",
        foreground: "#18181B",
        black: "#FFFFFF",
        card: "#FFFFFF",
        border: "rgba(24,24,27,0.08)",
        overlay: "rgba(9,9,11,0.35)",
        primaryForeground: "#FAFAFA",
        accentForeground: "#FAFAFA",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#71717A",
    },
} as const;

export type ColorScheme = "dark" | "light";
export type ColorTheme = typeof Colors.dark;
