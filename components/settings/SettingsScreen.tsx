import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/db/services/profile";
import * as SplashScreen from "expo-splash-screen";

// Settings Components
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AiConfigSettings } from "@/components/settings/AiConfigSettings";
import { DataManagementSettings } from "@/components/settings/DataManagementSettings";
import { TrainingSettings } from "@/components/settings/TrainingSettings";

export default function SettingsScreen() {
    const mountedRef = useRef(true);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savedProfileRef = useRef<string | null>(null);
    const insets = useSafeAreaInsets();
    const [isSaved, setIsSaved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [profile, setProfile] = useState<UserProfileData>({
        name: "健身达人",
        height: null,
        age: null,
        gender: null,
        goal: null,
        targetWeight: null,
        targetBodyFat: null,
        aiBaseUrl: null,
        aiApiKey: null,
        aiModel: null,
        aiConfigs: [],
        activeAiConfigId: null,
        aiTokensTotal: 0,
        aiTokensToday: 0,
        aiTokensDate: null,
    });
    const serializedProfile = useMemo(() => JSON.stringify(profile), [profile]);
    const isDirty = savedProfileRef.current !== null && serializedProfile !== savedProfileRef.current;

    useEffect(() => {
        getUserProfile()
            .then((p) => {
                if (!mountedRef.current) return;
                setProfile(p);
                savedProfileRef.current = JSON.stringify(p);
            })
            .catch(console.error)
            .finally(() => {
                if (mountedRef.current) SplashScreen.hideAsync().catch(() => { });
            });

        return () => {
            mountedRef.current = false;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const handleSave = async () => {
        if (!isDirty || isPending) return;
        setIsPending(true);
        try {
            await updateUserProfile(profile);
            if (!mountedRef.current) return;
            savedProfileRef.current = JSON.stringify(profile);
            setIsSaved(true);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                saveTimerRef.current = null;
                if (mountedRef.current) setIsSaved(false);
            }, 2000);
        } catch (error: any) {
            if (mountedRef.current) {
                Alert.alert("保存失败", error?.message || "设置未能保存，请稍后再试。");
            }
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-transparent" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 100, gap: 12 }}
                showsVerticalScrollIndicator={false}
            >
                <SettingsHeader
                    onSave={handleSave}
                    isPending={isPending}
                    isSaved={isSaved}
                    isDirty={isDirty}
                />

                <ProfileSettings
                    profile={profile}
                    setProfile={setProfile}
                />

                <AppearanceSettings />

                <TrainingSettings />

                <AiConfigSettings
                    profile={profile}
                    setProfile={setProfile}
                />

                <DataManagementSettings />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
