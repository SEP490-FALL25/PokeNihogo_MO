import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { TestStatus } from "@constants/test.enum";
import userTestService from "@services/user-test";
import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
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

const ReadingCard: React.FC<{
  item: UserTestItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.readingCard, { borderLeftColor: "#3b82f6" }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: "#3b82f6" }]}>        
          <BookOpen size={24} color="#ffffff" />
        </View>
        <View style={styles.materialInfo}>
          <View style={styles.materialHeaderRow}>
            <ThemedText type="subtitle" style={styles.materialTitle}>
              {item.test?.name}
            </ThemedText>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>
                N{item.test?.levelN}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.materialDescription}>
            {item.test?.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <ThemedText style={styles.timeText}>
            {item.limit} / {item.test?.limit}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ReadingScreen() {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<UserTestItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await userTestService.getMy({
        type: TestStatus.READING_TEST,
        currentPage: 1,
        pageSize: 10,
      });
      const data = (res as any)?.data?.data?.results ?? [];
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

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

  const handleReadingPress = (materialId: number) => {
    router.push({
      pathname: "/test",
      params: { testId: String(materialId), testType: "READING_TEST" },
    });
  };

  return (
    <HomeLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedText type="title" style={styles.title}>
        📖 {t("reading.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>{t("reading.subtitle")}</ThemedText>

      <Animated.View
        style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 {t("reading.progress_title")}
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
        📚 {t("reading.materials_title")}
      </ThemedText>

      <View style={styles.materialsContainer}>
        {isLoading && (
          <ThemedText style={{ textAlign: "center" }}>Loading...</ThemedText>
        )}
        {!!error && (
          <ThemedText style={{ textAlign: "center", color: "#ef4444" }}>
            {error}
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
              <ReadingCard
                item={item}
                onPress={() => handleReadingPress(item.test?.id)}
              />
            </Animated.View>
          ))}
      </View>

      <ThemedView style={styles.tipsCard}>
        <ThemedText type="subtitle" style={styles.tipsTitle}>
          💡 {t("reading.tips_title")}
        </ThemedText>
        <View style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>• {t("reading.tip_1")}</ThemedText>
          <ThemedText style={styles.tipItem}>• {t("reading.tip_2")}</ThemedText>
          <ThemedText style={styles.tipItem}>• {t("reading.tip_3")}</ThemedText>
          <ThemedText style={styles.tipItem}>• {t("reading.tip_4")}</ThemedText>
        </View>
      </ThemedView>
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
  materialsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  readingCard: {
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
  materialInfo: {
    flex: 1,
  },
  materialHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  cardFooter: {
    gap: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
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
    color: "#f59e0b",
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
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
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
});
