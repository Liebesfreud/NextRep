import { useState, useRef, useEffect, useCallback } from "react";
import {
    View, Text, ScrollView, Pressable, TextInput,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import Markdown from "react-native-markdown-display";
import { Send, Bot, Loader2, Sparkles, AlertCircle, FileText } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { chatWithAI } from "@/db/services/ai";
import { db } from "@/db/client";
import { workouts, bodyMetrics } from "@/db/schema";
import { desc } from "drizzle-orm";

export default function AiCoachScreen() {
    const { colors } = useTheme();
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    // Preload context data for AI
    const [contextData, setContextData] = useState<{
        recentWorkouts: any[];
        recentMetrics: any[];
    }>({ recentWorkouts: [], recentMetrics: [] });

    useFocusEffect(useCallback(() => {
        // Load recent workouts and metrics for AI context
        Promise.all([
            db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(10),
            db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.dateStr)).limit(5),
        ]).then(([ws, ms]) => {
            setContextData({
                recentWorkouts: ws.map(w => ({
                    name: w.name,
                    weight: w.weight,
                    sets: w.sets,
                    stats: w.stats,
                    createdAt: new Date(w.createdAt).toISOString(),
                })),
                recentMetrics: ms.map(m => ({
                    metricType: m.metricType,
                    dateStr: m.dateStr,
                    value: m.value,
                })),
            });
        });
    }, []));

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        setError(null);
        const newMessages = [...messages, { role: "user" as const, content: text }];
        setMessages(newMessages);
        setIsLoading(true);
        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const reply = await chatWithAI(
                history,
                text,
                contextData.recentWorkouts,
                contextData.recentMetrics,
            );
            setMessages([...newMessages, { role: "assistant", content: reply }]);
        } catch (e: any) {
            setError(e.message || "请求 AI 时发生错误");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput("");
    };

    const handleGenerateReport = () => {
        sendMessage("请根据我最近的数据，深入分析我的表现，生成一份训练报告，包括：1.总体评价 2.强度打分 3.具体动作建议 4.明日恢复计划");
    };

    const markdownStyles = {
        body: { color: colors.white, fontSize: 14, lineHeight: 22 },
        strong: { color: colors.green },
        link: { color: colors.green },
        code_block: { backgroundColor: colors.gray2, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.border },
        code_inline: { backgroundColor: colors.gray2, borderRadius: 4, paddingHorizontal: 4 },
        heading1: { color: colors.white, fontWeight: "700" as const },
        heading2: { color: colors.white, fontWeight: "700" as const },
        heading3: { color: colors.white, fontWeight: "600" as const },
        list_item: { color: colors.white },
        bullet_list_icon: { color: colors.green },
        ordered_list_icon: { color: colors.green },
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80}
        >
            {/* ── Header ── */}
            <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: `${colors.bg}CC`, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View style={{ backgroundColor: `${colors.green}33` }} className="w-8 h-8 rounded-full items-center justify-center">
                            <Sparkles size={16} color={colors.green} />
                        </View>
                        <View>
                            <Text style={{ color: colors.white }} className="text-xl font-bold leading-none">AI 教练</Text>
                            <View className="flex-row items-center gap-1.5 mt-1">
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
                                <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest uppercase">在线</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable
                        onPress={handleGenerateReport}
                        disabled={isLoading}
                        style={{ backgroundColor: colors.border, borderColor: colors.border, borderWidth: 1, opacity: isLoading ? 0.5 : 1 }}
                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    >
                        <FileText size={14} color={colors.orange} />
                        <Text style={{ color: colors.white }} className="text-xs font-bold">今日报告</Text>
                    </Pressable>
                </View>
            </View>

            {/* ── Chat Area ── */}
            <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 16 }}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="interactive"
            >
                {messages.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20" style={{ opacity: 0.5 }}>
                        <Bot size={64} color={colors.gray4} />
                        <View className="items-center mt-4">
                            <Text style={{ color: colors.gray3 }} className="font-bold text-sm">今天想聊点什么练法？</Text>
                            <Text style={{ color: colors.gray4 }} className="text-xs mt-1">你可以问我如何安排训练，或者记录的建议</Text>
                        </View>
                        <Pressable
                            onPress={handleGenerateReport}
                            style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33`, borderWidth: 1 }}
                            className="flex-row items-center gap-2 mt-6 px-4 py-2 rounded-xl"
                        >
                            <FileText size={16} color={colors.green} />
                            <Text style={{ color: colors.green }} className="text-sm font-bold">生成今日报告</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="gap-bento">
                        {messages.map((msg, idx) => (
                            <View key={idx} className={`flex-row ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <View
                                    style={{
                                        maxWidth: "85%",
                                        borderRadius: 16,
                                        padding: 12,
                                        paddingHorizontal: 16,
                                        backgroundColor: msg.role === "user"
                                            ? colors.green
                                            : `${colors.gray2}CC`,
                                        borderTopRightRadius: msg.role === "user" ? 4 : 16,
                                        borderTopLeftRadius: msg.role === "user" ? 16 : 4,
                                        borderBottomLeftRadius: 16,
                                        borderBottomRightRadius: 16,
                                        borderWidth: msg.role === "assistant" ? 1 : 0,
                                        borderColor: colors.border,
                                    }}
                                >
                                    {msg.role === "assistant" ? (
                                        <Markdown style={markdownStyles}>{msg.content}</Markdown>
                                    ) : (
                                        <Text style={{ color: colors.white, fontSize: 14, fontWeight: "500" }}>
                                            {msg.content}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}

                        {isLoading && (
                            <View className="flex-row justify-start">
                                <View style={{ backgroundColor: `${colors.gray2}CC`, borderRadius: 16, borderTopLeftRadius: 4, padding: 16, borderWidth: 1, borderColor: colors.border }}
                                    className="flex-row items-center gap-2">
                                    <ActivityIndicator size="small" color={colors.green} />
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold">正在思考...</Text>
                                </View>
                            </View>
                        )}

                        {error && (
                            <View className="items-center">
                                <View style={{ backgroundColor: `${colors.red}1A`, borderColor: `${colors.red}33`, borderWidth: 1 }}
                                    className="flex-row items-center gap-2 px-4 py-2 rounded-lg">
                                    <AlertCircle size={16} color={colors.red} />
                                    <Text style={{ color: colors.red }} className="text-xs font-bold">{error}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ── Input Area ── */}
            <View style={{ padding: 16, backgroundColor: `${colors.bg}CC`, borderTopWidth: 0.5, borderTopColor: colors.border }}>
                <View className="relative">
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                        placeholder="向 AI 教练提问..."
                        placeholderTextColor={`${colors.gray4}99`}
                        returnKeyType="send"
                        editable={!isLoading}
                        style={{
                            color: colors.white,
                            backgroundColor: `${colors.gray2}CC`,
                            fontSize: 14,
                            fontWeight: "500",
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            paddingRight: 52,
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: colors.border,
                            opacity: isLoading ? 0.5 : 1,
                        }}
                    />
                    <Pressable
                        onPress={handleSend}
                        disabled={!input.trim() || isLoading}
                        style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            marginTop: -16,
                            width: 32,
                            height: 32,
                            borderRadius: 12,
                            backgroundColor: colors.green,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: (!input.trim() || isLoading) ? 0.3 : 1,
                        }}
                    >
                        <Send size={16} color={colors.white} />
                    </Pressable>
                </View>
                <Text style={{ color: colors.gray4 }} className="text-center mt-2.5 text-xs font-bold uppercase tracking-wider">
                    Powered by OpenAI Compatible API
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}
