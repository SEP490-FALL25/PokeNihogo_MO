import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { TestStatus } from "@constants/test.enum";
import { useUserTests } from "@hooks/useUserTest";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import { Mic } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type UserTestItem = {
  id: number;
  limit: number;
  status: string;
  test: {
    id: number;
    name: string;
    description: string;
    price: number;
    levelN: number;
    testType: string;
    status: string;
    limit: number;
  };
};

const SpeakingCard: React.FC<{
  item: UserTestItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.speakingCard, { borderLeftColor: "#3b82f6" }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: "#3b82f6" }]}>
          <Mic size={24} color="#ffffff" />
        </View>
        <View style={styles.exerciseInfo}>
          <ThemedText type="subtitle" style={styles.exerciseTitle}>
            {item.test?.name}
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            {item.test?.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>
              N{item.test?.levelN}
            </ThemedText>
          </View>
          <ThemedText style={styles.timeText}>
            {item.limit} / {item.test?.limit}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SpeakingScreen() {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const {
    data: userTestsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useUserTests({
    type: TestStatus.SPEAKING_TEST,
    currentPage: 1,
    pageSize: 10,
  });

  const items: UserTestItem[] =
    (userTestsData as any)?.data?.data?.results ?? [];
  const refreshing = isRefetching;

  const handleRefresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  React.useEffect(() => {
    const ready = !isLoading;
    if (ready && !isLoaded) {
      setIsLoaded(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, isLoaded, fadeAnim, slideAnim]);

  const handleSpeakingPress = (materialId: number) => {
    // Navigate to conversation screen and pass topicId for API to use
    router.push({
      pathname: ROUTES.APP.CONVERSATION,
      params: { topicId: String(materialId) },
    });
  };
  
  return (
    <HomeLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedText type="title" style={styles.title}>
        🎤 {t("speaking.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>{t("speaking.subtitle")}</ThemedText>

      <Animated.View
        style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 {t("speaking.progress_title")}
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>8</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t("reading.articles_read")}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>245</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t("reading.words_learned")}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>92%</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t("reading.comprehension")}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🗣️ {t("speaking.exercises_title")}
      </ThemedText>

      <View style={styles.exercisesContainer}>
        {isLoading && (
          <ThemedText style={{ textAlign: "center" }}>Loading...</ThemedText>
        )}
        {!!error && (
          <ThemedText style={{ textAlign: "center", color: "#ef4444" }}>
            {error instanceof Error ? error.message : "Error"}
          </ThemedText>
        )}
        {!isLoading &&
          !error &&
          items.map((item) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <SpeakingCard
                item={item}
                onPress={() => handleSpeakingPress(item.test?.id)}
              />
            </Animated.View>
          ))}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  exercisesContainer: {
    gap: 16,
    marginBottom: 16,
  },
  speakingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,},
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  cardFooter: {
    gap: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,},
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
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
    textAlign: "center",
  },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,},
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,},
  controlsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
  },
  controlsHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  scrollView: {
    flex: 1,
  },
  recorderSection: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,},
  recorderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  recorderDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  recordingResult: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
    textAlign: "center",
  },
  resultDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  uploadContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
