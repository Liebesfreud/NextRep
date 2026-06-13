type ThemeMode = "dark" | "light";

type ThemeColorScale = Record<
    ThemeMode,
    {
        accent: string;
        foreground: string;
    }
>;

/**
 * Brand color palettes are kept separate from semantic surface/status colors.
 * Adding a palette here is enough to make it available to a future picker.
 */
export const ThemeColors = {
    orange: {
        dark: {
            accent: "#FF6B2C",
            foreground: "#FFFFFF",
        },
        light: {
            accent: "#E85D20",
            foreground: "#FFFFFF",
        },
    },
} as const satisfies Record<string, ThemeColorScale>;

export type ThemeColorName = keyof typeof ThemeColors;

export const DEFAULT_THEME_COLOR: ThemeColorName = "orange";

export function isThemeColorName(value: string): value is ThemeColorName {
    return value in ThemeColors;
}

export function getThemeColor(
    name: ThemeColorName = DEFAULT_THEME_COLOR,
    scheme: ThemeMode,
) {
    return ThemeColors[name][scheme];
}

export function getThemeColorVariables(
    name: ThemeColorName = DEFAULT_THEME_COLOR,
    scheme: ThemeMode,
) {
    const color = getThemeColor(name, scheme);

    return {
        "--theme-accent": color.accent,
        "--theme-accent-foreground": color.foreground,
    } as const;
}
