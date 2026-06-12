import React, { useId } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type LightEffectProps = {
    /** 
     * The color of the light.
     */
    color: string;
    /** 
     * Base opacity of the center of the light. 
     * Should stay low for a restrained ambient glow.
     */
    opacity?: number;
    /** 
     * Size of the bounding rect for the light (width and height).
     */
    size?: number | string;
    /**
     * Absolute positioning for the effect wrapper.
     * Use this to place the light effect in corners (e.g., top: -50, left: -50).
     */
    position?: {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    };
    /**
     * Optional additional styles for the container.
     */
    style?: ViewStyle;
};

export function LightEffect({
    color,
    opacity = 0.035,
    size = 180,
    position,
    style,
}: LightEffectProps) {
    const clampedOpacity = Math.max(0.008, Math.min(opacity, 0.08));

    const gradientId = `light-grad-${useId().replace(/:/g, '')}`;

    return (
        <Svg
            height={size}
            width={size}
            viewBox={`0 0 ${typeof size === 'number' ? size : 100} ${typeof size === 'number' ? size : 100}`}
            style={[
                StyleSheet.absoluteFillObject, // By default fills the parent, but can be overridden by position
                { pointerEvents: 'none' },     // CRITICAL: Prevent light effect from blocking touches
                position,
                style,
            ]}
        >
            <Defs>
                <RadialGradient
                    id={gradientId}
                    cx="50%"
                    cy="50%"
                    rx="50%"
                    ry="50%"
                    fx="50%"
                    fy="50%"
                >
                    <Stop offset="0%" stopColor={color} stopOpacity={clampedOpacity} />
                    <Stop offset="24%" stopColor={color} stopOpacity={clampedOpacity * 0.5} />
                    <Stop offset="55%" stopColor={color} stopOpacity={clampedOpacity * 0.18} />
                    <Stop offset="100%" stopColor={color} stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Rect 
                x="0" 
                y="0" 
                width="100%" 
                height="100%" 
                fill={`url(#${gradientId})`} 
            />
        </Svg>
    );
}
