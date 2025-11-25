import {
  REWARD_HISTORY_COLORS,
  REWARD_HISTORY_SHADOW_STYLES,
} from "@constants/reward-history.constants";
import { LinearGradient } from "expo-linear-gradient";
import { TFunction } from "i18next";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatisticsCardProps {
  totalRewards: number;
  totalExp: number;
  t: TFunction;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = React.memo(({
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
            style={{ backgroundColor: REWARD_HISTORY_COLORS.PRIMARY }}
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
});

StatisticsCard.displayName = "StatisticsCard";

const styles = StyleSheet.create({
  statsCard: REWARD_HISTORY_SHADOW_STYLES.statsCard,
});

