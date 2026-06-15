import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const textVariants = cva("text-body text-foreground", {
    variants: {
        variant: {
            default: "text-body text-foreground",
            title: "text-title",
            heading: "text-heading",
            subheading: "text-subheading",
            body: "text-body text-muted-foreground leading-relaxed",
            "body-semibold": "text-body-semibold text-foreground",
            muted: "text-caption text-tertiary",
            caption: "text-caption text-muted-foreground",
            micro: "text-micro text-tertiary",
            label: "text-body-semibold text-foreground font-medium leading-none",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

type TextProps = RNTextProps & VariantProps<typeof textVariants>;

const explicitColorPattern = /(?:^|\s)text-(?:foreground|accent|muted-foreground|tertiary|primary|primary-foreground|secondary|secondary-foreground|destructive|destructive-foreground|danger|success|warning|info|white|black|viz-[^\s]+)(?:\s|$)/;

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
    ({ className, variant, style, ...props }, ref) => {
        const { colors } = useTheme();
        const resolvedVariant = variant ?? "default";
        const defaultColor = resolvedVariant === "body" || resolvedVariant === "caption"
            ? colors.mutedForeground
            : resolvedVariant === "muted" || resolvedVariant === "micro"
                ? colors.textTertiary
                : colors.foreground;
        const fallbackStyle = className && explicitColorPattern.test(className)
            ? undefined
            : { color: defaultColor };

        return (
            <RNText
                ref={ref}
                className={cn(textVariants({ variant }), className)}
                style={[fallbackStyle, style]}
                {...props}
            />
        );
    }
);
Text.displayName = "Text";

export { Text, textVariants };
