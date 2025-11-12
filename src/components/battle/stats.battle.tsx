import { ThemedText } from "@components/ThemedText";
import { useUserStatsSeason } from "@hooks/useSeason";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

export default function StatsBattle() {
    const { t } = useTranslation();
    const { data, isLoading } = useUserStatsSeason();

    if (isLoading) {
        return (
            <View className="px-5 mt-4">
                <View className="flex-row gap-3">
                    {[1, 2, 3].map((i) => (
                        <View key={i} className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3 items-center justify-center">
                            <ActivityIndicator size="small" color="#22d3ee" />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    const totalWins = data?.totalWins || 0;
    const totalMatches = data?.totalMatches || 0;
    const rateWin = data?.rateWin || 0;
    const currentWinStreak = data?.currentWinStreak || 0;

    return (
        <View className="px-5 mt-4">
            <View className="flex-row gap-3">
                {/* Trận thắng */}
                <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
                    <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{t("battle.stats.total_wins")}</ThemedText>
                    <View className="flex-row items-end gap-1">
                        <ThemedText style={{ color: "#22d3ee", fontSize: 22, fontWeight: "700" }}>{totalWins}</ThemedText>
                        <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>/ {totalMatches}</ThemedText>
                    </View>
                </View>

                {/* Tỷ lệ thắng */}
                <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
                    <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{t("battle.stats.win_rate")}</ThemedText>
                    <View className="flex-row items-end gap-1">
                        <ThemedText style={{ color: "#34d399", fontSize: 22, fontWeight: "700" }}>{Math.round(rateWin)}</ThemedText>
                        <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>%</ThemedText>
                    </View>
                </View>

                {/* Chuỗi thắng */}
                <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
                    <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{t("battle.stats.win_streak")}</ThemedText>
                    <View className="flex-row items-end gap-1">
                        <ThemedText style={{ color: "#fbbf24", fontSize: 22, fontWeight: "700" }}>{currentWinStreak}</ThemedText>
                        <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>🔥</ThemedText>
                    </View>
                </View>
            </View>
        </View>
    );
}

