"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import DailyQuestList from "./DailyQuestList";

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

interface DailyQuestModalProps {
    visible: boolean;
    onClose: () => void;
    requests: DailyRequestItem[];
}

export default function DailyQuestModal({ visible, onClose, requests }: DailyQuestModalProps) {
    const { t } = useTranslation();

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const renderTypeBadge = (type: string, isStreak: boolean) => {
        return (
            <View className={`px-2.5 py-1 rounded-full border ${isStreak ? "bg-amber-100 border-amber-500" : "bg-sky-100 border-sky-400"}`}>
                <Text className="text-[11px] text-slate-900 font-semibold">
                    {isStreak ? t("daily_quests.streak") : t("daily_quests.daily")} {" • "} {type}
                </Text>
            </View>
        );
    };



    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View style={{ opacity: fadeAnim }} className="flex-1 bg-black/60 justify-center items-center">
                <Animated.View style={{ transform: [{ scale: scaleAnim }], width: modalWidth, maxHeight: height * 0.85 }} className="bg-white rounded-3xl p-4 shadow-xl">
                    <View>
                        <View className="flex-row justify-end items-center">
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity accessibilityRole="button" onPress={onClose} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center">
                                <Text className="text-2xl font-bold text-slate-900 leading-none">×</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="items-center mb-2">
                            <Text className="text-xl font-extrabold text-slate-900 text-center mb-1 tracking-tight">{t("daily_quests.title", "Nhiệm vụ hàng ngày")}</Text>
                            <Text className="text-xs text-slate-500 text-center">{t("daily_quests.subtitle", "Hoàn thành nhiệm vụ để nhận thưởng")}</Text>
                        </View>
                    </View>

                    <DailyQuestList requests={requests} />

                    <View className="mt-2">
                        <View className="h-11 rounded-xl items-center justify-center bg-slate-100">
                            <Text onPress={onClose} className="text-slate-900 font-bold text-sm">{t("daily_quests.close", "Đóng")}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const { width, height } = Dimensions.get("window");
const modalWidth = Math.min(width * 0.92, 420);

// Tailwind via NativeWind is used for styling above; minimal inline styles are kept for exact width/height.


