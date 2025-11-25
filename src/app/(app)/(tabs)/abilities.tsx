import { ListeningContent } from "@components/abilities/ListeningContent";
import { ReadingContent } from "@components/abilities/ReadingContent";
import { SpeakingContent } from "@components/abilities/SpeakingContent";
import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { BookOpen, HeadphonesIcon, Mic } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

type TabType = "listening" | "reading" | "speaking";

export default function AbilitiesScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<TabType>("listening");
  const [refreshing, setRefreshing] = React.useState(false);

  // Refetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Invalidate all user-tests queries to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ["user-tests"] 
      });
    }, [queryClient])
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch all user-tests queries
      await queryClient.invalidateQueries({ 
        queryKey: ["user-tests"] 
      });
      // Wait a bit for queries to refetch
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing abilities data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const tabs = [
    {
      key: "listening" as TabType,
      label: t("tabs.subtabs.listening"),
      icon: HeadphonesIcon,
      color: "#10b981",
    },
    {
      key: "reading" as TabType,
      label: t("tabs.subtabs.reading"),
      icon: BookOpen,
      color: "#3b82f6",
    },
    {
      key: "speaking" as TabType,
      label: t("tabs.subtabs.speaking"),
      icon: Mic,
      color: "#8b5cf6",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "listening":
        return <ListeningContent />;
      case "reading":
        return <ReadingContent />;
      case "speaking":
        return <SpeakingContent />;
      default:
        return <ListeningContent />;
    }
  };

  return (
    <HomeLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedText type="title" style={styles.title}>
        🎯 {t("tabs.abilities")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t("tabs.abilities_subtitle")}
      </ThemedText>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && styles.activeTab,
                isActive && { backgroundColor: tab.color },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={isActive ? "#ffffff" : "#6b7280"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
});

