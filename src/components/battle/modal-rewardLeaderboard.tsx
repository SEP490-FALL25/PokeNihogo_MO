import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
// Import Tabs
import { useLeaderboardSeasonNow } from "@hooks/useLeaderboard";
import { ILeaderboardSeasonNowEntity } from "@models/leaderboard/leaderboard.entity";
import { IRewardEntity } from "@models/reward/reward.entity";
import { Crown, Gift, Sparkles } from "lucide-react-native";
// Thêm useState
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, ScrollView, View } from "react-native";

interface ModalRewardLeaderboardProps {
    visible: boolean;
    onRequestClose: () => void;
}

export default function ModalRewardLeaderboard({ visible, onRequestClose }: ModalRewardLeaderboardProps) {
    const { t } = useTranslation();
    const { data, isLoading } = useLeaderboardSeasonNow();

    const groupedByRank = useMemo(() => {
        if (!data?.seasonRankRewards) return {};
        type RankRewardType = ILeaderboardSeasonNowEntity["seasonRankRewards"][0];
        const grouped: Record<string, RankRewardType[]> = {};
        data.seasonRankRewards.forEach((rankReward: RankRewardType) => {
            if (!grouped[rankReward.rankName]) {
                grouped[rankReward.rankName] = [];
            }
            grouped[rankReward.rankName].push(rankReward);
        });
        Object.keys(grouped).forEach((rankName) => {
            grouped[rankName].sort((a: RankRewardType, b: RankRewardType) => {
                if (a.order === null || a.order === undefined) return 1;
                if (b.order === null || b.order === undefined) return -1;
                return a.order - b.order;
            });
        });
        return grouped;
    }, [data]);

    // Get sorted rank names 
    const sortedRankNames = useMemo(() => {
        const rankOrder = ["N1", "N2", "N3", "N4", "N5"];
        const rankNames = Object.keys(groupedByRank);
        return rankNames.sort((a, b) => {
            const indexA = rankOrder.indexOf(a);
            const indexB = rankOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [groupedByRank]);

    // Dùng useState 
    const [activeRank, setActiveRank] = useState<string | null>(
        sortedRankNames.length > 0 ? sortedRankNames[sortedRankNames.length - 1] : null
    );

    // Cập nhật activeRank khi data load xong 
    React.useEffect(() => {
        if (!activeRank && sortedRankNames.length > 0) {
            setActiveRank(sortedRankNames[sortedRankNames.length - 1]);
        }
    }, [sortedRankNames, activeRank]);

    const getRankLabelByOrder = (order: number | null | undefined): string => {
        if (order === null || order === undefined) {
            return t("battle.rewards.ranks.remaining");
        }
        return t("battle.rewards.ranks.rank_number", { order });
    };

    const getRewardTypeLabel = (rewardType: string) => {
        const typeMap: Record<string, string> = {
            POKEMON: t("battle.rewards.types.pokemon"),
            GEM: t("battle.rewards.types.gem"),
            COIN: t("battle.rewards.types.coin"),
            ITEM: t("battle.rewards.types.item"),
            SKIN: t("battle.rewards.types.skin"),
            BADGE: t("battle.rewards.types.badge"),
            DAILY_REQUEST: t("battle.rewards.types.daily_request"),
        };
        return typeMap[rewardType] || rewardType;
    };

    const getRewardTargetLabel = (rewardTarget: string) => {
        const targetMap: Record<string, string> = {
            EXP: t("battle.rewards.targets.exp"),
            POINT: t("battle.rewards.targets.point"),
            LEVEL: t("battle.rewards.targets.level"),
        };
        return targetMap[rewardTarget] || rewardTarget;
    };

    // Lấy data cho tab đang active
    const activeRankEntries = useMemo(() => {
        if (!activeRank || !groupedByRank[activeRank]) return [];
        return groupedByRank[activeRank];
    }, [activeRank, groupedByRank]);

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onRequestClose}>
            <View className="flex-1 bg-[rgba(0,0,0,0.8)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-slate-900 rounded-3xl border border-white/10 flex-1" style={{ minHeight: 400, maxHeight: "85%" }}>

                    <View className="px-6 py-5 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <Crown size={24} color="#fbbf24" />
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                    {t("battle.rewards.title")}
                                </ThemedText>
                            </View>
                            <HapticPressable
                                className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                onPress={onRequestClose}
                            >
                                <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                            </HapticPressable>
                        </View>
                        {data && (
                            <ThemedText style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
                                {t("battle.rewards.subtitle", { season: data.nameTranslation })}
                            </ThemedText>
                        )}
                    </View>

                    {isLoading ? (
                        <View className="py-20 items-center justify-center" style={{ minHeight: 300 }}>
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <ThemedText style={{ color: "#94a3b8", fontSize: 14, marginTop: 12 }}>
                                {t("battle.rewards.loading")}
                            </ThemedText>
                        </View>
                    ) : !data || sortedRankNames.length === 0 ? (
                        <View className="py-20 items-center justify-center px-6" style={{ minHeight: 300 }}>
                            <Sparkles size={48} color="#64748b" />
                            <ThemedText style={{ color: "#94a3b8", fontSize: 16, marginTop: 12, textAlign: "center" }}>
                                {t("battle.rewards.empty")}
                            </ThemedText>
                        </View>
                    ) : (
                        <View className="w-full flex-1">
                            <View className="flex-row px-6 pt-3 border-b border-white/10">
                                {sortedRankNames.map((rankName) => {
                                    const isActive = activeRank === rankName;
                                    return (
                                        <HapticPressable
                                            key={rankName}
                                            onPress={() => setActiveRank(rankName)}
                                            className={`
                                                pb-3 pt-1 px-4 
                                                border-b-2 
                                                ${isActive ? "border-cyan-400" : "border-transparent"}
                                            `}
                                        >
                                            <ThemedText
                                                style={{
                                                    fontSize: 16,
                                                    color: isActive ? "#22d3ee" : "#94a3b8",
                                                    fontWeight: isActive ? "800" : "500",
                                                }}
                                            >
                                                {rankName}
                                            </ThemedText>
                                        </HapticPressable>
                                    );
                                })}
                            </View>

                            <View className="flex-1">
                                {!activeRankEntries || activeRankEntries.length === 0 ? (
                                    <View className="py-20 items-center justify-center px-6 flex-1">
                                        <Sparkles size={48} color="#64748b" />
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 16, marginTop: 12, textAlign: "center" }}>
                                            {t("battle.rewards.empty_for_league")}
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <ScrollView
                                        key={activeRank}
                                        className="px-6 pt-4"
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {activeRankEntries.map((entry) => (
                                            <View key={entry.id} className="mb-5">
                                                <View className="flex-row items-center gap-2.5 mb-3">
                                                    <View className="w-1.5 h-5 bg-amber-400 rounded-full" />
                                                    <ThemedText style={{ color: "#fbbf24", fontSize: 18, fontWeight: "800" }}>
                                                        {getRankLabelByOrder(entry.order)}
                                                    </ThemedText>
                                                </View>

                                                <View className="gap-2">
                                                    {entry.rewards && entry.rewards.length > 0 ? (
                                                        entry.rewards.map((reward: IRewardEntity, idx: number) => (
                                                            <View
                                                                key={`${reward.id}-${idx}`}
                                                                className="flex-row items-center justify-between gap-3 p-3 pl-4 rounded-xl bg-white/5 border border-white/5"
                                                            >
                                                                {reward.nameTranslation ? (
                                                                    <View className="flex-1">
                                                                        <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600" }}>
                                                                            {reward.nameTranslation}
                                                                        </ThemedText>
                                                                        <View className="flex-row items-center gap-2 mt-1.5">
                                                                            {reward.rewardItem > 0 && (
                                                                                <ThemedText style={{ color: "#22d3ee", fontSize: 15, fontWeight: "700" }}>
                                                                                    ×{reward.rewardItem}
                                                                                </ThemedText>
                                                                            )}
                                                                            {reward.rewardTarget && (
                                                                                <View className="px-2 py-0.5 rounded-full bg-amber-500/20">
                                                                                    <ThemedText style={{ color: "#fbbf24", fontSize: 11, fontWeight: "600" }}>
                                                                                        {getRewardTargetLabel(reward.rewardTarget)}
                                                                                    </ThemedText>
                                                                                </View>
                                                                            )}
                                                                        </View>
                                                                    </View>
                                                                ) : (
                                                                    <View className="flex-1 flex-row items-center gap-2">
                                                                        {reward.rewardItem > 0 && (
                                                                            <ThemedText style={{ color: "#22d3ee", fontSize: 15, fontWeight: "700" }}>
                                                                                ×{reward.rewardItem}
                                                                            </ThemedText>
                                                                        )}
                                                                        {reward.rewardTarget && (
                                                                            <View className="px-2 py-0.5 rounded-full bg-amber-500/20">
                                                                                <ThemedText style={{ color: "#fbbf24", fontSize: 11, fontWeight: "600" }}>
                                                                                    {getRewardTargetLabel(reward.rewardTarget)}
                                                                                </ThemedText>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ))
                                                    ) : (
                                                        <View className="py-4 items-center rounded-xl bg-white/5 border border-white/5">
                                                            <Gift size={24} color="#64748b" />
                                                            <ThemedText style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
                                                                {t("battle.rewards.no_rewards_for_rank")}
                                                            </ThemedText>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}