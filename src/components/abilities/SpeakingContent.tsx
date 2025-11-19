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
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  onLockedPress: () => void;
}> = ({ item, onPress, onLockedPress }) => {
  const isLocked = item.status === "NOT_STARTED";
  
  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { borderLeftColor: "#8b5cf6" },
        isLocked && styles.lockedCard
      ]}
      onPress={isLocked ? onLockedPress : onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: "#8b5cf6" },
          isLocked && styles.lockedIconContainer
        ]}>
          <Mic size={24} color={isLocked ? "#9ca3af" : "#ffffff"} />
        </View>
        <View style={styles.exerciseInfo}>
          <ThemedText 
            type="subtitle" 
            style={[
              styles.exerciseTitle,
              isLocked && styles.lockedText
            ]}
          >
            {item.test?.name}
          </ThemedText>
          <ThemedText style={[
            styles.exerciseDescription,
            isLocked && styles.lockedText
          ]}>
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
          {!isLocked && (
            <ThemedText style={styles.timeText}>
              {item.limit} / {item.test?.limit}
            </ThemedText>
          )}
        </View>
      </View>

      {isLocked && (
        <View style={styles.lockOverlay} pointerEvents="none">
          <MaterialCommunityIcons name="lock" size={48} color="#64748B" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SpeakingContent: React.FC = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const {
    data: userTestsData,
    isLoading,
    error,
  } = useUserTests({
    type: TestStatus.SPEAKING_TEST,
    currentPage: 1,
    pageSize: 10,
  });

  const items: UserTestItem[] =
    (userTestsData as any)?.data?.data?.results ?? [];

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
    router.push({
      pathname: ROUTES.APP.CONVERSATION,
      params: { topicId: String(materialId) },
    });
  };

  const handleLockedPress = () => {
    router.push(ROUTES.APP.SUBSCRIPTION);
  };

  return (
    <View style={styles.container}>
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
            <ThemedText style={[styles.statNumber, { color: "#8b5cf6" }]}>92%</ThemedText>
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
          <ThemedText style={{ textAlign: "center" }}>
            {t("common.loading", "Loading...")}
          </ThemedText>
        )}
        {!!error && (
          <ThemedText style={{ textAlign: "center", color: "#ef4444" }}>
            {error instanceof Error
              ? error.message
              : t("common.error", "Error")}
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
                onLockedPress={handleLockedPress}
              />
            </Animated.View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    marginTop: 16,
  },
  exercisesContainer: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
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
  lockedCard: {
    opacity: 0.6,
  },
  lockedIconContainer: {
    backgroundColor: "#d1d5db",
  },
  lockedText: {
    color: "#9ca3af",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
});


