import type { ComponentType } from "react";
import { Activity, Bike, BicepsFlexed, Bone, Footprints, PersonStanding, ScanHeart, Target } from "lucide-react-native";
import type { ColorTheme } from "@/constants/colors";

export const STRENGTH_CATEGORIES = [
    "胸部训练",
    "肩部训练",
    "背部训练",
    "腿部训练",
    "手臂训练",
    "核心训练",
    "全身训练",
] as const;

export const CARDIO_EXERCISES = ["跑步机", "椭圆机", "爬楼机"] as const;

type ExerciseIcon = ComponentType<{
    size?: string | number;
    color?: string;
    strokeWidth?: number;
}>;

type ExerciseVisual = {
    icon: ExerciseIcon;
    accent: string;
    iconBg: string;
    chipBg: string;
    chipBorder: string;
    chipText: string;
    cardBg?: string;
    cardBorder?: string;
    label: string;
};

export function getStrengthCategoryVisual(tag: string | null | undefined, colors: ColorTheme): ExerciseVisual {
    switch (tag) {
        case "胸部训练":
            return {
                icon: ScanHeart,
                accent: colors.blue,
                iconBg: `${colors.blue}0A`,
                chipBg: `${colors.blue}08`,
                chipBorder: "transparent",
                chipText: colors.blue,
                cardBg: `${colors.blue}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "肩部训练":
            return {
                icon: Bone,
                accent: colors.orange,
                iconBg: `${colors.orange}0A`,
                chipBg: `${colors.orange}08`,
                chipBorder: "transparent",
                chipText: colors.orange,
                cardBg: `${colors.orange}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "背部训练":
            return {
                icon: PersonStanding,
                accent: colors.green,
                iconBg: `${colors.green}0A`,
                chipBg: `${colors.green}08`,
                chipBorder: "transparent",
                chipText: colors.green,
                cardBg: `${colors.green}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "腿部训练":
            return {
                icon: Footprints,
                accent: colors.orange,
                iconBg: `${colors.orange}0A`,
                chipBg: `${colors.orange}08`,
                chipBorder: "transparent",
                chipText: colors.orange,
                cardBg: `${colors.orange}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "手臂训练":
            return {
                icon: BicepsFlexed,
                accent: colors.green,
                iconBg: `${colors.green}0A`,
                chipBg: `${colors.green}08`,
                chipBorder: "transparent",
                chipText: colors.green,
                cardBg: `${colors.green}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "核心训练":
            return {
                icon: Target,
                accent: colors.red,
                iconBg: `${colors.red}0A`,
                chipBg: `${colors.red}08`,
                chipBorder: "transparent",
                chipText: colors.red,
                cardBg: `${colors.red}06`,
                cardBorder: "transparent",
                label: tag,
            };
        case "全身训练":
            return {
                icon: Activity,
                accent: colors.blue,
                iconBg: `${colors.blue}0A`,
                chipBg: `${colors.blue}08`,
                chipBorder: "transparent",
                chipText: colors.blue,
                cardBg: `${colors.blue}06`,
                cardBorder: "transparent",
                label: tag,
            };
        default:
            return {
                icon: Activity,
                accent: colors.blue,
                iconBg: `${colors.blue}08`,
                chipBg: `${colors.blue}06`,
                chipBorder: "transparent",
                chipText: colors.blue,
                cardBg: `${colors.blue}04`,
                cardBorder: "transparent",
                label: "力量训练",
            };
    }
}

export function getCardioExerciseVisual(name: string, colors: ColorTheme): ExerciseVisual {
    switch (name) {
        case "跑步机":
            return {
                icon: Footprints,
                accent: colors.orange,
                iconBg: `${colors.orange}0A`,
                chipBg: `${colors.orange}08`,
                chipBorder: "transparent",
                chipText: colors.orange,
                cardBg: `${colors.orange}06`,
                cardBorder: "transparent",
                label: "有氧训练",
            };
        case "椭圆机":
            return {
                icon: Activity,
                accent: colors.red,
                iconBg: `${colors.red}0A`,
                chipBg: `${colors.red}08`,
                chipBorder: "transparent",
                chipText: colors.red,
                cardBg: `${colors.red}06`,
                cardBorder: "transparent",
                label: "心肺训练",
            };
        case "爬楼机":
            return {
                icon: Target,
                accent: colors.orange,
                iconBg: `${colors.orange}0A`,
                chipBg: `${colors.orange}08`,
                chipBorder: "transparent",
                chipText: colors.orange,
                cardBg: `${colors.orange}06`,
                cardBorder: "transparent",
                label: "高强度有氧",
            };
        default:
            return {
                icon: Bike,
                accent: colors.orange,
                iconBg: `${colors.orange}0A`,
                chipBg: `${colors.orange}08`,
                chipBorder: "transparent",
                chipText: colors.orange,
                cardBg: `${colors.orange}06`,
                cardBorder: "transparent",
                label: "有氧训练",
            };
    }
}
