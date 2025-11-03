import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import { TestStatus } from "@constants/test.enum";
import userTestService from "@services/user-test";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

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

const ListeningCard: React.FC<{
  item: UserTestItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.listeningCard, { borderLeftColor: "#10b981" }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: "#10b981" }]}>
          <IconSymbol name={"headphones" as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.exerciseInfo}>
          <View style={styles.materialHeaderRow}>
            <ThemedText type="subtitle" style={styles.exerciseTitle}>
              {item.test?.name}
            </ThemedText>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>
                N{item.test?.levelN}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.exerciseDescription}>
            {item.test?.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <ThemedText style={styles.durationText}>
            {item.limit} / {item.test?.limit}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ListeningScreen() {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<UserTestItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await userTestService.getMy({
          type: TestStatus.LISTENING_TEST,
          currentPage: 1,
          pageSize: 10,
        });
        const data = (res as any)?.data?.data?.results ?? [];
        if (mounted) setItems(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Error");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  const handleListeningPress = (testId: number) => {
    router.push({
      pathname: "/test",
      params: { testId: String(testId), testType: "LISTENING_TEST" },
    });
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        🎧 {t("listening.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t("listening.subtitle")}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🎵 {t("listening.audio_exercises")}
      </ThemedText>

      <View style={styles.exercisesContainer}>
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
              <ListeningCard
                item={item}
                onPress={() => handleListeningPress(item.test?.id)}
              />
            </Animated.View>
          ))}
      </View>

      <Animated.View
        style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 {t("listening.progress_title")}
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>15</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.exercises_done")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>2.5h</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.total_time")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>88%</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.accuracy")}</ThemedText>
          </View>
        </View>
      </Animated.View>

      <ThemedView style={styles.tipsCard}>
        <ThemedText type="subtitle" style={styles.tipsTitle}>
          🎯 {t("listening.tips_title")}
        </ThemedText>
        <View style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_1")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_2")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_3")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_4")}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.controlsCard}>
        <ThemedText type="subtitle" style={styles.controlsTitle}>
          🎛️ {t("listening.controls_title")}
        </ThemedText>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"backward.fill" as any}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"play.circle.fill" as any}
              size={48}
              color="#3b82f6"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"forward.fill" as any}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.controlsHint}>
          {t("listening.controls_hint")}
        </ThemedText>
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
  exercisesContainer: {
    gap: 16,
  },
  listeningCard: {
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
  playButton: {
    marginLeft: 8,
  },
  cardFooter: {
    gap: 8,
  },
  materialHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  durationText: {
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
    color: "#8b5cf6",
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
  controlsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
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
});
