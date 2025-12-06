import { ExerciseAttemptStatus } from '@constants/exercise.enum';
import { SubscriptionFeatureKey } from '@constants/subscription.enum';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSubscriptionFeatures } from '@hooks/useSubscriptionFeatures';
import { clsx } from 'clsx';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  GestureResponderEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface RewardDetail {
  id: string | number;
  name: string;
  rewardType: string;
  rewardItem: number;
  rewardTarget: string;
}

export interface RewardMilestone {
  id: string | number;
  name?: string;
  exerciseType?: string;
  status?: ExerciseAttemptStatus | string;
  rewards: RewardDetail[];
  isBigReward?: boolean; // Đánh dấu mốc lớn
}

interface RewardProgressProps {
  exercises: RewardMilestone[];
}

const SMALL_NODE_SIZE = 48;
const BIG_NODE_SIZE = 80;
const TRACK_HORIZONTAL_PADDING = 32;
const getNodeSize = (isBig?: boolean) => (isBig ? BIG_NODE_SIZE : SMALL_NODE_SIZE);

export const RewardProgress: React.FC<RewardProgressProps> = ({
  exercises,
}) => {
  const { t } = useTranslation();
  const [selectedReward, setSelectedReward] = useState<RewardMilestone | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const { hasFeature, getFeatureValue } = useSubscriptionFeatures();
  const hasXpMultiplier = hasFeature(SubscriptionFeatureKey.XP_MULTIPLIER);
  const hasCoinMultiplier = hasFeature(SubscriptionFeatureKey.COIN_MULTIPLIER);
  const xpMultiplierValue = hasXpMultiplier
    ? getFeatureValue(SubscriptionFeatureKey.XP_MULTIPLIER) ?? 1
    : 1;
  const coinMultiplierValue = hasCoinMultiplier
    ? getFeatureValue(SubscriptionFeatureKey.COIN_MULTIPLIER) ?? 1
    : 1;
  const handleOutsidePress = () => {
    if (selectedReward) {
      setSelectedReward(null);
    }
  };
  const getRewardIcon = (
    target?: string,
    type?: string
  ): keyof typeof MaterialCommunityIcons.glyphMap => {
    const normalizedTarget = target?.toUpperCase() ?? '';
    const normalizedType = type?.toUpperCase() ?? '';

    if (normalizedTarget === 'EXP') {
      return 'lightning-bolt';
    }

    if (normalizedTarget === 'COIN' || normalizedTarget === 'COINS') {
      return 'currency-usd';
    }

    if (normalizedType === 'LESSON') {
      return 'book-open-variant';
    }

    if (normalizedType === 'STREAK') {
      return 'fire';
    }

    return 'gift';
  };

  const getRewardMultiplier = (reward: RewardDetail) => {
    const target = reward.rewardTarget?.toUpperCase() ?? '';
    if (target === 'EXP' && hasXpMultiplier) {
      return xpMultiplierValue;
    }
    if ((target === 'COIN' || target === 'COINS') && hasCoinMultiplier) {
      return coinMultiplierValue;
    }
    return 1;
  };

  const formatRewardValue = (reward: RewardDetail) => {
    const multiplier = getRewardMultiplier(reward);
    const multipliedValue = Math.round((reward.rewardItem ?? 0) * multiplier);
    return `+${multipliedValue} ${reward.rewardTarget}`;
  };

  const normalizedExercises = useMemo(
    () => exercises.filter((item) => (item.rewards || []).length > 0),
    [exercises]
  );

  const sortedExercises = useMemo(() => {
    const baseList = normalizedExercises.map((exercise, index) => ({
      data: exercise,
      originalIndex: index,
    }));

    const getStatusPriority = (status?: string) => {
      const normalized = (status || '').toUpperCase();
      switch (normalized) {
        case ExerciseAttemptStatus.COMPLETED:
          return 0;
        case ExerciseAttemptStatus.IN_PROGRESS:
          return 1;
        default:
          return 2;
      }
    };

    return baseList
      .sort((a, b) => {
        const priorityDiff =
          getStatusPriority(a.data.status) - getStatusPriority(b.data.status);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return a.originalIndex - b.originalIndex;
      })
      .map((item) => item.data);
  }, [normalizedExercises]);

  if (sortedExercises.length === 0) {
    return null;
  }

  const totalSteps = sortedExercises.length;
  const completedSteps = sortedExercises.filter(
    (item) =>
      (item.status || "").toUpperCase() === ExerciseAttemptStatus.COMPLETED
  ).length;

  const currentStep =
    totalSteps <= 1
      ? (completedSteps === totalSteps ? totalSteps : 1)
      : Math.min(completedSteps + 1, totalSteps);

  // --- LOGIC TÍNH TOÁN MỚI ---
  // Để thanh bar dừng đúng tâm các mốc quà khi dùng layout justify-between:
  const validTotalSteps = Math.max(totalSteps, 2); // Đảm bảo mẫu số không bị 0
  const progressRaw = Math.max(0, currentStep - 1) / (validTotalSteps - 1);
  const completionPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  const startRadius =
    getNodeSize(sortedExercises[0]?.isBigReward) / 2 || SMALL_NODE_SIZE / 2;
  const endRadius =
    getNodeSize(
      sortedExercises[sortedExercises.length - 1]?.isBigReward
    ) /
      2 || SMALL_NODE_SIZE / 2;
  const trackLeftOffset = TRACK_HORIZONTAL_PADDING + startRadius;
  const trackRightOffset = TRACK_HORIZONTAL_PADDING + endRadius;
  const activeWidth = trackWidth * progressRaw;

  const handleRewardPress = (
    reward: RewardMilestone,
    event?: GestureResponderEvent
  ) => {
    event?.stopPropagation();
    if (selectedReward?.id === reward.id) {
      setSelectedReward(null);
    } else {
      setSelectedReward(reward);
    }
  };

  return (
    <Pressable
      className="w-full rounded-3xl border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        padding: 20,}}
      onPress={handleOutsidePress}
    >
      <View className="mb-12 mt-2 flex-row justify-between items-end">
        <View>
            <Text className="text-slate-900 font-bold text-xl mb-1">
              {t('reward_progress.title')}
            </Text>
            <Text className="text-slate-500 text-sm font-medium">
              <Trans
                i18nKey="reward_progress.completed_lessons"
                values={{ completed: completedSteps, total: totalSteps }}
                components={{ highlight: <Text className="text-amber-500 font-bold" /> }}
              />
            </Text>
        </View>
        <View className="items-end gap-2">
          <View
            className="px-3 py-1 rounded-full border"
            style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
          >
              {/* Hiển thị phần trăm thực tế của tiến trình học tập, không phải độ dài thanh bar */}
              <Text className="text-slate-900 text-xs font-bold">{completionPercent}%</Text>
          </View>
          {(hasXpMultiplier || hasCoinMultiplier) && (
            <View className="flex-row items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <MaterialCommunityIcons name="crown" size={14} color="#B45309" />
              <Text className="text-amber-700 text-[11px] font-semibold">
                {hasXpMultiplier && hasCoinMultiplier
                  ? t('reward_progress.premium_badge.both')
                  : hasXpMultiplier
                    ? t('reward_progress.premium_badge.xp')
                    : t('reward_progress.premium_badge.coin')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Container của thanh tiến độ */}
      <View className="h-28 justify-center relative mb-4">
        
        {/* Thanh nền (Background Track) */}
        <View
          className="absolute h-4 rounded-full top-1/2 -mt-2 z-0"
          style={{
            backgroundColor: '#E2E8F0',
            borderColor: '#CBD5F5',
            borderWidth: 1,
            left: trackLeftOffset,
            right: trackRightOffset,
          }}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        />

        {/* Thanh tiến độ (Active Track) - Màu vàng */}
        <View
          className="absolute h-4 rounded-full top-1/2 -mt-2 z-0"
          style={{
            backgroundColor: '#FACC15',left: trackLeftOffset,
            width: activeWidth,
          }}
        />

        {/* Các mốc quà (Nodes) */}
        <View
          className="absolute top-0 left-0 right-0 h-full flex-row justify-between items-center z-10"
          style={{ paddingHorizontal: TRACK_HORIZONTAL_PADDING }}
        >
          {sortedExercises.map((reward, index) => {
            const rewardDetails = reward.rewards ?? [];
            const rewardStep = index + 1;
            const normalizedStatus = (reward.status || "").toUpperCase();
            const isClaimed = normalizedStatus === ExerciseAttemptStatus.COMPLETED;
            const isCurrentStep = rewardStep === currentStep;
            const isBig = reward.isBigReward;
            
            // Logic xử lý: Phần quà cuối (isBigReward) chỉ được nhận khi status là COMPLETED
            // Status đã được set đúng ở lesson-details, nên chỉ cần check isClaimed
            const isAvailable = isBig
              ? isClaimed
              : !isClaimed &&
                (normalizedStatus === ExerciseAttemptStatus.IN_PROGRESS ||
                  (completedSteps >= rewardStep - 1 && isCurrentStep));
            const isLocked = !isClaimed && !isAvailable;
            const isReached = isBig ? isClaimed : (isClaimed || isCurrentStep);
            const isSelected = selectedReward?.id === reward.id;
            const primaryDetail = rewardDetails[0];
            const rewardTitle =
              reward.name ??
              primaryDetail?.name ??
              t('reward_progress.milestone_label', { step: rewardStep });

            return (
              <View key={reward.id} className="relative items-center justify-center z-20">
                
                {/* Tooltip */}
                {isSelected && (
                  <View className={clsx(
                      "absolute w-36 bg-white p-3 rounded-xl items-center z-50 shadow-xl",
                      isBig ? "bottom-24" : "bottom-16"
                  )}>
                    <View className="flex-row items-center gap-1 mb-1">
                        <MaterialCommunityIcons 
                            name={isBig ? "crown" : "gift"} 
                            size={16} 
                            color="#EAB308" 
                        />
                        <Text className="text-slate-900 font-bold text-xs flex-1 flex-wrap text-center">
                            {rewardTitle}
                        </Text>
                    </View>
                    <View className="w-full gap-2 mb-3">
                      {rewardDetails.map((detail) => (
                        <View
                          key={detail.id}
                          className="w-full items-center bg-slate-100 rounded-lg px-2 py-1.5"
                        >
                          <Text className="text-slate-900 text-[11px] font-bold">
                            {formatRewardValue(detail)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {isClaimed ? (
                      <Text className="text-green-600 text-[10px] font-bold bg-green-100 px-2 py-1 rounded-full">
                        {t('reward_progress.status.claimed')}
                      </Text>
                    ) : (
                      <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                        <MaterialCommunityIcons name="lock" size={10} color="#64748B" />
                        <Text className="text-slate-500 text-[10px] font-medium">
                          {t('reward_progress.status.locked')}
                        </Text>
                      </View>
                    )}

                    <View className="absolute -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                  </View>
                )}

                {/* Nút Icon Quà */}
                <TouchableOpacity
                  onPress={(event) => handleRewardPress(reward, event)}
                  activeOpacity={0.9}
                  className={clsx(
                    "items-center justify-center shadow-lg transition-transform",
                    isBig ? "w-20 h-20 rounded-3xl rotate-3" : "w-12 h-12 rounded-full",
                    isBig ? "border-[6px]" : "border-4",
                    isReached
                      ? isBig
                        ? "bg-amber-400 border-white shadow-amber-400/50"
                        : isClaimed
                          ? "bg-white border-emerald-200"
                          : "bg-white border-amber-300"
                      : "bg-slate-100 border-slate-200",
                    isSelected && "scale-110 bg-white border-amber-300"
                  )}
                  style={undefined}
                >
                  {isLocked ? (
                    <MaterialCommunityIcons 
                        name="gift" // Icon hộp quà đóng khi chưa mở
                        size={isBig ? 36 : 20} 
                        color="#475569" 
                        style={{ opacity: 0.5 }}
                    />
                  ) : (
                    <MaterialCommunityIcons 
                        name={getRewardIcon(primaryDetail?.rewardTarget, primaryDetail?.rewardType)} 
                        size={isBig ? 42 : 22} 
                        color={
                            isSelected 
                                ? "#FACC15" 
                                : (isBig ? "#FFFFFF" : (isClaimed ? "#94A3B8" : "#FACC15"))
                        } 
                    />
                  )}
                  
                  {isBig && isReached && !isClaimed && (
                    <View className="absolute -top-2 -right-2">
                        <MaterialCommunityIcons name="star-four-points" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Badge checkmark */}
                {isClaimed && (
                  <View className={clsx(
                      "absolute items-center justify-center border-2 shadow-sm z-30",
                      isBig ? "-bottom-2 -right-2 w-8 h-8 rounded-xl" : "-bottom-1 -right-1 w-5 h-5 rounded-full"
                  )}
                  style={{ backgroundColor: '#10B981', borderColor: '#FFFFFF' }}
                  >
                    <Ionicons name="checkmark" size={isBig ? 20 : 12} color="white" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <Text className="text-slate-500 text-xs text-center italic mt-4">
        <Trans
          i18nKey="reward_progress.footer_message"
          values={{ total: totalSteps }}
          components={{ highlight: <Text className="text-slate-900 font-bold" /> }}
        />
      </Text>
    </Pressable>
  );
};