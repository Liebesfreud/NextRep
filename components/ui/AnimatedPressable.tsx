import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { MICRO_INTERACTION_SPRING } from '@/constants/animations';
import { cssInterop } from 'nativewind';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export interface AnimatedPressableProps extends PressableProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    activeScale?: number;
    activeOpacity?: number;
}

const AnimatedPressableComponent = React.forwardRef<any, AnimatedPressableProps>(
    (
        {
            children,
            style,
            activeScale = 0.985,
            activeOpacity = 0.92,
            disabled,
            onPressIn,
            onPressOut,
            ...props
        },
        ref
    ) => {
        const scale = useSharedValue(1);
        const opacity = useSharedValue(1);

        const handlePressIn = useCallback((e: any) => {
            if (disabled) {
                onPressIn?.(e);
                return;
            }
            scale.value = withSpring(activeScale, MICRO_INTERACTION_SPRING);
            opacity.value = withSpring(activeOpacity, MICRO_INTERACTION_SPRING);
            onPressIn?.(e);
        }, [activeOpacity, activeScale, disabled, onPressIn, opacity, scale]);

        const handlePressOut = useCallback((e: any) => {
            if (disabled) {
                onPressOut?.(e);
                return;
            }
            scale.value = withSpring(1, MICRO_INTERACTION_SPRING);
            opacity.value = withSpring(1, MICRO_INTERACTION_SPRING);
            onPressOut?.(e);
        }, [disabled, onPressOut, opacity, scale]);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        }));

        return (
            <AnimatedPressableBase
                ref={ref}
                disabled={disabled}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[style, animatedStyle]}
                {...props}
            >
                {children}
            </AnimatedPressableBase>
        );
    }
);

AnimatedPressableComponent.displayName = 'AnimatedPressable';

// 让 NativeWind v4 知道此类可接受 className，编译时转换为 style 并注入
cssInterop(AnimatedPressableComponent, {
    className: 'style',
});

export const AnimatedPressable = AnimatedPressableComponent;
