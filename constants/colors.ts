// Semantic color bridge that mirrors global.css tokens for runtime usage.

export const Colors = {
    dark: {
        bg: "#0A0A0F",
        background: "#0A0A0F",
        gray2: "#141419",
        gray3: "#1C1C24",
        gray4: "#636366",
        blue: "#0A84FF",       // info/accent-blue
        green: "#30D158",
        orange: "#FF6B2C",     // primary brand accent
        red: "#FF453A",
        white: "#FAFAFA",
        foreground: "#FAFAFA",
        card: "#141419",
        border: "rgba(255,255,255,0.07)",
        overlay: "rgba(0,0,0,0.6)",
        primaryForeground: "#18181B",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#A1A1AA",
        // DESIGN.md v3 semantic tokens
        accent: "#FF6B2C",
        surface: "#141419",
        surfaceElevated: "#1C1C24",
        textSecondary: "#8E8E93",
        textTertiary: "#636366",
        success: "#30D158",
        warning: "#FFD60A",
        info: "#0A84FF",
    },
    light: {
        bg: "#FAFAFA",
        background: "#FAFAFA",
        gray2: "#F4F4F5",
        gray3: "#E4E4E7",
        gray4: "#71717A",
        blue: "#007AFF",
        green: "#30D158",
        orange: "#E85D20",
        red: "#DC2626",
        white: "#18181B",
        foreground: "#18181B",
        card: "#FFFFFF",
        border: "rgba(24,24,27,0.08)",
        overlay: "rgba(9,9,11,0.35)",
        primaryForeground: "#FAFAFA",
        destructiveForeground: "#FFFFFF",
        mutedForeground: "#71717A",
        // DESIGN.md v3 semantic tokens — light mode
        accent: "#E85D20",
        surface: "#FFFFFF",
        surfaceElevated: "#F4F4F5",
        textSecondary: "#71717A",
        textTertiary: "#A1A1AA",
        success: "#30D158",
        warning: "#FFD60A",
        info: "#007AFF",
    },
} as const;

export type ColorScheme = "dark" | "light";
export type ColorTheme = typeof Colors.dark;
