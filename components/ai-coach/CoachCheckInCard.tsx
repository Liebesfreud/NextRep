import { type ReactNode } from "react";
import { View } from "react-native";
import { Clock3, Flame, MapPin, Settings2, Sparkles } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type EnergyOption = "high" | "medium" | "low";
export type DurationOption = "20" | "40" | "60";
export type LocationOption = "gym" | "home";

export type CheckInState = {
    energy: EnergyOption;
    duration: DurationOption;
    location: LocationOption;
};

type Option = { key: string; label: string };

type Props = {
    value: CheckInState;
    isLoading: boolean;
    isConfigured: boolean;
    configLabel: string | null;
    onChange: (value: CheckInState) => void;
    onGenerate: () => void;
    onOpenSettings: () => void;
};

function CompactFilter({
    title,
    icon,
    value,
    options,
    onChange,
}: {
    title: string;
    icon: ReactNode;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
}) {
    return (
        <View className="gap-2">
            <View className="flex-row items-center gap-2">
                {icon}
                <Text variant="micro" className="font-semibold text-muted-foreground">{title}</Text>
            </View>
            <ToggleGroup value={value} onValueChange={onChange} className="w-full flex-nowrap bg-surface-elevated p-1">
                {options.map((option) => {
                    const active = option.key === value;
                    return (
                        <ToggleGroupItem
                            key={option.key}
                            value={option.key}
                            className="min-h-10 min-w-0 flex-1 px-2 native:min-h-11"
                            activeClassName="border-border-strong bg-surface"
                            inactiveClassName="border-transparent bg-transparent"
                        >
                            <Text variant="caption" className={active ? "font-semibold text-foreground" : "text-muted-foreground"}>
                                {option.label}
                            </Text>
                        </ToggleGroupItem>
                    );
                })}
            </ToggleGroup>
        </View>
    );
}

export function CoachCheckInCard({ value, isLoading, isConfigured, configLabel, onChange, onGenerate, onOpenSettings }: Props) {
    const { colors } = useTheme();

    return (
        <Card className="gap-4 p-card-padding">
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                    <Text variant="subheading">今天怎么练</Text>
                </View>
                {isConfigured && configLabel ? (
                    <View className="rounded-pill border border-border bg-surface-elevated px-3 py-1.5">
                        <Text variant="micro" className="text-foreground" numberOfLines={1}>{configLabel}</Text>
                    </View>
                ) : null}
            </View>

            <View className="gap-3">
                <CompactFilter
                    title="精力"
                    icon={<Flame size={15} color={colors.accent} />}
                    value={value.energy}
                    options={[{ key: "high", label: "很好" }, { key: "medium", label: "一般" }, { key: "low", label: "疲劳" }]}
                    onChange={(energy) => onChange({ ...value, energy: energy as EnergyOption })}
                />
                <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1">
                        <CompactFilter
                            title="时长"
                            icon={<Clock3 size={15} color={colors.textSecondary} />}
                            value={value.duration}
                            options={[{ key: "20", label: "20m" }, { key: "40", label: "40m" }, { key: "60", label: "60m+" }]}
                            onChange={(duration) => onChange({ ...value, duration: duration as DurationOption })}
                        />
                    </View>
                    <View className="min-w-0 flex-1">
                        <CompactFilter
                            title="地点"
                            icon={<MapPin size={15} color={colors.textSecondary} />}
                            value={value.location}
                            options={[{ key: "gym", label: "健身房" }, { key: "home", label: "家里" }]}
                            onChange={(location) => onChange({ ...value, location: location as LocationOption })}
                        />
                    </View>
                </View>
            </View>

            {isConfigured ? (
                <Button variant="accent" size="lg" loading={isLoading} onPress={onGenerate}>
                    {!isLoading && <Sparkles size={18} color={colors.white} strokeWidth={2.2} />}
                    <ButtonText variant="accent" size="lg">{isLoading ? "正在分析" : "生成今日建议"}</ButtonText>
                </Button>
            ) : (
                <View className="gap-3 rounded-lg border border-border bg-surface-elevated p-card-padding">
                    <Text variant="body-semibold">先连接 AI 教练</Text>
                    <Button variant="secondary" onPress={onOpenSettings}>
                        <Settings2 size={17} color={colors.foreground} />
                        <ButtonText variant="secondary">前往 AI 设置</ButtonText>
                    </Button>
                </View>
            )}
        </Card>
    );
}
