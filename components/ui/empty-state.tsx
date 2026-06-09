import * as React from "react";
import { View, type ViewProps } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type EmptyStateProps = ViewProps & {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    compact?: boolean;
};

const EmptyState = React.memo(function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    compact = false,
    className,
    ...props
}: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <Card className={cn("items-center justify-center border border-border bg-card/60 px-6", compact ? "py-7" : "py-10", className)} {...props}>
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                {icon ?? <Sparkles size={22} color={colors.green} />}
            </View>
            <Text variant="label" className="text-center">
                {title}
            </Text>
            {description ? (
                <Text variant="caption" className="mt-1.5 text-center font-semibold leading-5">
                    {description}
                </Text>
            ) : null}
            {actionLabel && onAction ? (
                <Button onPress={onAction} variant="secondary" size="sm" className="mt-4 bg-accent/10">
                    <ButtonText variant="secondary" size="sm" className="text-accent">
                        {actionLabel}
                    </ButtonText>
                </Button>
            ) : null}
        </Card>
    );
});

export { EmptyState, type EmptyStateProps };
