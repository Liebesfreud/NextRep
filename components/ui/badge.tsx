import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

const badgeVariants = cva("self-start rounded-full border px-2.5 py-0.5", {
    variants: {
        variant: {
            default: "border-transparent bg-accent",
            secondary: "border-transparent bg-secondary",
            destructive: "border-transparent bg-destructive",
            success: "border-transparent bg-success",
            warning: "border-transparent bg-warning",
            outline: "border-border bg-background",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const badgeTextVariants = cva("text-xs font-medium", {
    variants: {
        variant: {
            default: "text-white",
            secondary: "text-secondary-foreground",
            destructive: "text-destructive-foreground",
            success: "text-white",
            warning: "text-black",
            outline: "text-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

type BadgeContextValue = {
    variant: VariantProps<typeof badgeVariants>["variant"];
};

const BadgeContext = React.createContext<BadgeContextValue>({ variant: "default" });

type BadgeProps = ViewProps & VariantProps<typeof badgeVariants>;

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(({ className, variant, ...props }, ref) => (
    <BadgeContext.Provider value={{ variant }}>
        <View ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    </BadgeContext.Provider>
));
Badge.displayName = "Badge";

type BadgeTextProps = Omit<React.ComponentPropsWithoutRef<typeof Text>, "variant"> & VariantProps<typeof badgeTextVariants>;

const BadgeText = React.forwardRef<React.ElementRef<typeof Text>, BadgeTextProps>(
    ({ className, variant, ...props }, ref) => {
        const context = React.useContext(BadgeContext);

        return (
            <Text
                ref={ref}
                className={cn(badgeTextVariants({ variant: variant ?? context.variant }), className)}
                {...props}
            />
        );
    }
);
BadgeText.displayName = "BadgeText";

export { Badge, BadgeText, badgeTextVariants, badgeVariants };
