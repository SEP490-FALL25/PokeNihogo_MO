"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";

interface DailyRequestItem {
    id: number;
    nameKey: string;
    descriptionKey: string;
    dailyRequestType: string;
    conditionValue: number;
    rewardId: number;
    isStreak: boolean;
    isActive: boolean;
    createdById: number;
    updatedById: number | null;
    deletedById: number | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    nameTranslation: string;
    descriptionTranslation: string;
}

interface DailyQuestListProps {
    requests: DailyRequestItem[];
}

export default function DailyQuestList({ requests }: DailyQuestListProps) {
    const { t } = useTranslation();

    const renderTypeBadge = (type: string, isStreak: boolean) => (
        <View className={`px-2.5 py-1 rounded-full border ${isStreak ? "bg-amber-100 border-amber-500" : "bg-sky-100 border-sky-400"}`}>
            <Text className="text-[11px] text-slate-900 font-semibold">
                {isStreak ? t("daily_quests.streak") : t("daily_quests.daily")} {" • "} {type}
            </Text>
        </View>
    );

    return (
        <FlatList
            data={requests}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item: req }) => (
                <View className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm mb-2">
                    <View className="flex-row justify-between items-center mb-1.5">
                        <Text numberOfLines={1} className="text-base font-bold text-slate-900 flex-1 mr-2">{req.nameTranslation}</Text>
                        {renderTypeBadge(req.dailyRequestType, req.isStreak)}
                    </View>
                    <Text numberOfLines={2} className="text-xs text-slate-600">{req.descriptionTranslation}</Text>
                    <View className="flex-row gap-1.5 mt-2">
                        <View className="px-2.5 py-1 rounded-full bg-blue-100">
                            <Text className="text-[11px] text-slate-900 font-semibold">{t("daily_quests.condition", { value: req.conditionValue })}</Text>
                        </View>
                        <View className="px-2.5 py-1 rounded-full bg-amber-100">
                            <Text className="text-[11px] text-slate-900 font-semibold">{t("daily_quests.reward", { id: req.rewardId })}</Text>
                        </View>
                    </View>
                </View>
            )}
            ListEmptyComponent={
                <View className="items-center justify-center py-6">
                    <Text className="text-sm font-bold text-slate-900 mb-1">{t("daily_quests.empty_title", "Không có nhiệm vụ")}</Text>
                    <Text className="text-xs text-slate-500">{t("daily_quests.empty_sub", "Hãy quay lại sau nhé!")}</Text>
                </View>
            }
        />
    );
}


