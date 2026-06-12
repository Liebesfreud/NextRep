import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useRNColorScheme, LayoutAnimation, View } from "react-native";
import { Colors, type ColorScheme, type ColorTheme } from "@/constants/colors";

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemePreference = ColorScheme | "system";

type ThemeContextType = {
    theme: ColorScheme;
    preference: ThemePreference;
    colors: ColorTheme;
    setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    preference: "system",
    colors: Colors.dark,
    setTheme: () => { },
});

const STORAGE_KEY = "nextrep_theme";

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useRNColorScheme();
    const [preference, setPreference] = useState<ThemePreference>("system");

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

    const setTheme = React.useCallback((t: ThemePreference) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreference(t);
        AsyncStorage.setItem(STORAGE_KEY, t);
    }, []);

    const value = React.useMemo(
        () => ({ theme, preference, colors: Colors[theme] as ColorTheme, setTheme }),
        [theme, preference, setTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            <View className={`${theme} flex-1`}>
                {children}
            </View>
        </ThemeContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme() {
    return useContext(ThemeContext);
}
