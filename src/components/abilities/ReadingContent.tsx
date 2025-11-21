import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { TestStatus } from "@constants/test.enum";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserTests } from "@hooks/useUserTest";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
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

const READING_ACCENT = "#3b82f6";
const SHAKE_SEGMENT_DURATION = 120;
const SHAKE_PAUSE_DURATION = 1200;
const SHAKE_TOTAL_DURATION = SHAKE_SEGMENT_DURATION * 3;
const PARTICLE_DELAY = 180;
const PARTICLE_PAUSE_AFTER =
  SHAKE_PAUSE_DURATION - PARTICLE_DELAY > 0
    ? SHAKE_PAUSE_DURATION - PARTICLE_DELAY
    : 0;

const ReadingCard: React.FC<{
  item: UserTestItem;
  onPress: () => void;
  onLockedPress: () => void;
}> = ({ item, onPress, onLockedPress }) => {
  const isLocked = item.status === "NOT_STARTED";
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const particleAnim = React.useRef(new Animated.Value(0)).current;
  const particleConfigs = React.useMemo(
    () =>
      Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        const radius = 14 + index * 2;
        return {
          id: `reading-lock-particle-${index}`,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          color: index % 2 === 0 ? "#facc15" : "#fef08a",
        };
      }),
    []
  );
  const shakeRotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-9deg", "9deg"],
  });

  React.useEffect(() => {
    if (!isLocked) {
      shakeAnim.stopAnimation();
      particleAnim.stopAnimation();
      shakeAnim.setValue(0);
      particleAnim.setValue(0);
      return;
    }

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: SHAKE_SEGMENT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: SHAKE_SEGMENT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: SHAKE_SEGMENT_DURATION,
          useNativeDriver: true,
        }),
        Animated.delay(SHAKE_PAUSE_DURATION),
      ])
    );

    const particleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: SHAKE_TOTAL_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(PARTICLE_PAUSE_AFTER),
      ]),
      { resetBeforeIteration: true }
    );

    shakeLoop.start();
    particleLoop.start();

    return () => {
      shakeLoop.stop();
      particleLoop.stop();
    };
  }, [isLocked, shakeAnim, particleAnim]);
  
  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { borderLeftColor: READING_ACCENT },
        isLocked && styles.lockedCard
      ]}
      onPress={isLocked ? onLockedPress : onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: "#3b82f6" },
          isLocked && styles.lockedIconContainer
        ]}>
          <BookOpen size={24} color={isLocked ? "#9ca3af" : "#ffffff"} />
        </View>
        <View style={styles.materialInfo}>
          <View style={styles.materialHeaderRow}>
            <ThemedText 
              type="subtitle" 
              style={[
                styles.materialTitle,
                isLocked && styles.lockedText
              ]}
            >
              {item.test?.name}
            </ThemedText>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>
                N{item.test?.levelN}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[
            styles.materialDescription,
            isLocked && styles.lockedText
          ]}>
            {item.test?.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          {!isLocked && (
            <ThemedText style={styles.timeText}>
              {item.limit} / {item.test?.limit}
            </ThemedText>
          )}
        </View>
      </View>

      {isLocked && (
        <View style={styles.lockOverlay} pointerEvents="none">
          <Animated.View
            style={{
              transform: [{ rotateZ: shakeRotate }],
            }}
          >
            <MaterialCommunityIcons name="lock" size={48} color="#64748B" />
          </Animated.View>
          {particleConfigs.map((particle) => (
            <Animated.View
              key={particle.id}
              style={[
                styles.lockParticle,
                {
                  backgroundColor: particle.color,
                  opacity: particleAnim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateX: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.x],
                      }),
                    },
                    {
                      translateY: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.y],
                      }),
                    },
                    {
                      scale: particleAnim.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.4, 1, 0.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const ReadingContent: React.FC = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const {
    data: userTestsData,
    isLoading,
    error,
  } = useUserTests({
    type: TestStatus.READING_TEST,
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

  const handleReadingPress = (materialId: number) => {
    router.push({
      pathname: ROUTES.TEST.TEST,
      params: { testId: String(materialId), testType: "READING_TEST" },
    });
  };

  const handleLockedPress = () => {
    router.push({
      pathname: ROUTES.APP.SUBSCRIPTION,
      params: { testType: "READING_TEST" },
    });
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
            <ThemedText style={[styles.statNumber, { color: "#3b82f6" }]}>92%</ThemedText>
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
              <ReadingCard
                item={item}
                onPress={() => handleReadingPress(item.test?.id)}
                onLockedPress={handleLockedPress}
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
  materialsContainer: {
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
  lockParticle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});


