import { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, LayoutDashboard, Bot, Settings } from "lucide-react-native";
import { View } from "react-native";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { initDatabase } from "@/db/client";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Button, ButtonText } from "@/components/ui/button";
import { getTabBarStyle, TabBarBackground, TAB_BAR_ITEM_STYLE } from "@/components/ui/tab-bar-background";
import { Text } from "@/components/ui/text";
import "../global.css";

// Prevent auto hide
SplashScreen.preventAutoHideAsync().catch(() => { });

// ─── Inner Layout (has access to theme) ──────────────────────────────────────

function TabLayout() {
    const { colors, theme } = useTheme();
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
                    className="self-start bg-accent"
                >
                    <ButtonText className="text-accent-foreground">重试</ButtonText>
                </Button>
            </View>
        );
    }

    if (!dbInitialized) return null;

    return (
        <>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <Tabs
                safeAreaInsets={{ bottom: 0 }}
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: getTabBarStyle(colors.border, colors.black),
                    tabBarBackground: () => <TabBarBackground />,
                    tabBarShowLabel: false,
                    tabBarLabelPosition: 'beside-icon',
                    tabBarActiveTintColor: colors.white,
                    tabBarInactiveTintColor: colors.gray4,
                    tabBarItemStyle: TAB_BAR_ITEM_STYLE,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "首页",
                        tabBarIcon: ({ color, size, focused }) => (
                            <Home
                                color={color}
                                size={size}
                                strokeWidth={focused ? 2.5 : 2}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: "看板",
                        tabBarIcon: ({ color, size, focused }) => (
                            <LayoutDashboard
                                color={color}
                                size={size}
                                strokeWidth={focused ? 2.5 : 2}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="ai-coach"
                    options={{
                        title: "AI 教练",
                        tabBarIcon: ({ color, size, focused }) => (
                            <Bot
                                color={color}
                                size={size}
                                strokeWidth={focused ? 2.5 : 2}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "设置",
                        tabBarIcon: ({ color, size, focused }) => (
                            <Settings
                                color={color}
                                size={size}
                                strokeWidth={focused ? 2.5 : 2}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings/exercises"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </>
    );
}

// ─── Root Layout (wraps ThemeProvider) ────────────────────────────────────────

function RootNavigationWrapper() {
    const { theme } = useTheme();
    return (
        <NavigationThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
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
