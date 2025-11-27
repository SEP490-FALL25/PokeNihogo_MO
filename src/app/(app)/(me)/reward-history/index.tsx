import BackScreen from "@components/molecules/Back";
import { FilterSection } from "@components/reward-history/FilterSection";
import { RewardCard } from "@components/reward-history/RewardCard";
import { StatisticsCard } from "@components/reward-history/StatisticsCard";

import { Skeleton } from "@components/ui/Skeleton";
import { REWARD_HISTORY_COLORS } from "@constants/reward-history.constants";
import { RewardSourceType } from "@constants/reward.enum";
import { useRewardHistory } from "@hooks/useRewardHistory";
import { router } from "expo-router";
import { Gift } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 10;

export default function RewardHistoryScreen() {
  const { t } = useTranslation();
  const [sourceType, setSourceType] = useState<RewardSourceType | undefined>(
    undefined
  );
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Validate selected date range before hitting the API
  const dateRangeError = useMemo(() => {
    if (dateTo && !dateFrom) {
      return t("reward_history.filter.error_missing_start", {
        defaultValue: "Select a start date before choosing an end date.",
      });
    }

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      if (fromDate > toDate) {
        return t("reward_history.filter.error_invalid_range", {
          defaultValue: "Start date must be before end date.",
        });
      }
    }

    return undefined;
  }, [dateFrom, dateTo, t]);

  const isDateRangeValid = !dateRangeError;

  // Convert date strings for API (YYYY-MM-DD as required by backend)
  const dateFromISO = useMemo(() => {
    if (!dateFrom || !isDateRangeValid) return undefined;
    return dateFrom; // already in YYYY-MM-DD format
  }, [dateFrom, isDateRangeValid]);

  const dateToISO = useMemo(() => {
    if (!dateTo || !isDateRangeValid) return undefined;
    return dateTo; // already in YYYY-MM-DD format
  }, [dateTo, isDateRangeValid]);

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
    pageSize: PAGE_SIZE,
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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSourceTypeChange = useCallback((value: string) => {
    setSourceType(value ? (value as RewardSourceType) : undefined);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSourceType(undefined);
    setDateFrom("");
    setDateTo("");
  }, []);

  const renderRewardCard = useCallback(
    ({ item }: { item: any }) => <RewardCard item={item} t={t} />,
    [t]
  );

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  const renderHeader = useMemo(
    () => (
      <StatisticsCard
        totalRewards={statistics.totalRewards}
        totalExp={statistics.totalExp}
        t={t}
      />
    ),
    [statistics.totalRewards, statistics.totalExp, t]
  );

  const renderFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View className="py-4">
          <ActivityIndicator
            size="large"
            color={REWARD_HISTORY_COLORS.PRIMARY}
          />
        </View>
      ) : null,
    [isFetchingNextPage]
  );

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
          dateRangeError={dateRangeError}
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
              style={{ backgroundColor: REWARD_HISTORY_COLORS.PRIMARY }}
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
            keyExtractor={keyExtractor}
            renderItem={renderRewardCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={[REWARD_HISTORY_COLORS.PRIMARY]}
              />
            }
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
