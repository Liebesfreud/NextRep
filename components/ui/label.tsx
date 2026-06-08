import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<React.ElementRef<typeof RNText>, RNTextProps>(
    ({ className, ...props }, ref) => (
        <RNText
            ref={ref}
            className={cn("text-sm font-bold text-foreground", className)}
            {...props}
        />
    )
);
Label.displayName = "Label";

export { Label };
