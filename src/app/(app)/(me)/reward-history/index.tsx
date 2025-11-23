import BackScreen from '@components/molecules/Back';
import { Skeleton } from '@components/ui/Skeleton';
import { useRewardHistory } from '@hooks/useRewardHistory';
import { IRewardHistoryItem } from '@models/reward/reward.response';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Award, Gift, Sparkles } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      colors={['#ffffff', '#f8fafc']}
      style={styles.statsCard}
      className="rounded-3xl p-5 mb-4"
    >
      <Text className="text-lg font-extrabold text-slate-800 mb-4">
        {t('reward_history.statistics')}
      </Text>
      
      {/* Main Stats Row */}
      <View className="flex-row">
        <View className="flex-1 items-center mr-2">
          <View className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl px-4 py-3 mb-2 w-full items-center" style={{ backgroundColor: '#a855f7' }}>
            <Text className="text-3xl font-extrabold text-white">{totalRewards}</Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t('reward_history.total_rewards')}
          </Text>
        </View>
        
        <View className="flex-1 items-center ml-2">
          <View className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl px-4 py-3 mb-2 w-full items-center" style={{ backgroundColor: '#f59e0b' }}>
            <Text className="text-3xl font-extrabold text-white">{totalExp.toLocaleString()}</Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t('reward_history.total_exp')}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// Helper function to format date
const formatDate = (dateString: string, t: (key: string, options?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return t('reward_history.just_now');
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t('reward_history.minutes_ago', { minutes });
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t('reward_history.hours_ago', { hours });
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return t('reward_history.days_ago', { days });
  }
  
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper function to get source type icon and color
const getSourceTypeInfo = (sourceType: string) => {
  switch (sourceType) {
    case 'EXERCISE':
      return {
        icon: Award,
        color: '#a855f7',
        bgColor: '#f3e8ff',
      };
    case 'LESSON':
      return {
        icon: Gift,
        color: '#3b82f6',
        bgColor: '#dbeafe',
      };
    default:
      return {
        icon: Sparkles,
        color: '#f59e0b',
        bgColor: '#fef3c7',
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
  const isExpReward = item.rewardTargetSnapshot === 'EXP';

  return (
    <View className="mb-4">
      <LinearGradient
        colors={['#ffffff', '#fafbfc']}
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
              {t('reward_history.reward_received')}
            </Text>
            <Text className="text-sm font-semibold text-slate-500 tracking-wide">
              {formatDate(item.createdAt, t)}
            </Text>
          </View>
          
          {/* Amount Badge */}
          <View
            style={[styles.amountBadge, { backgroundColor: isExpReward ? '#fef3c7' : '#dbeafe' }]}
            className="px-3 py-1.5 rounded-2xl"
          >
            <Text style={{ color: isExpReward ? '#f59e0b' : '#3b82f6' }} className="text-lg font-extrabold">
              +{item.amount.toLocaleString()}
            </Text>
            <Text style={{ color: isExpReward ? '#f59e0b' : '#3b82f6' }} className="text-xs font-bold">
              {item.rewardTargetSnapshot}
            </Text>
          </View>
        </View>

        {/* Card Body - Reward Details */}
        <View className="pt-4 border-t border-slate-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-500 mb-1">
                {t('reward_history.reward_type')}
              </Text>
              <Text className="text-sm font-bold text-slate-700">
                {t(`rewards.types.${item.reward.rewardType.toLowerCase()}`) || item.reward.rewardType}
              </Text>
            </View>
            {item.reward.rewardItem && (
              <View className="flex-1 items-end">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t('reward_history.reward_item')}
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

export default function RewardHistoryScreen() {
  const { t } = useTranslation();
  const pageSize = 10;

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
  });

  // Get rewards list sorted by createdAt (newest first)
  const rewardsList = useMemo(() => {
    const rewards = rewardData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
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
      .filter((item) => item.rewardTargetSnapshot === 'EXP')
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

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <BackScreen onPress={() => router.back()} color="black" title={t('reward_history.title')} />

      {/* Content */}
      <View className="flex-1 px-4">
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
              {t('reward_history.load_error')}
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="bg-purple-500 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">{t('reward_history.retry')}</Text>
            </Pressable>
          </View>
        ) : rewardsList.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Gift size={64} color="#94a3b8" strokeWidth={1.5} />
            <Text className="text-xl font-bold text-slate-600 mt-4 mb-2">
              {t('reward_history.empty_title')}
            </Text>
            <Text className="text-sm text-slate-500 text-center px-8">
              {t('reward_history.empty_description')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={rewardsList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RewardCard
                item={item}
                t={t}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#a855f7']}
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
                  <ActivityIndicator size="large" color="#a855f7" />
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
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsCard: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  amountBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statsSkeleton: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  cardSkeleton: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingBottom: 20,
  },
});

