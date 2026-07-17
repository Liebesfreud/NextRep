import type { WithSpringConfig } from 'react-native-reanimated';

// DESIGN.md v3 — "Snappy athletic" motion personality
// 高刚度 (stiffness)、中等阻尼 (damping)，物理驱动，不用 ease-in-out

// §11.1 Spring Presets

/** Snappy athletic — default for buttons, toggles, cards */
export const SNAPPY_SPRING: WithSpringConfig = {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
};

/** Gentle — for layout changes, filtering, chart animations */
export const GENTLE_SPRING: WithSpringConfig = {
    damping: 25,
    stiffness: 150,
    mass: 1.0,
};

/** Bouncy — celebrations, PRs, confetti only */
export const BOUNCY_SPRING: WithSpringConfig = {
    damping: 12,
    stiffness: 200,
    mass: 0.6,
};

// §11.2 Duration Scale
export const DURATION = {
    micro: 150,       // button press, toggle flip
    standard: 250,    // card expand, value change
    emphasis: 400,    // screen entry, stat reveal
    celebration: 800, // PR banner, workout complete
    skeleton: 1500,   // shimmer cycle
} as const;

// §11.3 Stagger Patterns
export const STAGGER = {
    fast: 50,         // card list entry
    dramatic: 100,    // hero + stat reveal
    list: 30,         // long scrollable lists
    chart: 30,        // bar chart entrance
} as const;
