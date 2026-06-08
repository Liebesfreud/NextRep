import { Pressable, View } from "react-native";
import { Calendar, Ruler, Target, User, Venus } from "lucide-react-native";
import { type UserProfileData } from "@/db/services/profile";
import { useTheme } from "@/hooks/useTheme";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

function RowField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <View className="flex-row items-center border-b border-border px-3.5 py-3">
            <View className="mr-3 flex-1 flex-row items-center gap-2">
                {icon}
                <Text variant="label" className="text-muted-foreground">
                    {label}
                </Text>
            </View>
            {children}
        </View>
    );
}

function ChipPicker({
    value,
    options,
    onChange,
}: {
    value: string | null;
    options: { label: string; value: string }[];
    onChange: (value: string | null) => void;
}) {
    return (
        <View className="flex-row gap-1.5">
            {options.map((option) => {
                const isSelected = option.value === value;
                return (
                    <Pressable key={option.value} onPress={() => onChange(isSelected ? null : option.value)}>
                        <Badge variant={isSelected ? "default" : "secondary"} className="rounded-lg px-3 py-1.5">
                            <BadgeText variant={isSelected ? "default" : "secondary"}>{option.label}</BadgeText>
                        </Badge>
                    </Pressable>
                );
            })}
        </View>
    );
}

function NumericInput({
    value,
    onChange,
    placeholder,
    unit,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    unit: string;
    className?: string;
}) {
    return (
        <View className="flex-row items-center gap-1">
            <Input
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                className={cn("min-h-0 min-w-12 border-0 bg-transparent p-0 text-right text-base font-extrabold", className)}
            />
            <Text variant="caption" className="font-semibold">
                {unit}
            </Text>
        </View>
    );
}

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
        <Card className="overflow-hidden p-0">
            <View className="flex-row items-center gap-2 px-3.5 py-3">
                <User size={14} color={colors.gray4} />
                <Text variant="caption" className="font-extrabold uppercase tracking-[1.5px]">
                    个人指标
                </Text>
            </View>
            <Separator />

            <RowField icon={<User size={15} color={colors.gray4} strokeWidth={2} />} label="昵称">
                <Input
                    value={profile.name}
                    onChangeText={(value) => setProfile((current) => ({ ...current, name: value }))}
                    placeholder="输入昵称"
                    className="min-h-0 min-w-20 border-0 bg-transparent p-0 text-right text-sm font-bold"
                />
            </RowField>

            <View className="flex-row border-b border-border">
                <View className="flex-1 flex-row items-center gap-2 px-3.5 py-3">
                    <Ruler size={15} color={colors.gray4} strokeWidth={2} />
                    <Text variant="label" className="flex-1 text-muted-foreground">
                        身高
                    </Text>
                    <NumericInput
                        value={profile.height ? String(profile.height) : ""}
                        onChange={(value) => setProfile((current) => ({ ...current, height: value ? parseFloat(value) : null }))}
                        placeholder="---"
                        unit="cm"
                        className="text-accent"
                    />
                </View>
                <Separator orientation="vertical" className="my-2" />
                <View className="flex-1 flex-row items-center gap-2 px-3.5 py-3">
                    <Calendar size={15} color={colors.gray4} strokeWidth={2} />
                    <Text variant="label" className="flex-1 text-muted-foreground">
                        年龄
                    </Text>
                    <NumericInput
                        value={profile.age ? String(profile.age) : ""}
                        onChange={(value) => setProfile((current) => ({ ...current, age: value ? parseInt(value, 10) : null }))}
                        placeholder="--"
                        unit="岁"
                        className="text-primary"
                    />
                </View>
            </View>

            <RowField icon={<Venus size={15} color={colors.gray4} strokeWidth={2} />} label="性别">
                <ChipPicker
                    value={profile.gender}
                    options={genderOptions}
                    onChange={(value) => setProfile((current) => ({ ...current, gender: value }))}
                />
            </RowField>

            <View className="flex-row border-b border-border">
                <View className="flex-1 flex-row items-center gap-2 px-3.5 py-3">
                    <Target size={15} color={colors.gray4} strokeWidth={2} />
                    <Text variant="label" className="flex-1 text-muted-foreground">
                        目标体重
                    </Text>
                    <NumericInput
                        value={profile.targetWeight ? String(profile.targetWeight) : ""}
                        onChange={(value) => setProfile((current) => ({ ...current, targetWeight: value ? parseFloat(value) : null }))}
                        placeholder="--"
                        unit="kg"
                        className="text-primary"
                    />
                </View>
                <Separator orientation="vertical" className="my-2" />
                <View className="flex-1 flex-row items-center gap-2 px-3.5 py-3">
                    <Target size={15} color={colors.gray4} strokeWidth={2} />
                    <Text variant="label" className="flex-1 text-muted-foreground">
                        目标体脂
                    </Text>
                    <NumericInput
                        value={profile.targetBodyFat ? String(profile.targetBodyFat) : ""}
                        onChange={(value) => setProfile((current) => ({ ...current, targetBodyFat: value ? parseFloat(value) : null }))}
                        placeholder="--"
                        unit="%"
                        className="text-accent"
                    />
                </View>
            </View>

            <RowField icon={<Target size={15} color={colors.gray4} strokeWidth={2} />} label="训练目标">
                <ChipPicker
                    value={profile.goal}
                    options={goalOptions}
                    onChange={(value) => setProfile((current) => ({ ...current, goal: value }))}
                />
            </RowField>
        </Card>
    );
}
