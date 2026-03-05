import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
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

export default function SettingsScreen() {
    const { colors } = useTheme();
    const [isSaved, setIsSaved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [profile, setProfile] = useState<UserProfileData>({
        name: "健身达人",
        height: null,
        age: null,
        gender: null,
        goal: null,
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
        getUserProfile().then((p) => {
            setProfile(p);
            SplashScreen.hideAsync().catch(() => { });
        });
    }, []);

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateUserProfile(profile);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
                    <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest mb-1.5">NEXTREP V1.0</Text>
                    <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">本地优先の健身数据管家</Text>
                </View>
            </ScrollView>
        </View>
    );
}
