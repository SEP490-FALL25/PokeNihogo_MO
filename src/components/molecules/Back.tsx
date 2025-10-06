import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type BackScreenProps = {
  color?: string;
  onPress?: () => void;
  noWrapper?: boolean;
  title?: string;
  children?: React.ReactNode;
};

const BackScreen: React.FC<BackScreenProps> = ({
  color = "white",
  onPress,
  noWrapper,
  title,
  children,
}) => {
  const Button = (
    <View className="flex-row w-full items-center py-3">
      <View className="w-12 items-start">
        <TouchableOpacity
          accessibilityLabel="Go back"
          className="p-2"
          onPress={onPress ?? (() => router.back())}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={color} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-xl text-center font-semibold text-white">{title}</Text>
      </View>

      <View className="w-12">
        {children}
      </View>
    </View>
  );

  if (noWrapper) return Button;

  return <View className="flex-row items-center px-5 py-3">{Button}</View>;
};

export default BackScreen;