import * as React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type CalendarDayCellProps = {
    day: number;
    onPress?: () => void;
    selected?: boolean;
    today?: boolean;
    marked?: boolean;
    disabled?: boolean;
    valueLabel?: string | number | null;
    width?: ViewStyle["width"];
    size?: number;
    className?: string;
};

const CalendarDayCell = React.memo(function CalendarDayCell({
    day,
    onPress,
    selected = false,
    today = false,
    marked = false,
    disabled = false,
    valueLabel,
    width,
    size = 34,
    className,
}: CalendarDayCellProps) {
    const { colors } = useTheme();
    const hasValueLabel = valueLabel !== null && valueLabel !== undefined;
    const foregroundColor = selected
        ? colors.primaryForeground
        : marked || today || hasValueLabel
            ? colors.green
            : colors.white;

    return (
        <View style={width ? { width } : undefined} className={cn("items-center", className)}>
            <Button
                onPress={onPress}
                disabled={disabled}
                variant="ghost"
                className="h-auto rounded-none bg-transparent p-0"
                style={{ width: size, height: size }}
            >
                <View
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected
                            ? colors.green
                            : marked || hasValueLabel
                                ? `${colors.green}18`
                                : "transparent",
                        borderWidth: today && !selected ? 1 : hasValueLabel ? 1 : 0,
                        borderColor: today
                            ? `${colors.green}66`
                            : hasValueLabel
                                ? `${colors.green}40`
                                : "transparent",
                        opacity: disabled ? 0.35 : 1,
                    }}
                >
                    <Text style={{ color: foregroundColor }} className="text-xs font-bold">
                        {day}
                    </Text>
                    {hasValueLabel ? (
                        <Text style={{ color: colors.green }} className="text-[8px] font-black leading-3">
                            {valueLabel}
                        </Text>
                    ) : null}
                </View>
            </Button>
        </View>
    );
});

export { CalendarDayCell, type CalendarDayCellProps };
