import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type SettingsRowProps = {
  label: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  desc?: string;
  variant?: "default" | "destructive" | "chip";
  onPress?: () => void;
  disabled?: boolean;
  isLast?: boolean;
  className?: string;
};

export function SettingsRow({
  label,
  icon,
  value,
  desc,
  variant = "default",
  onPress,
  disabled = false,
  isLast = false,
  className,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const isTappable = !!onPress;
  const destructive = variant === "destructive";
  const useAnimated = isTappable && !destructive;
  const Wrapper = useAnimated ? AnimatedPressable : Pressable;

  const isChip = variant === "chip";

  const content = (
    <>
      {/* Icon */}
      {icon ? (
        <View className="mr-3 w-5 items-center">{icon}</View>
      ) : destructive ? (
        <View className="mr-3 w-5" />
      ) : null}

      {/* Label + desc */}
      <View className="flex-1">
        <Text
          variant="label"
          className={cn(destructive && "text-destructive")}
        >
          {label}
        </Text>
        {desc ? (
          <Text
            variant="caption"
            className={cn("mt-0.5", destructive ? "text-destructive/70" : "text-muted-foreground")}
          >
            {desc}
          </Text>
        ) : null}
      </View>

      {/* Value or chevron */}
      {value ? (
        <View className="ml-3 shrink-0">{value}</View>
      ) : null}
      {isTappable && !value ? (
        <ChevronRight
          size={16}
          color={destructive ? colors.red : colors.textTertiary}
          className="ml-2"
        />
      ) : null}
    </>
  );

  const pressableProps = isTappable
    ? {
        onPress,
        disabled,
        accessibilityRole: "button" as const,
        accessibilityLabel: label,
        accessibilityState: { disabled },
      }
    : {};

  return (
    <Wrapper
      className={cn(
        "h-auto flex-row items-center px-3.5 py-2.5",
        isChip && "py-3",
        !isLast && "border-b border-border",
        disabled && "opacity-50",
        className
      )}
      {...(useAnimated ? { activeScale: 0.99 } : {})}
      {...pressableProps}
    >
      {content}
    </Wrapper>
  );
}

export type { SettingsRowProps };
