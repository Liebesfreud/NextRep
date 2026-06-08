import * as React from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type PaginationDotsProps = ViewProps & {
    count: number;
    activeIndex: number;
    onSelect?: (index: number) => void;
};

const PaginationDots = React.forwardRef<React.ElementRef<typeof View>, PaginationDotsProps>(
    ({ className, count, activeIndex, onSelect, ...props }, ref) => (
        <View ref={ref} className={cn("flex-row items-center justify-center gap-2", className)} {...props}>
            {Array.from({ length: count }, (_, index) => {
                const active = activeIndex === index;
                return (
                    <Pressable
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => onSelect?.(index)}
                        className={cn(
                            "h-1.5 rounded-full active:opacity-80",
                            active ? "w-[18px] bg-accent" : "w-1.5 bg-border"
                        )}
                    />
                );
            })}
        </View>
    )
);
PaginationDots.displayName = "PaginationDots";

export { PaginationDots, type PaginationDotsProps };
