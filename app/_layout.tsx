import { useState, useEffect } from "react";
import { Tabs, ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Gauge, Home, SlidersHorizontal, Sparkles } from "lucide-react-native";
import { View } from "react-native";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { initDatabase } from "@/db/client";
import * as SplashScreen from "expo-splash-screen";
import { Button, ButtonText } from "@/components/ui/button";
import { getTabBarStyle, TabBarBackground, TAB_BAR_ITEM_STYLE, useTabBarStyle } from "@/components/ui/tab-bar-background";
import { TabIcon } from "@/components/ui/tab-icon";
import { Text } from "@/components/ui/text";
import { DottedBackground } from "@/components/ui/dotted-background";
import { DURATION } from "@/constants/animations";
import "../global.css";

// Prevent auto hide
SplashScreen.preventAutoHideAsync().catch(() => { });

// ─── Inner Layout (has access to theme) ──────────────────────────────────────

function TabLayout() {
    const { colors, theme } = useTheme();
    const tabBarStyle = useTabBarStyle();
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        // Initialize SQLite tables on first launch
        setDbError(null);
        initDatabase()
            .then(() => {
                if (cancelled) return;
                setDbInitialized(true);
                SplashScreen.hideAsync().catch(console.warn);
            })
            .catch((error) => {
                if (cancelled) return;
                console.error(error);
                setDbError(error?.message || "数据库初始化失败，请重试。");
                SplashScreen.hideAsync().catch(console.warn);
            });

        return () => {
            cancelled = true;
        };
    }, [retryKey]);

    if (dbError) {
        return (
            <View className="flex-1 justify-center bg-background p-6">
                <StatusBar style={theme === "dark" ? "light" : "dark"} />
                <Text variant="heading" className="mb-2.5">
                    启动失败
                </Text>
                <Text variant="muted" className="mb-5 leading-[22px]">
                    {dbError}
                </Text>
                <Button
                    onPress={() => {
                        setDbInitialized(false);
                        setRetryKey((prev) => prev + 1);
                    }}
                    className="self-start"
                >
                    <ButtonText>重试</ButtonText>
                </Button>
            </View>
        );
    }

    if (!dbInitialized) return null;

    return (
        <View className="flex-1 bg-background">
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <DottedBackground />
            <Tabs
                safeAreaInsets={{ bottom: 0 }}
                screenOptions={{
                    headerShown: false,
                    sceneStyle: { backgroundColor: "transparent" },
                    tabBarStyle: tabBarStyle,
                    tabBarBackground: () => <TabBarBackground />,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.textTertiary,
                    tabBarItemStyle: TAB_BAR_ITEM_STYLE,
                    tabBarIconStyle: { width: 80, height: 56 },
                    tabBarHideOnKeyboard: true,
                    animation: "shift",
                    transitionSpec: {
                        animation: "timing",
                        config: {
                            duration: DURATION.standard,
                        },
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "首页",
                        tabBarAccessibilityLabel: "首页",
                        tabBarIcon: ({ color, focused }) => <TabIcon icon={Home} color={color} size={24} focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: "看板",
                        tabBarAccessibilityLabel: "数据看板",
                        tabBarIcon: ({ color, focused }) => <TabIcon icon={Gauge} color={color} size={24} focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="ai-coach"
                    options={{
                        title: "AI 教练",
                        tabBarAccessibilityLabel: "AI 教练",
                        tabBarIcon: ({ color, focused }) => <TabIcon icon={Sparkles} color={color} size={24} focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "设置",
                        tabBarAccessibilityLabel: "设置",
                        tabBarIcon: ({ color, focused }) => <TabIcon icon={SlidersHorizontal} color={color} size={24} focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="settings/exercises"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </View>
    );
}

// ─── Root Layout (wraps ThemeProvider) ────────────────────────────────────────

function RootNavigationWrapper() {
    const { theme } = useTheme();
    const navigationTheme = theme === "dark" ? DarkTheme : DefaultTheme;

    return (
        <NavigationThemeProvider
            value={{
                ...navigationTheme,
                colors: { ...navigationTheme.colors, background: "transparent" },
            }}
        >
            <TabLayout />
        </NavigationThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootNavigationWrapper />
        </ThemeProvider>
    );
}
