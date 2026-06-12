import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
    ({ className, placeholderTextColor, ...props }, ref) => {
        const { colors } = useTheme();

        return (
            <TextInput
                ref={ref}
                className={cn(
                    "min-h-10 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground web:outline-none web:ring-offset-background web:focus-visible:ring-2 web:focus-visible:ring-ring disabled:opacity-50 native:min-h-12",
                    className
                )}
                placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
