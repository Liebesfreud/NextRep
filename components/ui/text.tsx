import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
    variants: {
        variant: {
            default: "text-base",
            title: "text-3xl font-black tracking-tight",
            heading: "text-2xl font-black tracking-tight",
            subheading: "text-xl font-extrabold tracking-tight",
            body: "text-base leading-6",
            muted: "text-sm leading-5 text-muted-foreground",
            caption: "text-xs leading-4 text-muted-foreground",
            label: "text-sm font-bold",
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
