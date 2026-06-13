import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useRNColorScheme, LayoutAnimation, View } from "react-native";
import { vars } from "nativewind";
import { Colors, getColors, type ColorScheme, type ColorTheme } from "@/constants/colors";
import {
    DEFAULT_THEME_COLOR,
    getThemeColorVariables,
    isThemeColorName,
    type ThemeColorName,
} from "@/constants/themeColors";

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemePreference = ColorScheme | "system";

type ThemeContextType = {
    theme: ColorScheme;
    preference: ThemePreference;
    themeColor: ThemeColorName;
    colors: ColorTheme;
    setTheme: (theme: ThemePreference) => void;
    setThemeColor: (themeColor: ThemeColorName) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    preference: "system",
    themeColor: DEFAULT_THEME_COLOR,
    colors: Colors.dark,
    setTheme: () => { },
    setThemeColor: () => { },
});

const STORAGE_KEY = "nextrep_theme";
const THEME_COLOR_STORAGE_KEY = "nextrep_theme_color";

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useRNColorScheme();
    const [preference, setPreference] = useState<ThemePreference>("system");
    const [themeColor, setThemeColorState] = useState<ThemeColorName>(DEFAULT_THEME_COLOR);

    const theme: ColorScheme = preference === "system" 
        ? (systemScheme === "light" ? "light" : "dark")
        : preference;

    // Load persisted preference on mount
    useEffect(() => {
        let isActive = true;

        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (isActive && (saved === "dark" || saved === "light" || saved === "system")) {
                setPreference(saved as ThemePreference);
            }
        });

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        AsyncStorage.getItem(THEME_COLOR_STORAGE_KEY).then((saved) => {
            if (isActive && saved && isThemeColorName(saved)) {
                setThemeColorState(saved);
            }
        });

        return () => {
            isActive = false;
        };
    }, []);

    const setTheme = React.useCallback((t: ThemePreference) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreference(t);
        AsyncStorage.setItem(STORAGE_KEY, t);
    }, []);

    const setThemeColor = React.useCallback((color: ThemeColorName) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setThemeColorState(color);
        AsyncStorage.setItem(THEME_COLOR_STORAGE_KEY, color);
    }, []);

    const colors = React.useMemo(
        () => getColors(theme, themeColor),
        [theme, themeColor]
    );
    const themeColorStyle = React.useMemo(
        () => vars(getThemeColorVariables(themeColor, theme)),
        [theme, themeColor]
    );
    const value = React.useMemo(
        () => ({ theme, preference, themeColor, colors, setTheme, setThemeColor }),
        [theme, preference, themeColor, colors, setTheme, setThemeColor]
    );

    return (
        <ThemeContext.Provider value={value}>
            <View className={`${theme} flex-1`} style={themeColorStyle}>
                {children}
            </View>
        </ThemeContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme() {
    return useContext(ThemeContext);
}
