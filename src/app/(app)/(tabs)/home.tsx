import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import AnimatedPokemonOverlay from "@components/ui/AnimatedPokemonOverlay";
import HomeTourGuide, { TourStep } from "@components/ui/HomeTourGuide";
import WelcomeModal from "@components/ui/WelcomeModal";
import { useUserStore } from "@stores/user/user.config";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import starters from "../../../../mock-data/starters.json";
import { Starter } from "../../../types/starter.types";

// Constants for Pokemon display
const POKEMON_CONSTANTS = {
  DEFAULT_IMAGE_SIZE: 120,
  PARTNER_POKEMON_IMAGE:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/16.gif", // Pidgey
} as const;

/**
 * HomeScreen Component
 *
 * Main home screen displaying user progress, partner Pokemon, and learning content.
 * Features tour guide functionality and welcome modal for new users.
 *
 * @returns JSX.Element
 */
export default function HomeScreen() {
  // Tour and modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const homeLayoutRef = useRef<HomeLayoutRef>(null);

  // Global state from user store
  const { isFirstTimeLogin, setIsFirstTimeLogin, starterId, email } =
    useUserStore();

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
   * Extract username from email (part before @)
   * Falls back to "Trainer" if email is invalid
   */
  const username = email.split("@")[0] || "Trainer";

  /**
   * Handle tour completion - called when user finishes the tour guide
   */
  const handleTourComplete = () => {
    setIsFirstTimeLogin(false);
    setShouldStartTour(false);
  };

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
   * Handle welcome modal close - starts tour guide after modal is dismissed
   */
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    if (isFirstTimeLogin === true) {
      setShouldStartTour(true);
    }
  };

  /**
   * Handle start lesson button press
   * TODO: Implement navigation to lesson screen
   */
  const handleStartLesson = () => {
    // Navigate to lesson screen
  };

  /**
   * Test function to simulate first-time login (for development/testing)
   * Allows developers to trigger welcome flow manually
   */
  const handleTestTour = () => {
    setIsFirstTimeLogin(true);
  };

  return (
    <HomeTourGuide
      onTourComplete={handleTourComplete}
      shouldStartTour={shouldStartTour}
      scrollTo={(y: number) => homeLayoutRef.current?.scrollTo(y)}
    >
      <HomeLayout ref={homeLayoutRef}>
        {/* Main content container for home screen */}
        <View style={styles.customContent}>
          {/* Welcome message with username */}
          <ThemedText type="subtitle" style={styles.welcomeTitle}>
            Welcome back, {username}! 👋
          </ThemedText>

          {/* Subtitle encouraging continued learning */}
          <ThemedText style={styles.welcomeSubtitle}>
            Ready to continue your Japanese learning journey?
          </ThemedText>

          {/* Partner Pokemon Display with Tour Guide */}
          <View style={styles.pokemonContainer}>
            <TourStep
              stepIndex={1}
              title="Your Partner Pokémon"
              description="Take care of your partner Pokémon and evolve together!"
            >
              <AnimatedPokemonOverlay
                style={styles.pokemonOverlay}
                visible={true}
                imageUri={POKEMON_CONSTANTS.PARTNER_POKEMON_IMAGE}
                imageSize={POKEMON_CONSTANTS.DEFAULT_IMAGE_SIZE}
                showBackground={true}
              />
            </TourStep>
          </View>
          {/* Development/Testing: Button to trigger tour guide manually */}
          <TouchableOpacity style={styles.testButton} onPress={handleTestTour}>
            <ThemedText style={styles.testButtonText}>
              🧪 Test Tour Guide
            </ThemedText>
          </TouchableOpacity>
          {/* Quick Start Section - Main action card */}
          <ThemedView style={styles.quickStartCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              🚀 Quick Start
            </ThemedText>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartLesson}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.primaryButtonText}>
                Start New Lesson
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Learning Path Section */}
          <ThemedView style={styles.learningPathCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              📚 Your Learning Path
            </ThemedText>

            <View style={styles.pathItem}>
              <ThemedText style={styles.pathItemTitle}>
                Current Level: N5
              </ThemedText>
              <ThemedText style={styles.pathItemSubtitle}>
                Basic Japanese - Hiragana & Katakana
              </ThemedText>
            </View>

            <View style={styles.pathItem}>
              <ThemedText style={styles.pathItemTitle}>
                Next Goal: N4
              </ThemedText>
              <ThemedText style={styles.pathItemSubtitle}>
                Intermediate Japanese - Kanji & Grammar
              </ThemedText>
            </View>
          </ThemedView>

          <MainNavigation />
        </View>
      </HomeLayout>

      {/* Welcome Modal */}
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        username={username}
        pokemonName={selectedStarter.name}
      />
    </HomeTourGuide>
  );
}

/**
 * Styles for HomeScreen component
 *
 * Organized by component sections for better maintainability:
 * - Layout and content styles
 * - Welcome section styles
 * - Card and button styles
 * - Pokemon display styles
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
  pokemonCard: {
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
  /**
   * Container for Pokemon display section
   * Centers the Pokemon and ensures it doesn't expand beyond content
   */
  pokemonContainer: {
    alignItems: "center",
    marginTop: 12,
    // Ensure container only takes the size of its content
    alignSelf: "center",
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  pokemonType: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  /**
   * Style for Pokemon overlay in tour guide context
   * Uses relative positioning to work within the tour step wrapper
   * Allows PokemonDisplay to show with full background and padding
   */
  pokemonOverlay: {
    // Override absolute positioning for tour guide compatibility
    position: "relative",
    top: 0,
    left: 0,
    marginTop: 0,
    marginLeft: 0,
    // Let PokemonDisplay determine its own size with background and padding
    alignItems: "center",
    justifyContent: "center",
  },
});
