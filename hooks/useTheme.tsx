import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useRNColorScheme, LayoutAnimation } from "react-native";
import { Colors, type ColorScheme, type ColorTheme } from "@/constants/colors";

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemePreference = ColorScheme | "system";

type ThemeContextType = {
    theme: ColorScheme;
    preference: ThemePreference;
    colors: ColorTheme;
    toggleTheme: () => void;
    setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    preference: "system",
    colors: Colors.dark,
    toggleTheme: () => { },
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
        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (saved === "dark" || saved === "light" || saved === "system") {
                setPreference(saved as ThemePreference);
            }
        });
    }, []);

    const setTheme = (t: ThemePreference) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreference(t);
        AsyncStorage.setItem(STORAGE_KEY, t);
    };

    const toggleTheme = () => {
        const nextPreference = preference === "dark" ? "light" : "dark";
        setTheme(nextPreference);
    };

    return (
        <ThemeContext.Provider
            value={{ theme, preference, colors: Colors[theme] as ColorTheme, toggleTheme, setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme() {
    return useContext(ThemeContext);
}
