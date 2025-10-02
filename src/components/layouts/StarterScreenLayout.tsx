import BackScreen from "@components/mocules/Back";
import { Progress } from "@components/ui/Progress";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StarterScreenLayoutProps {
  children: React.ReactNode;
  progress?: number;
  showBack?: boolean;
  onBack?: () => void;
}

export default function StarterScreenLayout({
  children,
  progress,
  showBack = true,
  onBack,
}: StarterScreenLayoutProps) {
  return (
    <LinearGradient
      colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header với nút back và thanh tiến trình */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {showBack && <BackScreen noWrapper onPress={onBack} />}
            {progress && (
              <View style={{ flex: 1 }}>
                <Progress value={progress} />
              </View>
            )}
          </View>
        </View>

        {/* Nội dung chính */}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
