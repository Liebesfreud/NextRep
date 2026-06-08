import * as React from "react";
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

type ToggleGroupProps = ViewProps & {
    value: string;
    onValueChange: (value: string) => void;
};

const ToggleGroup = React.forwardRef<React.ElementRef<typeof View>, ToggleGroupProps>(
    ({ className, value, onValueChange, ...props }, ref) => (
        <ToggleGroupContext.Provider value={{ value, onValueChange }}>
            <View ref={ref} className={cn("flex-row flex-wrap gap-2", className)} {...props} />
        </ToggleGroupContext.Provider>
    )
);
ToggleGroup.displayName = "ToggleGroup";

type ToggleGroupItemProps = Omit<PressableProps, "onPress"> & {
    value: string;
    activeClassName?: string;
    inactiveClassName?: string;
};

const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof Pressable>, ToggleGroupItemProps>(
    ({ className, activeClassName, inactiveClassName, value, ...props }, ref) => {
        const context = React.useContext(ToggleGroupContext);
        if (!context) {
            throw new Error("ToggleGroupItem must be used within ToggleGroup");
        }

        const active = context.value === value;

        return (
            <Pressable
                ref={ref}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={cn(
                    "items-center justify-center rounded-full border px-3 py-2 active:opacity-80 disabled:opacity-50",
                    active ? (activeClassName ?? "border-primary bg-primary/15") : (inactiveClassName ?? "border-border bg-secondary"),
                    className
                )}
                onPress={() => context.onValueChange(value)}
                {...props}
            />
        );
    }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
