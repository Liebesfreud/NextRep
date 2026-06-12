import * as React from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text as RNText } from "react-native";
import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 flex-row items-center justify-center gap-2 rounded-bento-sm active:opacity-80 disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary",
                secondary: "bg-secondary",
                destructive: "bg-destructive",
                outline: "border border-border bg-transparent",
                ghost: "bg-transparent",
                link: "bg-transparent web:underline-offset-4 web:hover:underline",
            },
            size: {
                default: "h-12 px-5 py-3",
                sm: "h-10 px-4 py-2",
                lg: "h-14 px-6 py-4",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const buttonTextVariants = cva("text-sm font-black", {
    variants: {
        variant: {
            default: "text-primary-foreground",
            secondary: "text-secondary-foreground",
            destructive: "text-destructive-foreground",
            outline: "text-foreground",
            ghost: "text-foreground",
            link: "text-primary",
        },
        size: {
            default: "text-sm",
            sm: "text-xs",
            lg: "text-base",
            icon: "text-sm",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

type ButtonContextValue = {
    variant: ButtonProps["variant"];
    size: ButtonProps["size"];
};

const ButtonContext = React.createContext<ButtonContextValue>({
    variant: "default",
    size: "default",
});

type ButtonProps = PressableProps &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        loading?: boolean;
        indicatorColor?: string;
    };

function getIndicatorColor(variant: ButtonProps["variant"], colors: ReturnType<typeof useTheme>["colors"]) {
    if (variant === "default") return colors.primaryForeground;
    if (variant === "destructive") return colors.destructiveForeground;
    return colors.orange;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, indicatorColor, disabled, children, ...props }, ref) => {
        const Component = asChild ? Slot : Pressable;
        const isDisabled = disabled || loading;
        const { colors } = useTheme();

        return (
            <ButtonContext.Provider value={{ variant, size }}>
                <Component
                    ref={ref}
                    className={cn(buttonVariants({ variant, size }), className)}
                    disabled={isDisabled}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isDisabled }}
                    {...props}
                >
                    {loading ? <ActivityIndicator size="small" color={indicatorColor ?? getIndicatorColor(variant, colors)} /> : children}
                </Component>
            </ButtonContext.Provider>
        );
    }
);
Button.displayName = "Button";

type ButtonTextProps = React.ComponentPropsWithoutRef<typeof RNText> & VariantProps<typeof buttonTextVariants>;

const ButtonText = React.forwardRef<React.ElementRef<typeof RNText>, ButtonTextProps>(
    ({ className, variant, size, ...props }, ref) => {
        const context = React.useContext(ButtonContext);

        return (
            <RNText
                ref={ref}
                className={cn(
                    buttonTextVariants({
                        variant: variant ?? context.variant,
                        size: size ?? context.size,
                    }),
                    className
                )}
                {...props}
            />
        );
    }
);
ButtonText.displayName = "ButtonText";

export { Button, ButtonText, buttonTextVariants, buttonVariants };
