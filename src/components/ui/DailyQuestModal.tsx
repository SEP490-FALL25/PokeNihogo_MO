"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, View } from "react-native";

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
            <View style={[styles.badge, isStreak ? styles.badgeStreak : styles.badgeInfo]}>
                <Text style={styles.badgeText}>
                    {isStreak ? t("daily_quests.streak") : t("daily_quests.daily")}
                    {" • "}
                    {type}
                </Text>
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{t("daily_quests.title", "Nhiệm vụ hàng ngày")}</Text>
                            <Text style={styles.subtitle}>{t("daily_quests.subtitle", "Hoàn thành nhiệm vụ để nhận thưởng")}</Text>
                        </View>

                        <View style={styles.list}>
                            {requests.map((req) => (
                                <View key={req.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{req.nameTranslation}</Text>
                                        {renderTypeBadge(req.dailyRequestType, req.isStreak)}
                                    </View>
                                    <Text style={styles.cardDesc}>{req.descriptionTranslation}</Text>

                                    <View style={styles.metaRow}>
                                        <View style={[styles.metaPill, styles.metaBlue]}>
                                            <Text style={styles.metaText}>{t("daily_quests.condition", { value: req.conditionValue })}</Text>
                                        </View>
                                        <View style={[styles.metaPill, styles.metaAmber]}>
                                            <Text style={styles.metaText}>{t("daily_quests.reward", { id: req.rewardId })}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actions}>
                                        <View style={[styles.actionBtn, styles.actionDisabled]}>
                                            <Text style={styles.actionTextDisabled}>{t("daily_quests.coming_soon", "Sắp có")}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.closeBtn}>
                                <Text onPress={onClose} style={styles.closeBtnText}>{t("daily_quests.close", "Đóng")}</Text>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const { width, height } = Dimensions.get("window");
const modalWidth = Math.min(width * 0.92, 420);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: modalWidth,
        maxHeight: height * 0.85,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    header: {
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        color: "#0f172a",
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
    },
    list: {
        gap: 12,
        marginTop: 8,
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        flex: 1,
        marginRight: 10,
    },
    cardDesc: {
        fontSize: 13,
        color: "#475569",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    badgeStreak: {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
    },
    badgeInfo: {
        backgroundColor: "#e0f2fe",
        borderColor: "#38bdf8",
    },
    badgeText: {
        fontSize: 12,
        color: "#0f172a",
        fontWeight: "600",
    },
    metaRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 10,
    },
    metaPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    metaBlue: {
        backgroundColor: "#dbeafe",
    },
    metaAmber: {
        backgroundColor: "#fef3c7",
    },
    metaText: {
        fontSize: 12,
        color: "#0f172a",
        fontWeight: "600",
    },
    actions: {
        marginTop: 12,
    },
    actionBtn: {
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionDisabled: {
        backgroundColor: "#e5e7eb",
    },
    actionTextDisabled: {
        color: "#6b7280",
        fontWeight: "700",
    },
    footer: {
        marginTop: 8,
    },
    closeBtn: {
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
    },
    closeBtnText: {
        color: "#0f172a",
        fontWeight: "700",
        fontSize: 15,
    },
});


