// NextRep design color bridge
// Mirrors the semantic CSS tokens in global.css while preserving runtime color access.

export const Colors = {
    dark: {
        bg: "#09090B",
        bento: "#111113",
        gray2: "#18181B",
        gray3: "#27272A",
        gray4: "#A1A1AA",
        blue: "#0A84FF",       // info/accent-blue
        green: "#22C55E",
        orange: "#FF9F0A",     // primary
        red: "#EF4444",
        white: "#FAFAFA",
        black: "#000000",       // --text-inverse
        card: "#111113",
        border: "rgba(255,255,255,0.09)",
        overlay: "rgba(0,0,0,0.6)",
        primaryForeground: "#052E16",
        accentForeground: "#052E16",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#A1A1AA",
    },
    light: {
        bg: "#FAFAFA",
        bento: "#FFFFFF",
        gray2: "#F4F4F5",
        gray3: "#E4E4E7",
        gray4: "#71717A",
        blue: "#007AFF",
        green: "#16A34A",
        orange: "#FF9500",
        red: "#DC2626",
        white: "#18181B",
        black: "#FFFFFF",
        card: "#FFFFFF",
        border: "rgba(24,24,27,0.08)",
        overlay: "rgba(9,9,11,0.35)",
        primaryForeground: "#FFFFFF",
        accentForeground: "#052E16",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#71717A",
    },
} as const;

export type ColorScheme = "dark" | "light";
export type ColorTheme = typeof Colors.dark;
