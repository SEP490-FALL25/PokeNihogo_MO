import BackScreen from "@components/mocules/Back";
import { StepProgress } from "@components/ui/StepProgress";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StarterScreenLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
}

export default function StarterScreenLayout({
  children,
  currentStep,
  totalSteps = 3,
  onBack ,
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
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            {/* Nút back */}
            <View style={{ width: 40 }}>
              {onBack && <BackScreen noWrapper onPress={onBack} />}
            </View>

            {/* StepProgress ở giữa */}
            {currentStep && (
              <View style={{ flex: 1, alignItems: "center" }}>
                <StepProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  activeColor="#ffffff"
                  completedColor="#e5e7eb"
                  inactiveColor="#9ca3af"
                />
              </View>
            )}

            {/* Spacer để cân bằng */}
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Nội dung chính */}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
