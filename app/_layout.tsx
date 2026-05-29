import { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, LayoutDashboard, Bot, Settings } from "lucide-react-native";
import { Pressable, View, Text, StyleSheet } from "react-native";
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
            <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg }}>
                <StatusBar style={theme === "dark" ? "light" : "dark"} />
                <Text style={{ color: colors.white, fontSize: 22, fontWeight: "900", marginBottom: 10 }}>
                    启动失败
                </Text>
                <Text style={{ color: colors.gray4, fontSize: 14, lineHeight: 22, marginBottom: 20 }}>
                    {dbError}
                </Text>
                <Pressable
                    onPress={() => {
                        setDbInitialized(false);
                        setRetryKey((prev) => prev + 1);
                    }}
                    style={{ alignSelf: "flex-start", backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 }}
                >
                    <Text style={{ color: colors.bg, fontSize: 14, fontWeight: "900" }}>重试</Text>
                </Pressable>
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
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 32,
                        marginHorizontal: 20,
                        left: 0,
                        right: 0,
                        backgroundColor: 'transparent',
                        borderColor: colors.border,
                        borderTopColor: colors.border,
                        borderWidth: 1,
                        borderTopWidth: 1,
                        borderRadius: 16, // match rounded-bento-lg (16px)
                        height: 70,
                        paddingBottom: 0,
                        paddingTop: 0,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 16 },
                        shadowOpacity: 0.08, // 降低阴影突兀感
                        shadowRadius: 32,    // 极大的模糊半径让阴影更柔和
                        elevation: 8,
                    },
                    tabBarBackground: () => (
                        <View style={{ 
                            ...StyleSheet.absoluteFillObject, 
                            backgroundColor: colors.bento, 
                            borderRadius: 16, 
                            overflow: 'hidden' 
                        }}>
                            {/* 1. 全局极弱环境光 (3% opacity) - 贴近物理材质 */}
                            <View style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: '#FFFFFF',
                                opacity: 0.03,
                            }} />
                            {/* 2. 顶部柔软弥散高光 (8% opacity, 极大的模糊) */}
                            <View style={{
                                position: 'absolute',
                                top: -50,
                                left: '10%',
                                right: '10%',
                                height: 50,
                                backgroundColor: '#FFFFFF',
                                shadowColor: '#FFFFFF',
                                shadowOffset: { width: 0, height: 25 },
                                shadowOpacity: 0.08,
                                shadowRadius: 40, 
                                borderRadius: 100,
                                elevation: 0,
                            }} />
                        </View>
                    ),
                    tabBarShowLabel: false,
                    tabBarLabelPosition: 'beside-icon',
                    tabBarActiveTintColor: colors.white,
                    tabBarInactiveTintColor: colors.gray4,
                    tabBarItemStyle: {
                        height: 70,
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
