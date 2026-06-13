import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/db/services/profile";
import * as SplashScreen from "expo-splash-screen";

// Settings Components
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AiConfigSettings } from "@/components/settings/AiConfigSettings";
import { DataManagementSettings } from "@/components/settings/DataManagementSettings";

export default function SettingsScreen() {
    const mountedRef = useRef(true);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    useEffect(() => {
        getUserProfile()
            .then((p) => {
                if (!mountedRef.current) return;
                setProfile(p);
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
        setIsPending(true);
        try {
            await updateUserProfile(profile);
            if (!mountedRef.current) return;
            setIsSaved(true);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                saveTimerRef.current = null;
                if (mountedRef.current) setIsSaved(false);
            }, 2000);
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 100, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <SettingsHeader
                    onSave={handleSave}
                    isPending={isPending}
                    isSaved={isSaved}
                />

                <ProfileSettings
                    profile={profile}
                    setProfile={setProfile}
                />

                <AppearanceSettings />

                <AiConfigSettings
                    profile={profile}
                    setProfile={setProfile}
                />

                <DataManagementSettings />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
