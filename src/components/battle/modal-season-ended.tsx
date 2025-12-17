import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { useClaimRewardSeason } from "@hooks/useBattle";
import { Crown, Gift, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, ScrollView, View } from "react-native";

interface Reward {
    id: number;
    nameKey?: string;
    rewardType: string;
    rewardItem: number;
    rewardTarget?: string;
    nameTranslation?: string;
}

interface SeasonEndedData {
    id: number;
    hasUnclaimedReward: boolean;
    season: {
        id: number;
        name: string;
        startDate: string;
        endDate: string;
    };
    finalRank: string;
    finalElo: number;
    rewards: Reward[];
}

interface ModalSeasonEndedProps {
    visible: boolean;
    onRequestClose: () => void;
    data: SeasonEndedData | null;
    onContinue: () => void;
    onClaimComplete: () => void;
}

type ModalStep = 'season_info' | 'rewards';

export default function ModalSeasonEnded({
    visible,
    onRequestClose,
    data,
    onContinue,
    onClaimComplete
}: ModalSeasonEndedProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<ModalStep>('season_info');
    const [isClaiming, setIsClaiming] = useState(false);
    const claimRewardMutation = useClaimRewardSeason();

    const getRewardTypeLabel = (rewardType: string) => {
        const typeMap: Record<string, string> = {
            POKEMON: t("battle.rewards.types.pokemon"),
            GEM: t("battle.rewards.types.gem"),
            COIN: t("battle.rewards.types.coin"),
            ITEM: t("battle.rewards.types.item"),
            SKIN: t("battle.rewards.types.skin"),
            BADGE: t("battle.rewards.types.badge"),
            DAILY_REQUEST: t("battle.rewards.types.daily_request"),
            EVENT: t("battle.rewards.types.event") || "Event",
            POKE_COINS: t("battle.rewards.types.coin") || "Coins",
        };
        return typeMap[rewardType] || rewardType;
    };

    const getRewardTargetLabel = (rewardTarget?: string) => {
        if (!rewardTarget) return "";
        const targetMap: Record<string, string> = {
            EXP: t("battle.rewards.targets.exp"),
            POINT: t("battle.rewards.targets.point"),
            LEVEL: t("battle.rewards.targets.level"),
        };
        return targetMap[rewardTarget] || rewardTarget;
    };

    const handleContinue = () => {
        if (step === 'season_info') {
            // Show rewards
            if (data?.rewards && data.rewards.length > 0) {
                setStep('rewards');
            } else {
                // No rewards, trigger claim complete to join new season
                onClaimComplete();
            }
        }
    };

    const handleClaim = async () => {
        if (!data?.id || isClaiming) return;

        setIsClaiming(true);
        try {
            // Only call claimRewardSeason if there are rewards and hasUnclaimedReward is true
            if (data.hasUnclaimedReward && data.rewards && data.rewards.length > 0) {
                await claimRewardMutation.mutateAsync(data.id);
            }
            // Always call onClaimComplete to proceed to join new season
            onClaimComplete();
        } catch (error: any) {
            console.error("Failed to claim reward:", error);
            // Still proceed to join new season even if claim fails
            onClaimComplete();
        } finally {
            setIsClaiming(false);
        }
    };

    const handleClose = () => {
        setStep('season_info');
        onRequestClose();
    };

    if (!data) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
            <View className="flex-1 bg-[rgba(0,0,0,0.9)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-slate-900 rounded-3xl border border-white/10">
                    {step === 'season_info' ? (
                        <>
                            {/* Header */}
                            <View className="px-6 py-5 border-b border-white/10">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        <Crown size={24} color="#fbbf24" />
                                        <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                            {t("battle.season_ended.title") || "Mùa giải đã kết thúc"}
                                        </ThemedText>
                                    </View>
                                    <HapticPressable
                                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                        onPress={handleClose}
                                    >
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                                    </HapticPressable>
                                </View>
                            </View>

                            {/* Content */}
                            <View className="px-6 py-6">
                                <View className="items-center mb-6">
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 16, textAlign: "center", marginBottom: 4 }}>
                                        {data.season.name}
                                    </ThemedText>
                                    <ThemedText style={{ color: "#64748b", fontSize: 13, textAlign: "center" }}>
                                        {t("battle.season_ended.ended_message") || "Mùa giải đã kết thúc"}
                                    </ThemedText>
                                </View>

                                {/* Rank and ELO */}
                                <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                                    <View className="flex-row items-center justify-center gap-2 mb-2">
                                        <Crown size={20} color="#fbbf24" />
                                        <ThemedText style={{ color: "#fde68a", fontSize: 18, fontWeight: "700" }}>
                                            {data.finalRank}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
                                        {data.finalElo} {t("battle.season_ended.elo") || "ELO"}
                                    </ThemedText>
                                </View>

                                {/* Continue Button */}
                                <HapticPressable
                                    className="rounded-2xl overflow-hidden mt-4"
                                    onPress={handleContinue}
                                >
                                    <TWLinearGradient
                                        colors={["#22c55e", "#16a34a"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ paddingVertical: 16 }}
                                    >
                                        <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                            {t("battle.season_ended.continue") || "Tiếp tục"}
                                        </ThemedText>
                                    </TWLinearGradient>
                                </HapticPressable>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Rewards Header */}
                            <View className="px-6 py-5 border-b border-white/10">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        <Gift size={24} color="#fbbf24" />
                                        <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                            {t("battle.season_ended.rewards_title") || "Phần thưởng mùa giải"}
                                        </ThemedText>
                                    </View>
                                    <HapticPressable
                                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                        onPress={handleClose}
                                    >
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                                    </HapticPressable>
                                </View>
                            </View>

                            {/* Rewards Content */}
                            <View className="max-h-[500px]">
                                {data.rewards && data.rewards.length > 0 ? (
                                    <ScrollView
                                        className="px-6 pt-4"
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {data.rewards.map((reward, idx) => (
                                            <View
                                                key={`${reward.id}-${idx}`}
                                                className="flex-row items-center gap-3 p-4 mb-3 rounded-xl bg-white/5 border border-white/10"
                                            >
                                                <View className="flex-1">
                                                    <ThemedText style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600" }}>
                                                        {reward.nameTranslation || reward.nameKey || getRewardTypeLabel(reward.rewardType)}
                                                    </ThemedText>
                                                    <View className="flex-row items-center gap-2 mt-1">
                                                        <ThemedText style={{ color: "#94a3b8", fontSize: 13 }}>
                                                            {getRewardTypeLabel(reward.rewardType)}
                                                        </ThemedText>
                                                        {reward.rewardItem > 0 && (
                                                            <ThemedText style={{ color: "#22d3ee", fontSize: 13, fontWeight: "600" }}>
                                                                ×{reward.rewardItem}
                                                            </ThemedText>
                                                        )}
                                                    </View>
                                                </View>
                                                {reward.rewardTarget && (
                                                    <View className="px-3 py-1.5 rounded-full bg-amber-500/20">
                                                        <ThemedText style={{ color: "#fbbf24", fontSize: 11, fontWeight: "600" }}>
                                                            {getRewardTargetLabel(reward.rewardTarget)}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View className="py-20 items-center justify-center px-6">
                                        <Sparkles size={48} color="#64748b" />
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 16, marginTop: 12, textAlign: "center" }}>
                                            {t("battle.rewards.empty")}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {/* Claim Button */}
                            <View className="px-6 py-5 border-t border-white/10">
                                <HapticPressable
                                    className="rounded-2xl overflow-hidden"
                                    onPress={handleClaim}
                                    disabled={isClaiming || claimRewardMutation.isPending}
                                >
                                    <TWLinearGradient
                                        colors={isClaiming || claimRewardMutation.isPending ? ["#64748b", "#374151"] : ["#22c55e", "#16a34a"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ paddingVertical: 16 }}
                                    >
                                        {isClaiming || claimRewardMutation.isPending ? (
                                            <View className="flex-row items-center justify-center gap-2">
                                                <ActivityIndicator size="small" color="#ffffff" />
                                                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
                                                    {t("battle.season_ended.claiming") || "Đang nhận..."}
                                                </ThemedText>
                                            </View>
                                        ) : (
                                            <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                                {t("battle.season_ended.claim") || "Nhận thưởng"}
                                            </ThemedText>
                                        )}
                                    </TWLinearGradient>
                                </HapticPressable>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

