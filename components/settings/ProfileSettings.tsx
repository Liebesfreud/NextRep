import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { User, Ruler, Calendar, Venus, Target } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type UserProfileData } from "@/db/services/profile";

// ─── Inline Row Item ──────────────────────────────────────────────────────────
function RowField({
    icon, label, children, colors,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    colors: any;
}) {
    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 11,
            paddingHorizontal: 14,
            borderBottomWidth: 1,
            borderBottomColor: `${colors.border}`,
        }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                {icon}
                <Text style={{ color: colors.gray4, fontSize: 13, fontWeight: "600" }}>{label}</Text>
            </View>
            {children}
        </View>
    );
}

// ─── Chip Picker ──────────────────────────────────────────────────────────────
function ChipPicker({
    value, options, onChange, accentColor, colors,
}: {
    value: string | null;
    options: { label: string; value: string }[];
    onChange: (v: string | null) => void;
    accentColor: string;
    colors: any;
}) {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {options.map(opt => {
                const isSelected = opt.value === value;
                return (
                    <Pressable
                        key={opt.value}
                        onPress={() => onChange(isSelected ? null : opt.value)}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            borderRadius: 8,
                            backgroundColor: isSelected ? `${accentColor}26` : colors.gray3,
                            borderWidth: 1,
                            borderColor: isSelected ? `${accentColor}66` : "transparent",
                        }}
                    >
                        <Text style={{
                            color: isSelected ? accentColor : colors.gray4,
                            fontSize: 12,
                            fontWeight: "700",
                        }}>
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

// ─── Inline Number Input ──────────────────────────────────────────────────────
function NumericInput({
    value, onChange, placeholder, unit, color, colors,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    unit: string;
    color: string;
    colors: any;
}) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <TextInput
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={`${colors.gray4}55`}
                style={{
                    color,
                    fontWeight: "800",
                    fontSize: 16,
                    minWidth: 48,
                    textAlign: "right",
                    padding: 0,
                }}
            />
            <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "600" }}>{unit}</Text>
        </View>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Props = {
    profile: UserProfileData;
    setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function ProfileSettings({ profile, setProfile }: Props) {
    const { colors } = useTheme();

    const genderOptions = [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
        { label: "其他", value: "other" },
    ];
    const goalOptions = [
        { label: "增肌", value: "build-muscle" },
        { label: "减脂", value: "lose-weight" },
        { label: "保持", value: "maintain" },
    ];

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden" }}>
            {/* Section Header */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <User size={14} color={colors.gray4} />
                <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>个人指标</Text>
            </View>

            {/* 昵称 */}
            <RowField
                icon={<User size={15} color={colors.gray4} strokeWidth={2} />}
                label="昵称"
                colors={colors}
            >
                <TextInput
                    value={profile.name}
                    onChangeText={(v) => setProfile(p => ({ ...p, name: v }))}
                    placeholder="输入昵称"
                    placeholderTextColor={`${colors.gray4}55`}
                    style={{
                        color: colors.white,
                        fontWeight: "700",
                        fontSize: 14,
                        textAlign: "right",
                        padding: 0,
                        minWidth: 80,
                    }}
                />
            </RowField>

            {/* 身高 & 年龄 同行 */}
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14, gap: 8 }}>
                    <Ruler size={15} color={colors.gray4} strokeWidth={2} />
                    <Text style={{ color: colors.gray4, fontSize: 13, fontWeight: "600", flex: 1 }}>身高</Text>
                    <NumericInput
                        value={profile.height ? String(profile.height) : ""}
                        onChange={(v) => setProfile(p => ({ ...p, height: v ? parseFloat(v) : null }))}
                        placeholder="---"
                        unit="cm"
                        color={colors.green}
                        colors={colors}
                    />
                </View>

                {/* 竖分割线 */}
                <View style={{ width: 1, backgroundColor: colors.border, marginVertical: 8 }} />

                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14, gap: 8 }}>
                    <Calendar size={15} color={colors.gray4} strokeWidth={2} />
                    <Text style={{ color: colors.gray4, fontSize: 13, fontWeight: "600", flex: 1 }}>年龄</Text>
                    <NumericInput
                        value={profile.age ? String(profile.age) : ""}
                        onChange={(v) => setProfile(p => ({ ...p, age: v ? parseInt(v) : null }))}
                        placeholder="--"
                        unit="岁"
                        color={colors.orange}
                        colors={colors}
                    />
                </View>
            </View>

            {/* 性别 */}
            <RowField
                icon={<Venus size={15} color={colors.gray4} strokeWidth={2} />}
                label="性别"
                colors={colors}
            >
                <ChipPicker
                    value={profile.gender}
                    options={genderOptions}
                    onChange={(v) => setProfile(p => ({ ...p, gender: v }))}
                    accentColor={colors.green}
                    colors={colors}
                />
            </RowField>

            {/* 目标 —— 最后一行无下边框 */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Target size={15} color={colors.gray4} strokeWidth={2} />
                    <Text style={{ color: colors.gray4, fontSize: 13, fontWeight: "600" }}>目标</Text>
                </View>
                <ChipPicker
                    value={profile.goal}
                    options={goalOptions}
                    onChange={(v) => setProfile(p => ({ ...p, goal: v }))}
                    accentColor={colors.orange}
                    colors={colors}
                />
            </View>
        </View>
    );
}
