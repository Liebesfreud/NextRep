import * as React from "react";
import * as SwitchPrimitive from "@rn-primitives/switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<SwitchPrimitive.RootRef, SwitchPrimitive.RootProps>(
    ({ className, checked, disabled, ...props }, ref) => (
        <SwitchPrimitive.Root
            ref={ref}
            checked={checked}
            disabled={disabled}
            className={cn(
                "h-8 w-14 rounded-full border border-border p-1",
                checked ? "bg-primary" : "bg-muted",
                disabled && "opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    "h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-6" : "translate-x-0"
                )}
            />
        </SwitchPrimitive.Root>
    )
);
Switch.displayName = "Switch";

export { Switch };
