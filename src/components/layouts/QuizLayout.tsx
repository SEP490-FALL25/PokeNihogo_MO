import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QuizLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
  progressComponent?: React.ReactNode;
}

export default function QuizLayout({
  children,
  showProgress = false,
  progressComponent,
}: QuizLayoutProps) {
  return (
    <LinearGradient
      colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Progress Header (optional) */}
        {showProgress && progressComponent && (
          <View style={styles.progressContainer}>
            {progressComponent}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  content: {
    flex: 1,
  },
});
