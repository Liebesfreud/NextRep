import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("text-sm text-foreground", {
    variants: {
        variant: {
            default: "text-sm",
            title: "text-3xl font-semibold tracking-tight",
            heading: "text-2xl font-semibold tracking-tight",
            subheading: "text-xl font-semibold tracking-tight",
            body: "text-sm leading-6",
            muted: "text-sm text-muted-foreground",
            caption: "text-xs text-muted-foreground",
            label: "text-sm font-medium leading-none",
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
