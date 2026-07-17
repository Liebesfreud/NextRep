import { View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Mask,
    Pattern,
    RadialGradient,
    Rect,
    Stop,
} from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

const DOT_SPACING = 16;
const DOT_RADIUS = 1.25;

export function DottedBackground() {
    const { colors, theme } = useTheme();

    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="pointer-events-none absolute inset-0"
        >
            <Svg width="100%" height="100%">
                <Defs>
                    <Pattern
                        id="dot-pattern"
                        width={DOT_SPACING}
                        height={DOT_SPACING}
                        patternUnits="userSpaceOnUse"
                    >
                        <Circle
                            cx={DOT_RADIUS}
                            cy={DOT_RADIUS}
                            r={DOT_RADIUS}
                            fill={theme === "dark" ? colors.textTertiary : colors.textSecondary}
                        />
                    </Pattern>
                    <RadialGradient id="dot-fade" cx="50%" cy="42%" rx="72%" ry="68%">
                        <Stop offset="0%" stopColor="white" stopOpacity={theme === "dark" ? 0.58 : 0.5} />
                        <Stop offset="58%" stopColor="white" stopOpacity={theme === "dark" ? 0.32 : 0.3} />
                        <Stop offset="100%" stopColor="black" stopOpacity={0} />
                    </RadialGradient>
                    <Mask id="dot-mask">
                        <Rect width="100%" height="100%" fill="url(#dot-fade)" />
                    </Mask>
                </Defs>
                <Rect
                    width="100%"
                    height="100%"
                    fill="url(#dot-pattern)"
                    mask="url(#dot-mask)"
                />
            </Svg>
        </View>
    );
}
