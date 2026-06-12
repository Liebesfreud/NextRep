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
        <Card className={cn("items-center justify-center gap-4 border-dashed bg-card px-6", compact ? "py-6" : "py-8", className)} {...props}>
            <View className="h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                {icon ?? <Sparkles size={22} color={colors.green} />}
            </View>
            <Text variant={compact ? "label" : "subheading"} className="text-center">
                {title}
            </Text>
            {description ? (
                <Text variant="muted" className="max-w-[280px] text-center">
                    {description}
                </Text>
            ) : null}
            {actionLabel && onAction ? (
                <Button onPress={onAction} variant="secondary" size="sm">
                    <ButtonText variant="secondary" size="sm">
                        {actionLabel}
                    </ButtonText>
                </Button>
            ) : null}
        </Card>
    );
});

export { EmptyState, type EmptyStateProps };
