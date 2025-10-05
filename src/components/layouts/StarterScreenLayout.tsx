// ============================================================================
// IMPORTS
// ============================================================================
import BackScreen from "@components/molecules/Back";
import { StepProgress } from "@components/ui/StepProgress";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface StarterScreenLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StarterScreenLayout({
  children,
  currentStep,
  totalSteps = 3,
  onBack,
}: StarterScreenLayoutProps) {
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <LinearGradient
      colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header Section - Back button and progress indicator */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            {/* Back Button */}
            <View style={{ width: 40 }}>
              {onBack && <BackScreen noWrapper onPress={onBack} />}
            </View>

            {/* Step Progress Indicator */}
            {currentStep && (
              <View
                style={{ flex: 1, alignItems: "center", paddingVertical: 30 }}
              >
                <StepProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  activeColor="#ffffff"
                  completedColor="#e5e7eb"
                  inactiveColor="#9ca3af"
                />
              </View>
            )}

            {/* Spacer for balance */}
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Main Content */}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
