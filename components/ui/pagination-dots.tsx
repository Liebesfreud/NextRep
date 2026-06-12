import * as React from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type PaginationDotsProps = ViewProps & {
    count: number;
    activeIndex: number;
    onSelect?: (index: number) => void;
};

const PaginationDots = React.forwardRef<React.ElementRef<typeof View>, PaginationDotsProps>(
    ({ className, count, activeIndex, onSelect, ...props }, ref) => {
        const { colors } = useTheme();

        return (
            <View ref={ref} className={cn("flex-row items-center justify-center gap-1.5", className)} {...props}>
                {Array.from({ length: count }, (_, index) => {
                    const active = activeIndex === index;
                    return (
                        <Pressable
                            key={index}
                            accessibilityRole="button"
                            accessibilityLabel={`切换到第 ${index + 1} 页`}
                            accessibilityState={{ selected: active }}
                            onPress={() => onSelect?.(index)}
                            className="h-5 w-5 items-center justify-center active:opacity-80"
                        >
                            <MotiView
                                animate={{ width: active ? 14 : 5, opacity: active ? 1 : 0.72 }}
                                transition={{ type: "timing", duration: 180 }}
                                className="h-1.5 rounded-full"
                                style={{ backgroundColor: active ? colors.white : colors.border }}
                            />
                        </Pressable>
                    );
                })}
            </View>
        );
    }
);
PaginationDots.displayName = "PaginationDots";

export { PaginationDots, type PaginationDotsProps };
