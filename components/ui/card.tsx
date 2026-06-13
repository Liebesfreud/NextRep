import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

const Card = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn("bg-surface rounded-lg border border-border p-card-padding", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn("gap-1.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentPropsWithoutRef<typeof Text>>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn("text-subheading text-foreground", className)}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentPropsWithoutRef<typeof Text>>(
    ({ className, ...props }, ref) => (
        <Text ref={ref} className={cn("text-caption text-muted-foreground", className)} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn("gap-item-gap", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn("mt-6 flex-row items-center gap-2", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
