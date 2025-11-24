import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import {
  BookMarked,
  BookOpen,
  Headphones,
  Mic2,
  Sword,
  User,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { CopilotStep, walkthroughable } from "react-native-copilot";

const { width } = Dimensions.get("window");

interface NavigationButtonProps {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress: () => void;
  color?: string;
  // Optional tour props
  tourStepName?: string;
  tourOrder?: number;
  tourText?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  title,
  icon: Icon,
  onPress,
  color = "#3b82f6",
  tourStepName,
  tourOrder,
  tourText,
}) => {
  const WTTouchable = walkthroughable(TouchableOpacity);

  const ButtonContent = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon size={24} color="#ffffff" strokeWidth={2.5} />
      </View>
      <ThemedText style={styles.buttonText}>{title}</ThemedText>
    </>
  );

  if (tourStepName && tourOrder && tourText) {
    return (
      <CopilotStep text={tourText} order={tourOrder} name={tourStepName}>
        <WTTouchable
          style={[styles.navButton, { borderColor: color }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {ButtonContent}
        </WTTouchable>
      </CopilotStep>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.navButton, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {ButtonContent}
    </TouchableOpacity>
  );
};

const MainNavigation: React.FC = () => {
  const { t } = useTranslation();

  const handleLearn = () => {
    router.push(ROUTES.TABS.LEARN);
  };

  const handleReading = () => {
    router.push(ROUTES.TABS.READING);
  };

  const handleListening = () => {
    router.push(ROUTES.TABS.LISTENING);
  };

  const handleBattle = () => {
    router.push(ROUTES.TABS.BATTLE);
  };

  const handleUserInfo = () => {
    router.push(ROUTES.ME.PROFILE);
  };

  const handleSpeaking = () => {
    router.push(ROUTES.TABS.SPEAKING);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        🎯 {t("navigation.title")}
      </ThemedText>

      <View style={styles.grid}>
        <NavigationButton
          title={t("navigation.learn")}
          icon={BookOpen}
          onPress={handleLearn}
          color="#10b981"
          tourStepName="navigation"
          tourOrder={6}
          tourText={t("tour.navigation_description")}
        />

        <NavigationButton
          title={t("navigation.reading")}
          icon={BookMarked}
          onPress={handleReading}
          color="#f59e0b"
        />
        <NavigationButton
          title={t("navigation.listening")}
          icon={Headphones}
          onPress={handleListening}
          color="#8b5cf6"
        />
        <NavigationButton
          title={t("navigation.battle")}
          icon={Sword}
          onPress={handleBattle}
          color="#ef4444"
        />
        <NavigationButton
          title={t("navigation.user_info")}
          icon={User}
          onPress={handleUserInfo}
          color="#06b6d4"
        />
        <NavigationButton
          title={t("navigation.speaking")}
          icon={Mic2}
          onPress={handleSpeaking}
          color="#fb7185"
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
