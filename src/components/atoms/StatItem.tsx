import { Text, View } from "react-native";

export const StatItem = ({ icon: Icon, value, label, color }: { icon: any, value: any, label: any, color: any }) => (
    <View className="items-center gap-1">
      <Icon size={28} color={color} />
      <Text className="text-xl font-bold text-slate-800">{value}</Text>
      <Text className="text-sm text-slate-500">{label}</Text>
    </View>
  );