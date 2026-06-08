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
                    "min-h-12 rounded-bento-sm border border-border bg-secondary px-4 py-3 text-base text-foreground web:outline-none web:ring-offset-background web:focus-visible:ring-2 web:focus-visible:ring-ring disabled:opacity-50",
                    className
                )}
                placeholderTextColor={placeholderTextColor ?? colors.gray4}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
