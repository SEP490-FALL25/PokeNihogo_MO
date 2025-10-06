import { Text, View } from "react-native";

export const AchievementBadge = ({ name, icon }: { name: any, icon: any }) => (
    <View className="items-center w-24">
        <View className="w-16 h-16 bg-slate-200 rounded-full items-center justify-center mb-1">
            <Text className="text-3xl">{icon}</Text>
        </View>
        <Text className="text-xs text-center text-slate-600 font-semibold" numberOfLines={2}>{name}</Text>
    </View>
);