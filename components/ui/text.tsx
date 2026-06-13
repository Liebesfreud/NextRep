import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
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

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
    ({ className, variant, ...props }, ref) => (
        <RNText ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
    )
);
Text.displayName = "Text";

export { Text, textVariants };
