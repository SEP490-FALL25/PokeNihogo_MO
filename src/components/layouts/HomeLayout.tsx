import UserProfileHeaderAtomic from "@components/Organism/UserProfileHeader";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TourStep } from "../ui/HomeTourGuide";

// Placeholder component để tour có thể track được vị trí

const sampleUser = {
  name: "Skibido ",
  level: 15,
  currentExp: 2450,
  expToNextLevel: 3000,
  avatar:
    "data:image/jpeg;base64,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",
};

interface HomeLayoutProps {
  children?: React.ReactNode;
  user?: {
    name: string;
    level: number;
    currentExp: number;
    expToNextLevel: number;
    avatar?: string;
  };
  refreshControl?: React.ReactElement<any>;
}

export interface HomeLayoutRef {
  scrollTo: (y: number) => void;
}

const HomeLayout = forwardRef<HomeLayoutRef, HomeLayoutProps>(
  function HomeLayout({ children, refreshControl }, ref) {
    const scrollViewRef = useRef<ScrollView>(null);
    const currentUser = sampleUser;

    // Note: Main pokemon logic moved to tab layout level to prevent re-mounting

    useImperativeHandle(ref, () => ({
      scrollTo: (y: number) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y,
            animated: true,
          });
        }
      },
    }));

    return (
      <LinearGradient
        colors={["#dbeafe", "#ffffff", "#e0e7ff"]} // bg-gradient-to-br from-blue-50 via-white to-indigo-100
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            {/* User Profile Header */}
            <View style={styles.profileSection}>
              <TourStep
                stepIndex={0}
                title="Your Progress"
                description="Here's your progress. Complete the lessons to level up!"
              >
                <UserProfileHeaderAtomic user={currentUser} />
              </TourStep>
            </View>

            {/* Main Content Area */}
            <View style={styles.contentSection}>{children}</View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
);

export default HomeLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  quickStatsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentActivityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  activityText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  draggableContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none", // Allow touch events to pass through to DraggableOverlay
    zIndex: 1000,
  },
  testPokemonContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1002,
  },
  pokemonTourPlaceholder: {
    position: "absolute",
    top: "50%", // Vị trí giữa màn hình
    left: "50%",
    marginTop: -75, // Để căn giữa (150px / 2)
    marginLeft: -75, // Để căn giữa (150px / 2)
    width: 150,
    height: 150,
    backgroundColor: "transparent", // Trong suốt
    zIndex: 998, // Thấp hơn DraggableOverlay
    pointerEvents: "none", // Không chặn touch events
  },
});
