import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export type RankRule = {
    name: string;
    min: number;
    max?: number | null;
};

type ModalRankProps = {
    visible: boolean;
    onClose: () => void;
    rankRules: RankRule[];
    rankName: string;
    eloScore: number;
};

export default function ModalRank({ visible, onClose, rankRules, rankName, eloScore }: ModalRankProps) {
    const { t } = useTranslation();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-[rgba(2,6,23,0.7)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-[rgba(15,23,42,0.95)] rounded-3xl p-5 border border-[rgba(148,163,184,0.2)]">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-slate-100">
                            {t("battle.rank_modal.title")}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-[rgba(148,163,184,0.15)] items-center justify-center" activeOpacity={0.7}>
                            <Text className="-mt-[2px] text-[22px] text-[#cbd5f5] font-semibold">×</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="mt-3 text-[13px] leading-[18px] text-slate-400">
                        <Trans
                            i18nKey="battle.rank_modal.description"
                            values={{ eloScore }}
                            components={{ highlight: <Text className="text-[#38bdf8] font-bold" /> }}
                        />
                    </Text>

                    {rankRules.length > 0 ? (
                        <ScrollView
                            style={{ marginTop: 16 }}
                            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {rankRules.map((rule) => {
                                const isCurrent = rule.name === rankName;
                                const rangeText =
                                    rule.max && rule.max > rule.min
                                        ? t("battle.rank_modal.range_between", { min: rule.min, max: rule.max })
                                        : t("battle.rank_modal.range_min", { min: rule.min });
                                return (
                                    <View
                                        key={rule.name}
                                        className={`rounded-xl border px-4 py-3 ${isCurrent ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-white/5"}`}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <Text className={`text-base font-bold text-slate-200 ${isCurrent ? "text-[#38bdf8]" : ""}`}>
                                                {rule.name}
                                            </Text>
                                            <Text className="text-[13px] font-semibold text-[#cbd5f5]">{rangeText}</Text>
                                        </View>
                                        {isCurrent && (
                                            <Text className="mt-2 text-xs font-semibold text-[#38bdf8]">
                                                {t("battle.rank_modal.current_badge")}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View className="mt-5 py-6 items-center justify-center rounded-2xl bg-[rgba(148,163,184,0.08)]">
                            <Text className="text-[13px] text-[#cbd5f5]">
                                {t("battle.rank_modal.empty_state")}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
