import { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { Calendar, ChevronDown, Ruler, Target, User, Venus } from "lucide-react-native";
import { MotiView } from "moti";
import { SNAPPY_SPRING } from "@/constants/animations";
import { type UserProfileData } from "@/db/services/profile";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { SettingsRow } from "@/components/ui/settings-row";

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
            className="h-auto rounded-lg px-3 py-1.5"
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
      <Text variant="caption">{unit}</Text>
    </View>
  );
}

export function ProfileSettings({ profile, setProfile }: Props) {
  const { colors } = useTheme();

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  return (
    <Card className="overflow-hidden p-0">
      {/* Section label */}
      <Pressable
        onPress={toggleCollapse}
        className="flex-row items-center justify-between px-3.5 pt-2.5 pb-1.5"
      >
        <Text variant="caption" className="font-semibold text-tertiary">
          个人资料
        </Text>
        <MotiView
          animate={{ rotate: collapsed ? "0deg" : "180deg" }}
          transition={SNAPPY_SPRING}
        >
          <ChevronDown size={14} color={colors.textTertiary} />
        </MotiView>
      </Pressable>

      {!collapsed && (<>
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
        </>
      )}
    </Card>
  );
}
