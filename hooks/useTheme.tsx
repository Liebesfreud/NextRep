import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useRNColorScheme } from "react-native";
import { Colors, type ColorScheme, type ColorTheme } from "@/constants/colors";

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemeContextType = {
    theme: ColorScheme;
    colors: ColorTheme;
    toggleTheme: () => void;
    setTheme: (theme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    colors: Colors.dark,
    toggleTheme: () => { },
    setTheme: () => { },
});

const STORAGE_KEY = "nextrep_theme";

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useRNColorScheme();
    const [theme, setThemeState] = useState<ColorScheme>(
        systemScheme === "light" ? "light" : "dark"
    );

    // Load persisted preference on mount
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (saved === "dark" || saved === "light") {
                setThemeState(saved);
            }
        });
    }, []);

    const setTheme = (t: ColorScheme) => {
        setThemeState(t);
        AsyncStorage.setItem(STORAGE_KEY, t);
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <ThemeContext.Provider
            value={{ theme, colors: Colors[theme] as ColorTheme, toggleTheme, setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme() {
    return useContext(ThemeContext);
}
