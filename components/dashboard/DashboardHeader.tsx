import { View } from "react-native";
import { LayoutDashboard } from "lucide-react-native";
import { BrandMark } from "@/components/ui/brand-mark";

export function DashboardHeader() {
    return (
        <View className="flex-row items-center justify-between pt-2 px-1">
            <BrandMark title="数据看板" subtitle="Dashboard · NextRep" icon={LayoutDashboard} />
        </View>
    );
}
