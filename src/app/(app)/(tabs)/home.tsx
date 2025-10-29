import { DailyLoginModal } from "@components/DailyLoginModal";
import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import WelcomeModal from "@components/ui/WelcomeModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalStore } from "@stores/global/global.config";
import { useUserStore } from "@stores/user/user.config";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import starters from "../../../../mock-data/starters.json";
import { Starter } from "../../../types/starter.types";

import { Button } from "@components/ui/Button";
import { useCopilot } from "react-native-copilot";

/**
 * HomeScreen Component
 *
 * Main home screen displaying user progress, partner Pokemon, and learning content.
 *
 * @returns JSX.Element
 */
export default function HomeScreen() {
  const { t } = useTranslation();

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const homeLayoutRef = useRef<HomeLayoutRef>(null);

  // Global state from user store
  const { isFirstTimeLogin, starterId, email } = useUserStore();

  // Global state for overlay position
  const { resetOverlayPosition } = useGlobalStore();

  /**
   * Get user's selected starter Pokemon
   * Falls back to first starter if none selected
   */
  const selectedStarter = React.useMemo(() => {
    return (
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0]
    );
  }, [starterId]);


  /**
   * Show welcome modal for first-time users
   * Triggers when isFirstTimeLogin is true
   */
  useEffect(() => {
    if (isFirstTimeLogin === true) {
      setShowWelcomeModal(true);
    }
  }, [isFirstTimeLogin]);

  /**
   * Handle welcome modal close
   */
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
  };

  /**
   * Handle start lesson button press
   * TODO: Implement navigation to lesson screen
   */
  const handleStartLesson = () => {
    // Navigate to lesson screen
  };

  /**
   * Handle daily check-in action
   * Updates user's streak and rewards
   */
  const handleDailyCheckin = () => {
    console.log("User checked in daily!");
    // TODO: Implement actual check-in logic
    // - Update user streak in backend
    // - Add coins to user account
    // - Update daily login status
  };


  /**
   * Test function to show daily login modal (for development/testing)
   */
  const handleTestDailyLogin = () => {
    setShowDailyLogin(true);
  };

  /**
   * Clear AsyncStorage for DraggableOverlay position
   * Resets the overlay position to default center position
   */
  const handleClearAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem("@DraggableOverlay:position");
      // Reset global store position to default
      resetOverlayPosition();
      console.log(
        "✅ Cleared DraggableOverlay position from AsyncStorage and global store"
      );
      // Optional: Show a success message or toast
    } catch (error) {
      console.error("❌ Error clearing AsyncStorage:", error);
    }
  };
  const { start, copilotEvents } = useCopilot();


  // Handle tour step changes for auto-scroll
  React.useEffect(() => {
    const handleStepChange = (step: any) => {
      if (step.name === "navigation" && homeLayoutRef.current) {
        // Scroll to bottom to show the Learn button
        setTimeout(() => {
          homeLayoutRef.current?.scrollTo(1000); // Scroll down to show navigation
        }, 500); // Small delay to ensure the step is rendered
      }
    };

    copilotEvents.on("stepChange", handleStepChange);

    return () => {
      copilotEvents.off("stepChange", handleStepChange);
    };
  }, [copilotEvents]);
  return (
    <HomeLayout ref={homeLayoutRef}>
      {/* Main content container for home screen */}
      <View style={styles.customContent}>
        {/* Welcome message with username */}
        <ThemedText type="subtitle" style={styles.welcomeTitle}>
          {t("home.welcome_back", {
            username: email.split("@")[0] || "Trainer",
          })}
        </ThemedText>
        {/* Subtitle encouraging continued learning */}
        <ThemedText style={styles.welcomeSubtitle}>
          {t("home.ready_to_continue")}
        </ThemedText>

        {/* Development/Testing */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleClearAsyncStorage}
        >
          <ThemedText style={styles.testButtonText}>
            {t("home.clear_overlay_position")}
          </ThemedText>
        </TouchableOpacity>
        <Button onPress={() => start()}>
          <ThemedText style={styles.testButtonText}>
            {t("home.test_tour_guide")}
          </ThemedText>
        </Button>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestDailyLogin}
        >
          <ThemedText style={styles.testButtonText}>
            {t("home.test_daily_login_modal")}
          </ThemedText>
        </TouchableOpacity>

        {/* Quick Start Section - Main action card */}
        <ThemedView style={styles.quickStartCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {t("home.quick_start")}
          </ThemedText>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartLesson}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryButtonText}>
              {t("home.start_new_lesson")}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Learning Path Section */}
        <ThemedView style={styles.learningPathCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {t("home.learning_path")}
          </ThemedText>

          <View style={styles.pathItem}>
            <ThemedText style={styles.pathItemTitle}>
              {t("home.current_level", { level: "N5" })}
            </ThemedText>
            <ThemedText style={styles.pathItemSubtitle}>
              {t("home.basic_japanese")}
            </ThemedText>
          </View>

          <View style={styles.pathItem}>
            <ThemedText style={styles.pathItemTitle}>
              {t("home.next_goal", { level: "N4" })}
            </ThemedText>
            <ThemedText style={styles.pathItemSubtitle}>
              {t("home.intermediate_japanese")}
            </ThemedText>
          </View>
        </ThemedView>

      
          <MainNavigation />
 
      </View>

      {/* Welcome Modal */}
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        username={email.split("@")[0] || "Trainer"}
        pokemonName={selectedStarter.name}
      />

      {/* Daily Login Modal */}
      <DailyLoginModal
        visible={showDailyLogin}
        onClose={() => setShowDailyLogin(false)}
        onCheckIn={handleDailyCheckin}
      />
      </HomeLayout>
  );
}

/**
 * Styles for HomeScreen component
 *
 * Organized by component sections for better maintainability:
 * - Layout and content styles
 * - Welcome section styles
 * - Card and button styles
 * - Activity and text styles
 */
const styles = StyleSheet.create({
  // Layout and content styles
  customContent: {
    gap: 20,
  },

  // Welcome section styles
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  quickStartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  learningPathCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  recentActivityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  pathItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pathItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  pathItemSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 12,
  },
  testButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Fake overlay styles (kept if needed elsewhere)
  fakeOverlay: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "transparent",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    overflow: "hidden",
  },
  fakeOverlayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  fakeOverlayText: {
    color: "transparent",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  fakeOverlaySubtext: {
    color: "transparent",
    fontSize: 12,
    textAlign: "center",
  },
});
