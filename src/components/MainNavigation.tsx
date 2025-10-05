import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { TourStep } from "./ui/HomeTourGuide";

const { width } = Dimensions.get("window");

interface NavigationButtonProps {
  title: string;
  icon: any;
  onPress: () => void;
  color?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  title,
  icon,
  onPress,
  color = "#3b82f6",
}) => {
  return (
    <TouchableOpacity
      style={[styles.navButton, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconSymbol name={icon} size={24} color="#ffffff" />
      </View>
      <ThemedText style={styles.buttonText}>{title}</ThemedText>
    </TouchableOpacity>
  );
};

const MainNavigation: React.FC = () => {
  const handleLearn = () => {
    // Navigate to learning screen
    console.log("Learn pressed");
    router.push(ROUTES.TABS.LEARN);
  };

  const handleReading = () => {
    // Navigate to reading screen
    console.log("Reading pressed");
    router.push(ROUTES.TABS.READING);
  };

  const handleListening = () => {
    // Navigate to listening screen
    console.log("Listening pressed");
    router.push(ROUTES.TABS.LISTENING);
  };

  const handleBattle = () => {
    // Navigate to battle screen
    console.log("Battle pressed");
    router.push(ROUTES.TABS.BATTLE);
  };

  const handleUserInfo = () => {
    // Navigate to user info screen
    console.log("User Info pressed");
    router.push(ROUTES.AUTH.USER_PROFILE);
  };

  const handleOther = () => {
    // Navigate to other features screen
    console.log("Other pressed");
    // TODO: Create other features screen
    // router.push(ROUTES.MAIN_NAVIGATION.OTHER);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        🎯 Main Navigation
      </ThemedText>

      <View style={styles.grid}>
        {/* Main Navigation Section */}
        <TourStep
          stepIndex={2}
          title="Start Learning"
          description="Start your journey here!"
        >
          <NavigationButton
            title="Learn"
            icon="book.fill"
            onPress={handleLearn}
            color="#10b981"
          />
        </TourStep>

        <NavigationButton
          title="Reading"
          icon="book.fill"
          onPress={handleReading}
          color="#f59e0b"
        />
        <NavigationButton
          title="Listening"
          icon="speaker.wave.2.fill"
          onPress={handleListening}
          color="#8b5cf6"
        />
        <NavigationButton
          title="Battle"
          icon="gamecontroller.fill"
          onPress={handleBattle}
          color="#ef4444"
        />
        <NavigationButton
          title="User Info"
          icon="person.fill"
          onPress={handleUserInfo}
          color="#06b6d4"
        />
        <NavigationButton
          title="Other"
          icon="ellipsis.circle"
          onPress={handleOther}
          color="#6b7280"
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  navButton: {
    width: (width - 80) / 3 - 8, // 3 buttons per row with padding and gaps
    aspectRatio: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
});

export default MainNavigation;
