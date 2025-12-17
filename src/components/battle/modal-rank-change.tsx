import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { RANK_CHANGE_STATUS } from "@constants/battle.enum";
import { ChevronsDown, ChevronsUp, Crown } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";

interface ModalRankChangeProps {
    visible: boolean;
    onRequestClose: () => void;
    status: RANK_CHANGE_STATUS | null;
    rankChangeInfo?: {
        from: { rank: string; elo: number };
        to: { rank: string; elo: number };
    } | null;
}

export default function ModalRankChange({
    visible,
    onRequestClose,
    status,
    rankChangeInfo
}: ModalRankChangeProps) {
    const { t } = useTranslation();

    if (!status || status === RANK_CHANGE_STATUS.RANK_MAINTAIN) return null;

    const isRankUp = status === RANK_CHANGE_STATUS.RANK_UP;
    const title = isRankUp ? t("battle.rank_change.up_title") || "THĂNG HẠNG!" : t("battle.rank_change.down_title") || "RỚT HẠNG";
    const message = isRankUp
        ? t("battle.rank_change.up_message", { rank: rankChangeInfo?.to?.rank }) || `Chúc mừng! Bạn đã thăng hạng lên ${rankChangeInfo?.to?.rank}`
        : t("battle.rank_change.down_message", { rank: rankChangeInfo?.to?.rank }) || `Tiếc quá! Bạn đã rớt xuống hạng ${rankChangeInfo?.to?.rank}`;

    const oldRank = rankChangeInfo?.from?.rank || "---";
    const newRank = rankChangeInfo?.to?.rank || "---";

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onRequestClose}>
            <View className="flex-1 bg-[rgba(0,0,0,0.9)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-slate-900 rounded-3xl border border-white/10 overflow-hidden">
                    <TWLinearGradient
                        colors={isRankUp ? ["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.05)"] : ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ padding: 24 }}
                    >
                        {/* Icon Header */}
                        <View className="items-center mb-6">
                            <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isRankUp ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                {isRankUp ? (
                                    <ChevronsUp size={48} color="#4ade80" />
                                ) : (
                                    <ChevronsDown size={48} color="#f87171" />
                                )}
                            </View>
                            <ThemedText style={{
                                color: isRankUp ? "#4ade80" : "#f87171",
                                fontSize: 28,
                                fontWeight: "900",
                                textAlign: "center",
                                textTransform: "uppercase",
                                letterSpacing: 1
                            }}>
                                {title}
                            </ThemedText>
                        </View>

                        {/* Rank Change Visual */}
                        <View className="flex-row items-center justify-center gap-6 mb-8">
                            <View className="items-center">
                                <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
                                    {t("battle.rank_change.old_rank") || "Hạng Cũ"}
                                </ThemedText>
                                <View className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                    <ThemedText style={{ color: "#cbd5e1", fontSize: 18, fontWeight: "700" }}>
                                        {oldRank}
                                    </ThemedText>
                                </View>
                            </View>

                            <View className="pt-4">
                                {isRankUp ? (
                                    <ChevronsUp size={24} color="#64748b" />
                                ) : (
                                    <ChevronsDown size={24} color="#64748b" />
                                )}
                            </View>

                            <View className="items-center">
                                <ThemedText style={{ color: isRankUp ? "#4ade80" : "#f87171", fontSize: 12, marginBottom: 4, fontWeight: "700" }}>
                                    {t("battle.rank_change.new_rank") || "Hạng Mới"}
                                </ThemedText>
                                <View className={`px-4 py-2 rounded-xl border ${isRankUp ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                    <View className="flex-row items-center gap-2">
                                        <Crown size={16} color={isRankUp ? "#4ade80" : "#f87171"} />
                                        <ThemedText style={{ color: isRankUp ? "#4ade80" : "#f87171", fontSize: 18, fontWeight: "700" }}>
                                            {newRank}
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Message */}
                        <ThemedText style={{ color: "#e5e7eb", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24, paddingHorizontal: 16 }}>
                            {message}
                        </ThemedText>

                        {/* Button */}
                        <HapticPressable
                            onPress={onRequestClose}
                            className="w-full"
                        >
                            <TWLinearGradient
                                colors={isRankUp ? ["#22c55e", "#16a34a"] : ["#ef4444", "#dc2626"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ paddingVertical: 14, borderRadius: 16, alignItems: "center" }}
                            >
                                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>
                                    {t("common.continue") || "Tiếp tục"}
                                </ThemedText>
                            </TWLinearGradient>
                        </HapticPressable>
                    </TWLinearGradient>
                </View>
            </View>
        </Modal>
    );
}
