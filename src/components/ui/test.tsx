import { ExerciseAttemptStatus } from '@constants/exercise.enum';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import React, { useMemo, useState } from 'react';
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
  const [selectedReward, setSelectedReward] = useState<RewardMilestone | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
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

  const formatRewardValue = (reward: RewardDetail) =>
    `+${reward.rewardItem} ${reward.rewardTarget}`;

  const normalizedExercises = useMemo(
    () => exercises.filter((item) => (item.rewards || []).length > 0),
    [exercises]
  );

  if (normalizedExercises.length === 0) {
    return null;
  }

  const totalSteps = normalizedExercises.length;
  const completedSteps = normalizedExercises.filter(
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
    getNodeSize(normalizedExercises[0]?.isBigReward) / 2 || SMALL_NODE_SIZE / 2;
  const endRadius =
    getNodeSize(
      normalizedExercises[normalizedExercises.length - 1]?.isBigReward
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
      className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800"
      onPress={handleOutsidePress}
    >
      <View className="mb-12 mt-2 flex-row justify-between items-end">
        <View>
            <Text className="text-white font-bold text-xl mb-1">Tiến độ bài học</Text>
            <Text className="text-slate-400 text-sm font-medium">
            Đã hoàn thành <Text className="text-yellow-400 font-bold">{completedSteps}</Text> / {totalSteps} bài
            </Text>
        </View>
        <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {/* Hiển thị phần trăm thực tế của tiến trình học tập, không phải độ dài thanh bar */}
            <Text className="text-slate-300 text-xs font-bold">{completionPercent}%</Text>
        </View>
      </View>

      {/* Container của thanh tiến độ */}
      <View className="h-28 justify-center relative mb-4">
        
        {/* Thanh nền (Background Track) */}
        <View
          className="absolute h-4 bg-slate-800 rounded-full top-1/2 -mt-2 z-0 border border-slate-700"
          style={{
            left: trackLeftOffset,
            right: trackRightOffset,
          }}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        />

        {/* Thanh tiến độ (Active Track) - Màu vàng */}
        <View
          className="absolute h-4 bg-yellow-500 rounded-full top-1/2 -mt-2 z-0 shadow-sm shadow-yellow-500"
          style={{
            left: trackLeftOffset,
            width: activeWidth,
          }}
        />

        {/* Các mốc quà (Nodes) */}
        <View
          className="absolute top-0 left-0 right-0 h-full flex-row justify-between items-center z-10"
          style={{ paddingHorizontal: TRACK_HORIZONTAL_PADDING }}
        >
          {normalizedExercises.map((reward, index) => {
            const rewardDetails = reward.rewards ?? [];
            const rewardStep = index + 1;
            const normalizedStatus = (reward.status || "").toUpperCase();
            const isClaimed = normalizedStatus === ExerciseAttemptStatus.COMPLETED;
            const isCurrentStep = rewardStep === currentStep;
            const isAvailable =
              !isClaimed &&
              (normalizedStatus === ExerciseAttemptStatus.IN_PROGRESS ||
                (completedSteps >= rewardStep - 1 && isCurrentStep));
            const isLocked = !isClaimed && !isAvailable;
            const isReached = isClaimed || isCurrentStep;
            const isSelected = selectedReward?.id === reward.id;
            const isBig = reward.isBigReward;
            const primaryDetail = rewardDetails[0];
            const rewardTitle =
              reward.name ?? primaryDetail?.name ?? `Mốc ${rewardStep}`;

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
                        Đã nhận tự động
                      </Text>
                    ) : isAvailable ? (
                      <Text className="text-amber-600 text-[10px] font-bold bg-amber-100 px-2 py-1 rounded-full">
                        Hoàn thành bài tập để nhận
                      </Text>
                    ) : (
                      <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                        <MaterialCommunityIcons name="lock" size={10} color="#64748B" />
                        <Text className="text-slate-500 text-[10px] font-medium">Chưa mở</Text>
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
                    // Kích thước & Border radius - Mốc cuối to hơn hẳn
                    isBig ? "w-20 h-20 rounded-3xl rotate-3" : "w-12 h-12 rounded-full",
                    
                    isBig ? "border-[6px]" : "border-4",

                    isReached 
                        ? (isBig 
                            ? "bg-yellow-500 border-white shadow-yellow-500/50" 
                            : (isClaimed ? "bg-slate-800 border-yellow-500/50" : "bg-slate-800 border-yellow-400"))
                        : "bg-slate-800 border-slate-600",
                    
                    isSelected && "scale-110 bg-white border-yellow-500"
                  )}
                  style={isBig && isReached && !isClaimed ? {
                    shadowColor: '#EAB308',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 15,
                    elevation: 10
                  } : undefined}
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
                                ? "#EAB308" 
                                : (isBig ? "#FFFFFF" : (isClaimed ? "#9CA3AF" : "#FACC15"))
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
                      "absolute bg-green-500 items-center justify-center border-2 border-slate-900 shadow-sm z-30",
                      isBig ? "-bottom-2 -right-2 w-8 h-8 rounded-xl" : "-bottom-1 -right-1 w-5 h-5 rounded-full"
                  )}>
                    <Ionicons name="checkmark" size={isBig ? 20 : 12} color="white" />
                  </View>
                )}

                 {/* Dấu hỏi đè lên icon khi bị khóa */}
                 {isLocked && (
                    <View className="absolute">
                         <Text className={clsx("font-bold text-slate-500", isBig ? "text-xl" : "text-xs")}>?</Text>
                    </View>
                 )}
              </View>
            );
          })}
        </View>
      </View>

      <Text className="text-slate-500 text-xs text-center italic mt-4">
        Hoàn thành <Text className="text-white font-bold">{totalSteps}</Text> bài học để mở khóa Rương Báu
      </Text>
    </Pressable>
  );
};