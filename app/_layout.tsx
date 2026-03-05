import { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, LayoutDashboard, Bot, Settings } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { initDatabase } from "@/db/client";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import "../global.css";

// Prevent auto hide
SplashScreen.preventAutoHideAsync().catch(() => { });

// ─── Inner Layout (has access to theme) ──────────────────────────────────────

function TabLayout() {
    const { colors, theme } = useTheme();
    const [dbInitialized, setDbInitialized] = useState(false);

    useEffect(() => {
        // Initialize SQLite tables on first launch
        initDatabase()
            .then(() => {
                setDbInitialized(true);
                SplashScreen.hideAsync().catch(console.warn);
            })
            .catch(console.error);
    }, []);

    if (!dbInitialized) return null;

    return (
        <>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.bento,
                        borderTopColor: colors.border,
                        borderTopWidth: 0.5,
                        height: 80,
                        paddingBottom: 20,
                        paddingTop: 8,
                    },
                    tabBarActiveTintColor: colors.white,
                    tabBarInactiveTintColor: colors.gray4,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: "600",
                        letterSpacing: 0.5,
                    },
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
