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
                "web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 h-6 w-11 rounded-full border-2 border-transparent px-0.5 shadow-sm disabled:opacity-50",
                checked ? "bg-primary" : "bg-input",
                disabled && "opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    "pointer-events-none h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </SwitchPrimitive.Root>
    )
);
Switch.displayName = "Switch";

export { Switch };
