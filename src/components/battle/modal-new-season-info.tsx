import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { Crown } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";

interface NewSeasonInfo {
    seasonId: number;
    startDate: string;
    endDate: string;
    nameTranslation: string;
    newElo: number;
    newRank: string;
}

interface ModalNewSeasonInfoProps {
    visible: boolean;
    onRequestClose: () => void;
    data: NewSeasonInfo | null;
}

export default function ModalNewSeasonInfo({ 
    visible, 
    onRequestClose, 
    data 
}: ModalNewSeasonInfoProps) {
    const { t } = useTranslation();

    if (!data) return null;

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onRequestClose}>
            <View className="flex-1 bg-[rgba(0,0,0,0.9)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-slate-900 rounded-3xl border border-white/10">
                    {/* Header */}
                    <View className="px-6 py-5 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <Crown size={24} color="#22d3ee" />
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                    {t("battle.new_season.title") || "Mùa giải mới"}
                                </ThemedText>
                            </View>
                            <HapticPressable
                                className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                onPress={onRequestClose}
                            >
                                <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                            </HapticPressable>
                        </View>
                    </View>

                    {/* Content */}
                    <View className="px-6 py-6">
                        {/* Season Name */}
                        <View className="items-center mb-6">
                            <ThemedText style={{ color: "#22d3ee", fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 4 }}>
                                {data.nameTranslation}
                            </ThemedText>
                            <ThemedText style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                                {formatDate(data.startDate)} - {formatDate(data.endDate)}
                            </ThemedText>
                        </View>

                        {/* Rank and ELO */}
                        <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                            <View className="flex-row items-center justify-center gap-2 mb-2">
                                <Crown size={20} color="#fbbf24" />
                                <ThemedText style={{ color: "#fde68a", fontSize: 18, fontWeight: "700" }}>
                                    {data.newRank}
                                </ThemedText>
                            </View>
                            <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
                                {data.newElo} {t("battle.new_season.elo") || "ELO"}
                            </ThemedText>
                        </View>

                        <ThemedText style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginBottom: 4 }}>
                            {t("battle.new_season.message") || "Chúc bạn may mắn trong mùa giải mới!"}
                        </ThemedText>

                        {/* Close Button */}
                        <HapticPressable
                            className="rounded-2xl overflow-hidden mt-4"
                            onPress={onRequestClose}
                        >
                            <TWLinearGradient
                                colors={["#22c55e", "#16a34a"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ paddingVertical: 16 }}
                            >
                                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                    {t("common.close") || "Đóng"}
                                </ThemedText>
                            </TWLinearGradient>
                        </HapticPressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

