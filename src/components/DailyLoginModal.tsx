"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BounceButton from "./ui/BounceButton";

interface CheckInDay {
  date: string;
  status: "checked" | "missed" | "future";
}

interface DailyLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckIn: () => Promise<void> | void;
  streak: number;
  hasCheckedInToday: boolean;
  checkInHistory: string[];
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function DailyLoginModal({
  visible,
  onClose,
  onCheckIn,
  streak,
  hasCheckedInToday,
  checkInHistory = [],
  isLoading = false,
  isSubmitting = false,
}: DailyLoginModalProps) {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(streakPulse, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(streakPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, scaleAnim, streakPulse]);

  const normalizedHistory = useMemo(
    () =>
      checkInHistory
        .map((date) => normalizeDate(date))
        .filter((value, index, array) => value && array.indexOf(value) === index),
    [checkInHistory]
  );

  const checkInDays = useMemo(
    () => createLast7Days(normalizedHistory, hasCheckedInToday),
    [normalizedHistory, hasCheckedInToday]
  );

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function createLast7Days(history: string[], todayChecked: boolean) {
    const days: CheckInDay[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      let status: "checked" | "missed" | "future" = "missed";

      if (dateString === getTodayDate()) {
        status = todayChecked ? "checked" : "future";
      } else if (history.includes(dateString)) {
        status = "checked";
      } else if (date < today) {
        status = "missed";
      }

      days.push({ date: dateString, status });
    }

    return days;
  }

  const triggerCelebration = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  };

  const handleCheckIn = async () => {
    if (hasCheckedInToday || isSubmitting) {
      return;
    }

    try {
      await onCheckIn();
      triggerCelebration();
    } catch (error) {
      console.error("Error during attendance check-in:", error);
    }
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = [
      t("daily_login.day_names.sun"),
      t("daily_login.day_names.mon"),
      t("daily_login.day_names.tue"),
      t("daily_login.day_names.wed"),
      t("daily_login.day_names.thu"),
      t("daily_login.day_names.fri"),
      t("daily_login.day_names.sat")
    ];
    return days[date.getDay()];
  };

  const getDateNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={styles.loadingText}>
                  {t("daily_login.loading_state", "Đang tải dữ liệu điểm danh...")}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>{t("daily_login.title")}</Text>
                  <Text style={styles.subtitle}>
                    {t("daily_login.subtitle")}
                  </Text>
                </View>

                <Animated.View
                  style={[
                    styles.streakContainer,
                    { transform: [{ scale: streakPulse }] },
                  ]}
                >
                  <View style={styles.streakGlow}>
                    <Text style={styles.flameIcon}>🔥</Text>
                    <View style={styles.streakInfo}>
                      <Text style={styles.streakNumber}>{streak}</Text>
                      <Text style={styles.streakLabel}>{t("daily_login.consecutive_days")}</Text>
                    </View>
                  </View>
                </Animated.View>

                <View style={styles.motivationContainer}>
                  <Text style={styles.motivationText}>
                    {streak === 0 && t("daily_login.motivation.start_streak")}
                    {streak > 0 && streak < 7 && t("daily_login.motivation.keep_going")}
                    {streak >= 7 &&
                      streak < 30 &&
                      t("daily_login.motivation.excellent")}
                    {streak >= 30 && t("daily_login.motivation.legendary")}
                  </Text>
                </View>

                <View style={styles.calendarSection}>

                  <View style={styles.calendarGrid}>
                    {checkInDays.map((day, index) => (
                      <View key={index} style={styles.dayColumn}>
                        <Text style={styles.dayName}>{getDayName(day.date)}</Text>
                        <View
                          style={[
                            styles.dayBox,
                            day.status === "checked" && styles.dayBoxChecked,
                            day.status === "missed" && styles.dayBoxMissed,
                            day.status === "future" && styles.dayBoxFuture,
                          ]}
                        >
                          {day.status === "checked" ? (
                            <View style={styles.iconContainer}>
                              <Text style={styles.checkIcon}>✓</Text>
                            </View>
                          ) : day.status === "missed" ? (
                            <View style={styles.iconContainer}>
                              <Text style={styles.missIcon}>✗</Text>
                            </View>
                          ) : (
                            <Text style={styles.dateNumber}>
                              {getDateNumber(day.date)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.dayDot} />
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.checkInButtonContainer}>
                  <BounceButton
                    variant="solid"
                    size="full"
                    onPress={handleCheckIn}
                    disabled={hasCheckedInToday || isSubmitting}
                    withHaptics={true}
                    className="h-16"
                  >
                    {hasCheckedInToday
                      ? t("daily_login.already_checked")
                      : isSubmitting
                      ? t("daily_login.check_in_progress", "Đang điểm danh...")
                      : t("daily_login.check_in_button")}
                  </BounceButton>
                </View>
              </>
            )}

            {showCelebration && (
              <Animated.View
                style={[
                  styles.celebrationOverlay,
                  {
                    opacity: celebrationAnim,
                    transform: [
                      {
                        scale: celebrationAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.5],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.celebrationText}>🎉</Text>
              </Animated.View>
            )}

            <BounceButton
              variant="ghost"
              size="full"
              onPress={onClose}
              withHaptics={true}
              className="h-12"
            >
              {t("daily_login.close")}
            </BounceButton>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");
const modalWidth = Math.min(width * 0.92, 420);
const isSmallDevice = width < 375;

const normalizeDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const normalized = new Date(dateString);
    return normalized.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: modalWidth,
    maxHeight: height * 0.85,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: isSmallDevice ? 26 : 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  streakGlow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#ffedd5",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 200,
  },
  flameIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#f97316",
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 13,
    color: "#78716c",
    marginTop: 4,
    fontWeight: "600",
  },
  motivationContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    borderRightWidth: 4,
    borderRightColor: "#3b82f6",
  },
  motivationText: {
    fontSize: 14,
    color: "#1e40af",
    textAlign: "center",
    fontWeight: "600",
  },
  calendarSection: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  calendarIcon: {
    fontSize: 16,
  },
  calendarLabel: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dayBox: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayBoxChecked: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayBoxMissed: {
    backgroundColor: "#fafafa",
    borderColor: "#e5e5e5",
  },
  dayBoxFuture: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    fontSize: 24,
    color: "#16a34a",
    fontWeight: "bold",
  },
  missIcon: {
    fontSize: 20,
    color: "#a3a3a3",
    fontWeight: "bold",
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 24,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendIconChecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  legendIconMissed: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
  },
  legendCheckIcon: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "bold",
  },
  legendMissIcon: {
    fontSize: 14,
    color: "#a3a3a3",
    fontWeight: "bold",
  },
  legendText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  checkInButtonContainer: {
    marginBottom: 16,
  },
  celebrationOverlay: {
    position: "absolute",
    top: "40%",
    left: "50%",
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationText: {
    fontSize: 60,
  },
});
