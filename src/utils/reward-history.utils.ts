import { Award, Gift, Sparkles } from "lucide-react-native";
import { TFunction } from "react-i18next";
import { REWARD_HISTORY_COLORS } from "@constants/reward-history.constants";

/**
 * Format date to relative time or absolute date
 */
export const formatRewardDate = (
  dateString: string,
  t: TFunction
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t("reward_history.just_now");
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t("reward_history.minutes_ago", { minutes });
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t("reward_history.hours_ago", { hours });
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return t("reward_history.days_ago", { days });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get source type icon and color configuration
 */
export const getRewardSourceTypeInfo = (sourceType: string) => {
  switch (sourceType) {
    case "EXERCISE":
      return {
        icon: Award,
        color: REWARD_HISTORY_COLORS.PRIMARY,
        bgColor: REWARD_HISTORY_COLORS.EXERCISE_BG,
      };
    case "LESSON":
      return {
        icon: Gift,
        color: REWARD_HISTORY_COLORS.COIN_REWARD_TEXT,
        bgColor: REWARD_HISTORY_COLORS.LESSON_BG,
      };
    default:
      return {
        icon: Sparkles,
        color: REWARD_HISTORY_COLORS.EXP_REWARD_TEXT,
        bgColor: REWARD_HISTORY_COLORS.OTHER_BG,
      };
  }
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatRewardDateString = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generate calendar days for a given month
 */
export const getRewardCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return { days, year, month };
};

/**
 * Month names for calendar display
 */
export const REWARD_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Week day abbreviations
 */
export const REWARD_WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

