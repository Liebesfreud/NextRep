import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { User } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type UserProfileData } from "@/db/services/profile";

// ─── Simple Picker Option ─────────────────────────────────────────────────────
function PickerSelect({
    label, value, options, onChange, colors,
}: {
    label: string;
    value: string | null;
    options: { label: string; value: string }[];
    onChange: (v: string | null) => void;
    colors: any;
}) {
    const currentLabel = options.find(o => o.value === value)?.label || "未设置";
    return (
        <Pressable
            onPress={() => {
                const allOpts = [{ label: "未设置", value: "" }, ...options];
                Alert.alert(label, undefined, [
                    ...allOpts.map(o => ({
                        text: o.label,
                        style: o.value === value ? "destructive" as const : "default" as const,
                        onPress: () => onChange(o.value || null),
                    })),
                    { text: "取消", style: "cancel" },
                ]);
            }}
            style={{ flex: 1, alignItems: "flex-end" }}
        >
            <Text style={{ color: colors.white, backgroundColor: colors.gray2, fontWeight: "700", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 80, textAlign: "right" }}>
                {currentLabel}
            </Text>
        </Pressable>
    );
}

type Props = {
    profile: UserProfileData;
    setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function ProfileSettings({ profile, setProfile }: Props) {
    const { colors } = useTheme();

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
            <View className="flex-row items-center gap-2 px-1">
                <User size={18} color={colors.gray4} />
                <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">个人指标</Text>
            </View>

            <View className="gap-3">
                <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-row items-center justify-between pl-4 pr-3 py-3 rounded-bento-sm border">
                    <Text style={{ color: colors.white }} className="font-bold text-base">昵称</Text>
                    <TextInput
                        value={profile.name}
                        onChangeText={(v) => setProfile(p => ({ ...p, name: v }))}
                        placeholder="输入昵称"
                        placeholderTextColor={`${colors.gray4}66`}
                        className="text-right font-bold text-base min-w-[120px]"
                        style={{ color: colors.gray4 }}
                    />
                </View>

                <View className="flex-row gap-3">
                    <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 items-center p-4 rounded-bento-sm border gap-2">
                        <Text style={{ color: colors.white }} className="font-bold text-sm">身高 (cm)</Text>
                        <TextInput
                            keyboardType="number-pad"
                            value={profile.height ? String(profile.height) : ""}
                            onChangeText={(v) => setProfile(p => ({ ...p, height: v ? parseFloat(v) : null }))}
                            placeholder="--"
                            placeholderTextColor={`${colors.gray4}66`}
                            className="text-center font-extrabold text-2xl"
                            style={{ color: colors.green }}
                        />
                    </View>
                    <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 items-center p-4 rounded-bento-sm border gap-2">
                        <Text style={{ color: colors.white }} className="font-bold text-sm">年龄</Text>
                        <TextInput
                            keyboardType="number-pad"
                            value={profile.age ? String(profile.age) : ""}
                            onChangeText={(v) => setProfile(p => ({ ...p, age: v ? parseInt(v) : null }))}
                            placeholder="--"
                            placeholderTextColor={`${colors.gray4}66`}
                            className="text-center font-extrabold text-2xl"
                            style={{ color: colors.orange }}
                        />
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <View style={{ flex: 1 }}>
                        <PickerSelect
                            label="选择性别"
                            value={profile.gender}
                            options={[
                                { label: "男生", value: "male" },
                                { label: "女生", value: "female" },
                                { label: "其他", value: "other" },
                            ]}
                            onChange={(v) => setProfile(p => ({ ...p, gender: v }))}
                            colors={colors}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <PickerSelect
                            label="当前目标"
                            value={profile.goal}
                            options={[
                                { label: "增肌", value: "build-muscle" },
                                { label: "减脂", value: "lose-weight" },
                                { label: "保持", value: "maintain" },
                            ]}
                            onChange={(v) => setProfile(p => ({ ...p, goal: v }))}
                            colors={colors}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}
