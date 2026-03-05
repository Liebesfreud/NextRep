import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { ELEGANT_SPRING } from '@/constants/animations';
import { useIsFocused } from '@react-navigation/native';

interface AnimatedEnterProps {
    children: React.ReactNode;
    delay?: number;
    style?: StyleProp<ViewStyle>;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
}

export const AnimatedEnter: React.FC<AnimatedEnterProps> = ({
    children,
    delay = 0,
    style,
    direction = 'up',
    distance = 15, // 极简：位移距离不要超过 15px
}) => {
    // 监听当前页面是否处于活动态
    const isFocused = useIsFocused();

    const getInitialTranslate = () => {
        switch (direction) {
            case 'up': return { translateY: distance };
            case 'down': return { translateY: -distance };
            case 'left': return { translateX: distance };
            case 'right': return { translateX: -distance };
            case 'none': return {};
        }
    };

    const initial = {
        opacity: 0,
        ...getInitialTranslate(),
    };

    const animate = {
        opacity: 1,
        translateY: 0,
        translateX: 0,
    };

    return (
        <MotiView
            from={initial}
            // 当从别的标签页切回来时通过重新改变 animate 值触发进场入场，切走时恢复至 initial（退场）
            animate={isFocused ? animate : initial}
            transition={{
                ...ELEGANT_SPRING,
                // 为了让入场有阶梯感同时退场迅速干脆：只在处于焦点获得时给延时，否则迅速退回 initial
                delay: isFocused ? delay : 0,
            }}
            style={style}
        >
            {children}
        </MotiView>
    );
};
