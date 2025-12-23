import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { TestStatus } from "@constants/test.enum";
import { useUserTests } from "@hooks/useUserTest";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import { HeadphonesIcon } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { LockOverlay } from "./LockOverlay";

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

const LISTENING_ACCENT = "#10b981";
const LISTENING_PARTICLE_PALETTE = ["#fcd34d", "#fef9c3"];

const ListeningCard: React.FC<{
  item: UserTestItem;
  onPress: () => void;
  onLockedPress: () => void;
}> = ({ item, onPress, onLockedPress }) => {
  const isLocked = item.status === "NOT_STARTED";
  const isUnlimited =
    item.limit === 0 && (item.test?.limit === 0 || item.test?.limit == null);
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: LISTENING_ACCENT },
        isLocked && styles.lockedCard,
      ]}
      onPress={isLocked ? onLockedPress : onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: "#10b981" },
            isLocked && styles.lockedIconContainer,
          ]}
        >
          <HeadphonesIcon size={24} color={isLocked ? "#9ca3af" : "#ffffff"} />
        </View>
        <View style={styles.exerciseInfo}>
          <View style={styles.materialHeaderRow}>
            <ThemedText
              type="subtitle"
              style={[styles.exerciseTitle, isLocked && styles.lockedText]}
            >
              {item.test?.name}
            </ThemedText>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>
                N{item.test?.levelN}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          {!isLocked &&
            (isUnlimited ? (
              <ThemedText style={styles.durationText}>∞</ThemedText>
            ) : (
              <ThemedText style={styles.durationText}>
                {item.limit} / {item.test?.limit}
              </ThemedText>
            ))}
        </View>
      </View>

      {isLocked && (
        <LockOverlay
          isVisible={isLocked}
          pokemonImageUri="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
          pokemonImageSize={70}
          particlePalette={LISTENING_PARTICLE_PALETTE}
        />
      )}
    </TouchableOpacity>
  );
};

export const ListeningContent: React.FC = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const {
    data: userTestsData,
    isLoading,
    error,
  } = useUserTests({
    type: TestStatus.LISTENING_TEST,
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

  const handleListeningPress = (testId: number) => {
    router.push({
      pathname: ROUTES.TEST.TEST,
      params: { testId: String(testId), testType: "LISTENING_TEST" },
    });
  };

  const handleLockedPress = () => {
    router.push({
      pathname: ROUTES.APP.SUBSCRIPTION,
      params: { testType: "LISTENING_TEST" },
    });
  };

  return (
    <View style={styles.container}>
      {/* <Animated.View
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
            <ThemedText style={[styles.statNumber, { color: "#10b981" }]}>88%</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.accuracy")}</ThemedText>
          </View>
        </View>
      </Animated.View> */}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🎵 {t("listening.audio_exercises")}
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
              <ListeningCard
                item={item}
                onPress={() => handleListeningPress(item.test?.id)}
                onLockedPress={handleLockedPress}
              />
            </Animated.View>
          ))}
      </View>

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
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
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
    marginTop: 4,
    lineHeight: 20,
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
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 40,
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
  lockedCard: {
    opacity: 0.6,
  },
  lockedIconContainer: {
    backgroundColor: "#d1d5db",
  },
  lockedText: {
    color: "#9ca3af",
  },
});
