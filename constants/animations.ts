import { MotiProps } from 'moti';

// 核心设计原则："优雅且克制"
// 高阻尼（Damping）、低刚度（Stiffness），不使用 ease-in-out，全面拥抱物理模型
export const ELEGANT_SPRING: MotiProps['transition'] = {
    type: 'spring',
    damping: 20,    // 高阻尼，干脆不回弹
    stiffness: 90,  // 低刚度，响应轻柔
    mass: 1,
    overshootClamping: true, // 防止回弹过度
};

// 微交互：用于点击按钮等需要极快响应的场景
export const MICRO_INTERACTION_SPRING = {
    damping: 18,
    stiffness: 150,
    mass: 0.5,
    overshootClamping: true,
};
