import { useState } from "react";
import { Pressable, View } from "react-native";
import { Calendar, ChevronDown, Ruler, Target, User, Venus } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, FadeOutUp } from "react-native-reanimated";
import { type UserProfileData } from "@/db/services/profile";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { SettingsRow } from "@/components/settings/settings-row";

type Props = {
  profile: UserProfileData;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

function ChipPicker({
  value,
  options,
  onChange,
}: {
  value: string | null;
  options: { label: string; value: string }[];
  onChange: (v: string | null) => void;
}) {
  return (
    <View className="flex-row gap-1.5">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Button
            key={opt.value}
            onPress={() => onChange(isSelected ? null : opt.value)}
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            className="h-10 rounded-md px-3 py-0 native:h-11"
          >
            <ButtonText variant={isSelected ? "default" : "secondary"} size="sm">
              {opt.label}
            </ButtonText>
          </Button>
        );
      })}
    </View>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  unit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit: string;
}) {
  return (
    <View className="flex-row items-center gap-1">
      <Input
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        className="min-h-0 w-14 border-0 bg-transparent p-0 text-right text-body-semibold text-foreground font-variant-numeric-tabular-nums"
      />
      <Text variant="caption" className="text-muted-foreground">{unit}</Text>
    </View>
  );
}

export function ProfileSettings({ profile, setProfile }: Props) {
  const { colors } = useTheme();

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    setCollapsed((p) => !p);
  };

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
  const goalLabel = goalOptions.find((option) => option.value === profile.goal)?.label ?? "未设置目标";

  return (
    <Card className="gap-4 p-card-padding">
      <Pressable
        onPress={toggleCollapse}
        className="gap-4"
        accessibilityRole="button"
        accessibilityLabel={collapsed ? "展开个人资料" : "收起个人资料"}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <User size={18} color={colors.accent} />
            <Text variant="subheading">个人资料</Text>
          </View>
          <Animated.View
            key={collapsed ? "collapsed" : "expanded"}
            entering={FadeIn.duration(150)}
            style={{ transform: [{ rotate: collapsed ? "0deg" : "180deg" }] }}
          >
            <ChevronDown size={16} color={colors.textTertiary} />
          </Animated.View>
        </View>

        <View className="flex-row items-center gap-3 rounded-lg bg-surface-elevated p-card-padding">
          <View className="h-11 w-11 items-center justify-center rounded-md bg-accent/10">
            <Text variant="subheading" className="text-accent">{profile.name.trim().slice(0, 1) || "N"}</Text>
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="body-semibold" numberOfLines={1}>{profile.name || "健身达人"}</Text>
            <Text variant="caption" className="text-muted-foreground">{goalLabel}</Text>
          </View>
        </View>
      </Pressable>

      {!collapsed && (
        <Animated.View className="overflow-hidden rounded-lg bg-surface-elevated" entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(160)}>
          <SettingsRow
            label="昵称"
            icon={<User size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <Input
                value={profile.name}
                onChangeText={(v) => setProfile((c) => ({ ...c, name: v }))}
                placeholder="未填写"
                className="min-h-0 min-w-24 border-0 bg-transparent p-0 text-right text-body text-foreground"
              />
            }
          />

          <SettingsRow
            label="身高"
            icon={<Ruler size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <NumInput
                value={profile.height ? String(profile.height) : ""}
                onChange={(v) => setProfile((c) => ({ ...c, height: v ? parseFloat(v) : null }))}
                placeholder="--"
                unit="cm"
              />
            }
          />

          <SettingsRow
            label="年龄"
            icon={<Calendar size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <NumInput
                value={profile.age ? String(profile.age) : ""}
                onChange={(v) => setProfile((c) => ({ ...c, age: v ? parseInt(v, 10) : null }))}
                placeholder="--"
                unit="岁"
              />
            }
          />

          <SettingsRow
            variant="chip"
            label="性别"
            icon={<Venus size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <ChipPicker
                value={profile.gender}
                options={genderOptions}
                onChange={(v) => setProfile((c) => ({ ...c, gender: v }))}
              />
            }
          />

          <SettingsRow
            label="目标体重"
            icon={<Target size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <NumInput
                value={profile.targetWeight ? String(profile.targetWeight) : ""}
                onChange={(v) => setProfile((c) => ({ ...c, targetWeight: v ? parseFloat(v) : null }))}
                placeholder="--"
                unit="kg"
              />
            }
          />

          <SettingsRow
            label="目标体脂"
            icon={<Target size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <NumInput
                value={profile.targetBodyFat ? String(profile.targetBodyFat) : ""}
                onChange={(v) => setProfile((c) => ({ ...c, targetBodyFat: v ? parseFloat(v) : null }))}
                placeholder="--"
                unit="%"
              />
            }
          />

          <SettingsRow
            variant="chip"
            label="训练目标"
            icon={<Target size={15} color={colors.textSecondary} strokeWidth={2} />}
            value={
              <ChipPicker
                value={profile.goal}
                options={goalOptions}
                onChange={(v) => setProfile((c) => ({ ...c, goal: v }))}
              />
            }
            isLast
          />
        </Animated.View>
      )}
    </Card>
  );
}
