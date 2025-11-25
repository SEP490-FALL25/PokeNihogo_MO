import { IRewardHistoryItem } from "@models/reward/reward.response";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TFunction } from "react-i18next";
import { REWARD_HISTORY_COLORS } from "@constants/reward-history.constants";
import {
  formatRewardDate,
  getRewardSourceTypeInfo,
} from "@utils/reward-history.utils";

interface RewardCardProps {
  item: IRewardHistoryItem;
  onPress?: () => void;
  t: TFunction;
}

export const RewardCard: React.FC<RewardCardProps> = React.memo(
  ({ item, t }) => {
    const sourceInfo = getRewardSourceTypeInfo(item.sourceType);
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
                {item.reward.name}
              </Text>
              <Text className="text-sm font-semibold text-slate-500 tracking-wide">
                {formatRewardDate(item.createdAt, t)}
              </Text>
            </View>

            {/* Amount Badge */}
            <View
              style={[
                styles.amountBadge,
                {
                  backgroundColor: isExpReward
                    ? REWARD_HISTORY_COLORS.EXP_REWARD_BG
                    : REWARD_HISTORY_COLORS.COIN_REWARD_BG,
                },
              ]}
              className="px-3 py-1.5 rounded-2xl"
            >
              <Text
                style={{
                  color: isExpReward
                    ? REWARD_HISTORY_COLORS.EXP_REWARD_TEXT
                    : REWARD_HISTORY_COLORS.COIN_REWARD_TEXT,
                }}
                className="text-lg font-extrabold"
              >
                +{item.amount.toLocaleString()}
              </Text>
              <Text
                style={{
                  color: isExpReward
                    ? REWARD_HISTORY_COLORS.EXP_REWARD_TEXT
                    : REWARD_HISTORY_COLORS.COIN_REWARD_TEXT,
                }}
                className="text-xs font-bold"
              >
                {item.rewardTargetSnapshot}
              </Text>
            </View>
          </View>

          {/* Card Body - Reward Details */}
          {/* <View className="pt-4 border-t border-slate-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.reward_type")}
                </Text>
                <Text className="text-sm font-bold text-slate-700">
                  {item.reward.name}
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
          </View> */}
        </LinearGradient>
      </View>
    );
  }
);

RewardCard.displayName = "RewardCard";

const styles = StyleSheet.create({
  card: {
    shadowColor: REWARD_HISTORY_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  amountBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
