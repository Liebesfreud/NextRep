import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type LightEffectProps = {
    /** 
     * The color of the light.
     */
    color: string;
    /** 
     * Base opacity of the center of the light. 
     * Should be strictly between 0.03 and 0.1 for subtle effect. 
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
    opacity = 0.05, // Default to a very subtle 5% opacity
    size = 200,     // Default large spread
    position,
    style,
}: LightEffectProps) {
    // Clamp opacity to ensure it is very subtle, max 0.15 just in case but usually stay <= 0.1
    const clampedOpacity = Math.max(0.01, Math.min(opacity, 0.15));

    // Unique ID for the gradient definition to prevent collision
    const gradientId = `light-grad-${Math.random().toString(36).substring(2, 9)}`;

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
                {/* 
                    Radial gradient to simulate a soft light source. 
                    Uses a very smooth falloff from center to edge.
                */}
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
                    <Stop offset="30%" stopColor={color} stopOpacity={clampedOpacity * 0.7} />
                    <Stop offset="60%" stopColor={color} stopOpacity={clampedOpacity * 0.3} />
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
