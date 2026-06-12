import React, { useMemo } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { ELEGANT_SPRING } from '@/constants/animations';
import { useIsFocused } from 'expo-router';

interface AnimatedEnterProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    style?: StyleProp<ViewStyle>;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
}

export const AnimatedEnter: React.FC<AnimatedEnterProps> = ({
    children,
    delay = 0,
    className,
    style,
    direction = 'up',
    distance = 8,
}) => {
    const isFocused = useIsFocused();

    const initial = useMemo(() => {
        const getInitialTranslate = () => {
        switch (direction) {
            case 'up': return { translateY: distance };
            case 'down': return { translateY: -distance };
            case 'left': return { translateX: distance };
            case 'right': return { translateX: -distance };
            case 'none': return {};
        }
        };

        return {
            opacity: 0,
            ...getInitialTranslate(),
        };
    }, [direction, distance]);

    const animate = useMemo(() => ({
        opacity: 1,
        translateY: 0,
        translateX: 0,
    }), []);

    const transition = useMemo(() => ({
        ...ELEGANT_SPRING,
        delay: isFocused ? delay : 0,
    }), [delay, isFocused]);

    return (
        <MotiView
            from={initial}
            animate={isFocused ? animate : initial}
            transition={transition}
            className={className}
            style={style}
        >
            {children}
        </MotiView>
    );
};
