import BackScreen from "@components/molecules/Back";
import { Select } from "@components/ui/Select";
import { Skeleton } from "@components/ui/Skeleton";
import { RewardSourceType } from "@constants/reward.enum";
import { useRewardHistory } from "@hooks/useRewardHistory";
import { IRewardHistoryItem } from "@models/reward/reward.response";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Award,
  Calendar,
  Filter,
  Gift,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// Statistics Card Component
interface StatisticsCardProps {
  totalRewards: number;
  totalExp: number;
  t: (key: string, options?: any) => string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  totalRewards,
  totalExp,
  t,
}) => {
  return (
    <LinearGradient
      colors={["#ffffff", "#f8fafc"]}
      style={styles.statsCard}
      className="rounded-3xl p-5 mb-4"
    >
      <Text className="text-lg font-extrabold text-slate-800 mb-4">
        {t("reward_history.statistics")}
      </Text>

      {/* Main Stats Row */}
      <View className="flex-row">
        <View className="flex-1 items-center mr-2">
          <View
            className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl px-4 py-3 mb-2 w-full items-center"
            style={{ backgroundColor: "#22C55E" }}
          >
            <Text className="text-3xl font-extrabold text-white">
              {totalRewards}
            </Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t("reward_history.total_rewards")}
          </Text>
        </View>

        <View className="flex-1 items-center ml-2">
          <View
            className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl px-4 py-3 mb-2 w-full items-center"
            style={{ backgroundColor: "#f59e0b" }}
          >
            <Text className="text-3xl font-extrabold text-white">
              {totalExp.toLocaleString()}
            </Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t("reward_history.total_exp")}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// Helper function to format date
const formatDate = (
  dateString: string,
  t: (key: string, options?: any) => string
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

// Helper function to get source type icon and color
const getSourceTypeInfo = (sourceType: string) => {
  switch (sourceType) {
    case "EXERCISE":
      return {
        icon: Award,
        color: "#22C55E",
        bgColor: "#dcfce7",
      };
    case "LESSON":
      return {
        icon: Gift,
        color: "#3b82f6",
        bgColor: "#dbeafe",
      };
    default:
      return {
        icon: Sparkles,
        color: "#f59e0b",
        bgColor: "#fef3c7",
      };
  }
};

// Reward History Card Component
interface RewardCardProps {
  item: IRewardHistoryItem;
  onPress?: () => void;
  t: (key: string) => string;
}

const RewardCard: React.FC<RewardCardProps> = ({ item, t }) => {
  const sourceInfo = getSourceTypeInfo(item.sourceType);
  const Icon = sourceInfo.icon;
  const isExpReward = item.rewardTargetSnapshot === "EXP";

  return (
    <View className="mb-4">
      <LinearGradient
        colors={["#ffffff", "#fafbfc"]}
        style={styles.card}
        className="rounded-3xl p-5 overflow-hidden shadow-lg"
      >
        {/* Card Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <View
                style={{ backgroundColor: sourceInfo.bgColor }}
                className="p-2 rounded-xl mr-2"
              >
                <Icon size={18} color={sourceInfo.color} strokeWidth={2.5} />
              </View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {t(`reward_history.source.${item.sourceType.toLowerCase()}`)}
              </Text>
            </View>
            <Text className="text-lg font-extrabold text-slate-800 mb-1 tracking-tight">
              {t("reward_history.reward_received")}
            </Text>
            <Text className="text-sm font-semibold text-slate-500 tracking-wide">
              {formatDate(item.createdAt, t)}
            </Text>
          </View>

          {/* Amount Badge */}
          <View
            style={[
              styles.amountBadge,
              { backgroundColor: isExpReward ? "#fef3c7" : "#dbeafe" },
            ]}
            className="px-3 py-1.5 rounded-2xl"
          >
            <Text
              style={{ color: isExpReward ? "#f59e0b" : "#3b82f6" }}
              className="text-lg font-extrabold"
            >
              +{item.amount.toLocaleString()}
            </Text>
            <Text
              style={{ color: isExpReward ? "#f59e0b" : "#3b82f6" }}
              className="text-xs font-bold"
            >
              {item.rewardTargetSnapshot}
            </Text>
          </View>
        </View>

        {/* Card Body - Reward Details */}
        <View className="pt-4 border-t border-slate-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-500 mb-1">
                {t("reward_history.reward_type")}
              </Text>
              <Text className="text-sm font-bold text-slate-700">
                {t(`rewards.types.${item.reward.rewardType.toLowerCase()}`) ||
                  item.reward.rewardType}
              </Text>
            </View>
            {item.reward.rewardItem && (
              <View className="flex-1 items-end">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.reward_item")}
                </Text>
                <Text className="text-sm font-bold text-slate-700">
                  {item.reward.rewardItem}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Date Picker Button Component
interface DatePickerButtonProps {
  value: string;
  onSelect: (date: string) => void;
  placeholder?: string;
  t?: (key: string) => string;
}

const DatePickerButton: React.FC<DatePickerButtonProps> = ({
  value,
  onSelect,
  placeholder = "Select date",
  t,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(formatDate(selectedDate));
    }
    setShowPicker(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onSelect("");
    setShowPicker(false);
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const today = new Date();
    const currentDate = selectedDate || today;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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

  const { days, year, month } = getCalendarDays();
  const monthNames = [
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

  const navigateMonth = (direction: "prev" | "next") => {
    const current = selectedDate || new Date();
    const newDate = new Date(current);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const selectDay = (day: number) => {
    const current = selectedDate || new Date();
    const newDate = new Date(current.getFullYear(), current.getMonth(), day);
    setSelectedDate(newDate);
  };

  const isSelected = (day: number | null): boolean => {
    if (!day || !selectedDate) return false;
    const current = selectedDate;
    return (
      current.getDate() === day &&
      current.getMonth() === month &&
      current.getFullYear() === year
    );
  };

  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text
          className={`text-sm ${value ? "text-slate-800" : "text-slate-400"}`}
        >
          {value || placeholder}
        </Text>
        <Calendar size={18} color="#64748b" strokeWidth={2} />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-4"
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
          >
            {/* Calendar Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => navigateMonth("prev")} className="p-2">
                <Text className="text-xl font-bold text-slate-600">‹</Text>
              </Pressable>
              <Text className="text-lg font-bold text-slate-800">
                {monthNames[month]} {year}
              </Text>
              <Pressable onPress={() => navigateMonth("next")} className="p-2">
                <Text className="text-xl font-bold text-slate-600">›</Text>
              </Pressable>
            </View>

            {/* Week Days */}
            <View className="flex-row mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className="text-xs font-bold text-slate-500">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap mb-4">
              {days.map((day, index) => (
                <Pressable
                  key={index}
                  onPress={() => day && selectDay(day)}
                  className={`w-[14.28%] p-3 aspect-square items-center justify-center ${
                    isSelected(day)
                      ? "bg-green-500 rounded-xl"
                      : isToday(day)
                        ? "bg-green-100 rounded-xl"
                        : ""
                  }`}
                  style={isSelected(day) ? { backgroundColor: "#22C55E" } : undefined}
                >
                  {day && (
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected(day)
                          ? "text-white"
                          : isToday(day)
                            ? "text-green-600"
                            : "text-slate-700"
                      }`}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleClear}
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center"
              >
                <Text className="text-sm font-bold text-slate-600">
                  {t ? t("reward_history.filter.clear") : "Clear"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                style={{ backgroundColor: "#22C55E" }}
              >
                <Text className="text-sm font-bold text-white">
                  {t ? t("reward_history.filter.confirm") : "Confirm"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// Filter Component
interface FilterSectionProps {
  sourceType: RewardSourceType | undefined;
  dateFrom: string;
  dateTo: string;
  onSourceTypeChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
  t: (key: string) => string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  sourceType,
  dateFrom,
  dateTo,
  onSourceTypeChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  t,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = sourceType || dateFrom || dateTo;
  const activeFilterCount = [sourceType, dateFrom, dateTo].filter(
    Boolean
  ).length;

  const sourceTypeOptions = [
    { label: t("reward_history.filter.all"), value: "" },
    {
      label: t("reward_history.source.exercise"),
      value: RewardSourceType.EXERCISE,
    },
    {
      label: t("reward_history.source.lesson"),
      value: RewardSourceType.LESSON,
    },
    {
      label: t("reward_history.source.daily_login"),
      value: RewardSourceType.DAILY_REQUEST,
    },
    {
      label: t("reward_history.source.achievement"),
      value: RewardSourceType.ACHIEVEMENT_REWARD,
    },
    {
      label: t("reward_history.source.attendance"),
      value: RewardSourceType.ATTENDANCE,
    },
    {
      label: t("reward_history.source.season_reward"),
      value: RewardSourceType.SEASON_REWARD,
    },
    { label: t("reward_history.source.other"), value: RewardSourceType.OTHER },
  ];

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setShowFilters(!showFilters)}
        className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-row items-center">
          <Filter size={20} color="#22C55E" strokeWidth={2.5} />
          <Text className="ml-2 text-base font-bold text-slate-800">
            {t("reward_history.filter.title")}
          </Text>
          {hasActiveFilters && (
            <View className="ml-2 bg-green-500 rounded-full px-2 py-0.5" style={{ backgroundColor: "#22C55E" }}>
              <Text className="text-xs font-bold text-white">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </View>
        {hasActiveFilters && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClearFilters();
            }}
            className="ml-2"
          >
            <X size={18} color="#ef4444" strokeWidth={2.5} />
          </Pressable>
        )}
      </Pressable>

      {showFilters && (
        <View className="mt-2 bg-white rounded-2xl p-4 shadow-sm">
          {/* Source Type Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-600 mb-2">
              {t("reward_history.filter.source_type")}
            </Text>
            <Select
              options={sourceTypeOptions}
              selectedValue={sourceType || ""}
              onValueChange={onSourceTypeChange}
              placeholder={t("reward_history.filter.select_source_type")}
            />
          </View>

          {/* Date Range Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-600 mb-2">
              {t("reward_history.filter.date_range")}
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.filter.date_from")}
                </Text>
                <DatePickerButton
                  value={dateFrom}
                  onSelect={onDateFromChange}
                  placeholder={t("reward_history.filter.select_date")}
                  t={t}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.filter.date_to")}
                </Text>
                <DatePickerButton
                  value={dateTo}
                  onSelect={onDateToChange}
                  placeholder={t("reward_history.filter.select_date")}
                  t={t}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default function RewardHistoryScreen() {
  const { t } = useTranslation();
  const pageSize = 10;
  const [sourceType, setSourceType] = useState<RewardSourceType | undefined>(
    undefined
  );
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Convert date strings to ISO format for API
  const dateFromISO = dateFrom ? new Date(dateFrom).toISOString() : undefined;
  const dateToISO = dateTo ? new Date(dateTo).toISOString() : undefined;

  const {
    data: rewardData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useRewardHistory({
    pageSize,
    sourceType: sourceType || undefined,
    dateFrom: dateFromISO,
    dateTo: dateToISO,
  });

  // Get rewards list sorted by createdAt (newest first)
  const rewardsList = useMemo(() => {
    const rewards =
      rewardData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
    return rewards.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [rewardData]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRewards = rewardsList.length;
    const totalExp = rewardsList
      .filter((item) => item.rewardTargetSnapshot === "EXP")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalRewards,
      totalExp,
    };
  }, [rewardsList]);

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSourceTypeChange = (value: string) => {
    setSourceType(value ? (value as RewardSourceType) : undefined);
  };

  const handleClearFilters = () => {
    setSourceType(undefined);
    setDateFrom("");
    setDateTo("");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <BackScreen
        onPress={() => router.back()}
        color="black"
        title={t("reward_history.title")}
      />

      {/* Content */}
      <View className="flex-1 px-4">
        {/* Filter Section */}
        <FilterSection
          sourceType={sourceType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSourceTypeChange={handleSourceTypeChange}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onClearFilters={handleClearFilters}
          t={t}
        />

        {isLoading ? (
          <View className="flex-1">
            {/* Statistics Skeleton */}
            <View className="mb-4">
              <Skeleton style={styles.statsSkeleton} className="rounded-3xl" />
            </View>
            {/* Cards Skeleton */}
            {Array.from({ length: 3 }, (_, i) => (
              <View key={i} className="mb-4">
                <Skeleton style={styles.cardSkeleton} className="rounded-3xl" />
              </View>
            ))}
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 font-semibold mb-4">
              {t("reward_history.load_error")}
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="bg-green-500 px-6 py-3 rounded-2xl"
              style={{ backgroundColor: "#22C55E" }}
            >
              <Text className="text-white font-bold">
                {t("reward_history.retry")}
              </Text>
            </Pressable>
          </View>
        ) : rewardsList.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Gift size={64} color="#94a3b8" strokeWidth={1.5} />
            <Text className="text-xl font-bold text-slate-600 mt-4 mb-2">
              {t("reward_history.empty_title")}
            </Text>
            <Text className="text-sm text-slate-500 text-center px-8">
              {t("reward_history.empty_description")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={rewardsList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RewardCard item={item} t={t} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={["#22C55E"]}
              />
            }
            ListHeaderComponent={
              <StatisticsCard
                totalRewards={statistics.totalRewards}
                totalExp={statistics.totalExp}
                t={t}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="large" color="#22C55E" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsCard: {
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  amountBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  statsSkeleton: {
    width: "100%",
    height: 180,
    backgroundColor: "#f1f5f9",
  },
  cardSkeleton: {
    width: "100%",
    height: 160,
    backgroundColor: "#f1f5f9",
  },
  listContent: {
    paddingBottom: 20,
  },
});
