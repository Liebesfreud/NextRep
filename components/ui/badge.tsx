import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

const badgeVariants = cva("self-start rounded-full border px-3 py-1", {
    variants: {
        variant: {
            default: "border-primary/20 bg-primary/15",
            secondary: "border-border bg-secondary",
            destructive: "border-destructive/20 bg-destructive/15",
            outline: "border-border bg-transparent",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const badgeTextVariants = cva("text-xs font-black", {
    variants: {
        variant: {
            default: "text-primary",
            secondary: "text-secondary-foreground",
            destructive: "text-destructive",
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
