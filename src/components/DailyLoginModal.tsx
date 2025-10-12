"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
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
  onCheckIn: () => void;
}

export function DailyLoginModal({
  visible,
  onClose,
  onCheckIn,
}: DailyLoginModalProps) {
  const [streak, setStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkInDays, setCheckInDays] = useState<CheckInDay[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadCheckInData();
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
  }, [visible]);

  const loadCheckInData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("dailyCheckIn");
      if (storedData) {
        const data = JSON.parse(storedData);
        setStreak(data.streak || 0);
        setHasCheckedInToday(data.lastCheckIn === getTodayDate());

        const days = generateLast7Days(data.checkInHistory || []);
        setCheckInDays(days);
      } else {
        const days = generateLast7Days([]);
        setCheckInDays(days);
      }
    } catch (error) {
      console.error("Error loading check-in data:", error);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const generateLast7Days = (checkInHistory: string[]) => {
    const days: CheckInDay[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      let status: "checked" | "missed" | "future" = "missed";

      if (dateString === getTodayDate()) {
        status = checkInHistory.includes(dateString) ? "checked" : "future";
      } else if (checkInHistory.includes(dateString)) {
        status = "checked";
      } else if (date < today) {
        status = "missed";
      }

      days.push({ date: dateString, status });
    }

    return days;
  };

  const handleCheckIn = async () => {
    const today = getTodayDate();
    try {
      const storedData = await AsyncStorage.getItem("dailyCheckIn");
      const data = storedData
        ? JSON.parse(storedData)
        : { streak: 0, checkInHistory: [], lastCheckIn: null };

      if (data.lastCheckIn === today) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split("T")[0];

      if (data.lastCheckIn === yesterdayDate) {
        data.streak += 1;
      } else if (data.lastCheckIn !== today) {
        data.streak = 1;
      }

      data.checkInHistory.push(today);
      data.lastCheckIn = today;

      await AsyncStorage.setItem("dailyCheckIn", JSON.stringify(data));

      setStreak(data.streak);
      setHasCheckedInToday(true);
      const days = generateLast7Days(data.checkInHistory);
      setCheckInDays(days);

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

      onCheckIn();
    } catch (error) {
      console.error("Error saving check-in:", error);
    }
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
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
            <View style={styles.header}>
              <Text style={styles.title}>Điểm danh hàng ngày</Text>
              <Text style={styles.subtitle}>
                Duy trì thói quen tốt mỗi ngày
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
                  <Text style={styles.streakLabel}>ngày liên tiếp</Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>
                {streak === 0 && "Bắt đầu chuỗi điểm danh của bạn!"}
                {streak > 0 && streak < 7 && "Tuyệt vời! Hãy tiếp tục!"}
                {streak >= 7 &&
                  streak < 30 &&
                  "Xuất sắc! Bạn đang làm rất tốt!"}
                {streak >= 30 && "Đỉnh cao! Bạn là huyền thoại!"}
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
                disabled={hasCheckedInToday}
                withHaptics={true}
                className="h-16"
              >
                {hasCheckedInToday
                  ? "✓ Đã điểm danh hôm nay"
                  : "Điểm danh ngay 🎯"}
              </BounceButton>
            </View>

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
              Đóng
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
