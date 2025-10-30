import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { Text, View } from "react-native";

export const TypeBadge = ({ label, color }: { label: string; color: string }) => {
    const badgeColor = color || '#A8A878';

    return (
        <View className="relative">
            <TWLinearGradient
                colors={[badgeColor, `${badgeColor}DD`, `${badgeColor}BB`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-[9px] rounded-[14px] shadow-black/30 shadow-md"
            >
                <View className="relative">
                    <Text className="text-white text-[14px] font-extrabold capitalize tracking-[0.8px] drop-shadow">{label}</Text>
                    <View className="absolute top-2.5 -left-2.5 w-5 h-5 bg-white/30 rounded-full" />
                </View>
            </TWLinearGradient>
        </View>
    );
};
