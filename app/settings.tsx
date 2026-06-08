import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/db/services/profile";
import * as SplashScreen from "expo-splash-screen";

// Settings Components
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AiConfigSettings } from "@/components/settings/AiConfigSettings";
import { DataManagementSettings } from "@/components/settings/DataManagementSettings";
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";
import { Text } from "@/components/ui/text";

export default function SettingsScreen() {
    const { colors } = useTheme();
    const mountedRef = useRef(true);
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
        };
    }, []);

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateUserProfile(profile);
            if (!mountedRef.current) return;
            setIsSaved(true);
            setTimeout(() => {
                if (mountedRef.current) setIsSaved(false);
            }, 2000);
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120, gap: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <AnimatedEnter delay={0} distance={10}>
                    <SettingsHeader
                        onSave={handleSave}
                        isPending={isPending}
                        isSaved={isSaved}
                    />
                </AnimatedEnter>

                <AnimatedEnter delay={50} distance={15}>
                    <AppearanceSettings />
                </AnimatedEnter>

                <AnimatedEnter delay={100} distance={15}>
                    <ProfileSettings
                        profile={profile}
                        setProfile={setProfile}
                    />
                </AnimatedEnter>

                <AnimatedEnter delay={150} distance={15}>
                    <AiConfigSettings
                        profile={profile}
                        setProfile={setProfile}
                    />
                </AnimatedEnter>

                <AnimatedEnter delay={200} distance={15}>
                    <DataManagementSettings />
                </AnimatedEnter>

                {/* ── Version ── */}
                <View className="items-center py-8 opacity-60">
                    <Text variant="caption" className="mb-1.5 font-extrabold tracking-widest">NEXTREP V1.0</Text>
                    <Text variant="caption" className="font-semibold">本地优先の健身数据管家</Text>
                </View>
            </ScrollView>
        </View>
    );
}
