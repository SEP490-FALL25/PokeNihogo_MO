import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { useNotification, useReadAllNotifications, useReadNotification } from "@hooks/useNotification";
import { useRouter } from "expo-router";
import {
    Bell,
    BellOff,
    BookOpen,
    CheckCheck,
    ChevronLeft,
    Dumbbell,
    Gift
} from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    Platform,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type NotificationItem = {
    id: number;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: {
        sparkles?: { amount: number };
        exp?: { amount: number };
    };
};

const PAGE_LOAD_DEBOUNCE_MS = 400;

const getNotificationBody = (item: NotificationItem, t: any) => {
    let data: any = item.data;

    // Parse data if it's a string
    if (typeof item.data === 'string') {
        try {
            data = JSON.parse(item.data);
        } catch (e) {
            // If parsing fails, fall back to item.body
            return item.body;
        }
    }

    if ((item.type === 'REWARD' || item.type === 'EXERCISE' || item.type === 'LESSON' || item.type === 'ACHIEVEMENT' || item.type === 'ATTENDANCE') && data) {
        const parts = [];
        if (data.sparkles?.amount) {
            parts.push(t('notification.sparkles', { amount: data.sparkles.amount, defaultValue: `+${data.sparkles.amount} Sparkles ✨` }));
        }
        if (data.exp?.amount) {
            parts.push(t('notification.exp', { amount: data.exp.amount, defaultValue: `+${data.exp.amount} EXP 📈` }));
        }
        if (parts.length > 0) {
            const joinedParts = parts.join(t('notification.and', { defaultValue: " và " }));
            return t('notification.reward_congrats', { parts: joinedParts, defaultValue: `Chúc mừng! Bạn nhận được ${joinedParts}.` });
        }
    }
    return item.body;
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "REWARD":
            return { icon: Gift, color: "#f59e0b", bg: "#fef3c7" }; // Amber
        case "LESSON":
            return { icon: BookOpen, color: "#3b82f6", bg: "#dbeafe" }; // Blue
        case "EXERCISE":
            return { icon: Dumbbell, color: "#8b5cf6", bg: "#f3e8ff" }; // Violet
        default:
            return { icon: Bell, color: "#6b7280", bg: "#f3f4f6" }; // Gray
    }
};

const formatTime = (dateString: string, t: any) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notification.just_now', { defaultValue: "Vừa xong" });
    if (diffMins < 60) return t('notification.minutes_ago', { count: diffMins, defaultValue: `${diffMins} phút trước` });
    if (diffHours < 24) return t('notification.hours_ago', { count: diffHours, defaultValue: `${diffHours} giờ trước` });
    if (diffDays < 7) return t('notification.days_ago', { count: diffDays, defaultValue: `${diffDays} ngày trước` });

    return date.toLocaleDateString(t('notification.date_locale', { defaultValue: "vi-VN" }), { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const {
        notifications,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useNotification();
    console.log("notifications", notifications);
    const { mutate: markAsRead } = useReadNotification();
    const { mutate: readAll } = useReadAllNotifications();
    const router = useRouter();

    const lastLoadTimeRef = useRef<number>(0);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleLoadMore = useCallback(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const now = Date.now();
        if (now - lastLoadTimeRef.current < PAGE_LOAD_DEBOUNCE_MS) return;
        lastLoadTimeRef.current = now;
        fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleItemPress = useCallback(
        (item: NotificationItem) => {
            if (!item.isRead) {
                markAsRead(item.id);
            }
        },
        [markAsRead]
    );

    const handleReadAll = () => {
        // Get IDs of all unread notifications
        const unreadIds = notifications
            .filter((n: any) => !n.isRead)
            .map((n: any) => n.id);

        if (unreadIds.length > 0) {
            readAll(unreadIds);
        }
    };

    const hasUnread = notifications.some((n: any) => !n.isRead);

    const renderItem: ListRenderItem<NotificationItem> = ({ item, index }) => {
        const { icon: Icon, color, bg } = getNotificationIcon(item.type);

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.itemWrapper}
            >
                <TouchableOpacity
                    style={[
                        styles.itemContainer,
                        !item.isRead && styles.itemUnread,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                        <Icon size={24} color={color} strokeWidth={2.5} />
                        {!item.isRead && <View style={styles.onlineDot} />}
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <ThemedText style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]} numberOfLines={1}>
                                {item.title}
                            </ThemedText>
                            <ThemedText style={styles.itemTime}>
                                {formatTime(item.createdAt, t)}
                            </ThemedText>
                        </View>

                        <ThemedText style={styles.itemBody} numberOfLines={2}>
                            {getNotificationBody(item, t)}
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const keyExtractor = (item: NotificationItem) => String(item.id);

    const renderListFooter = () => {
        if (!isFetchingNextPage) return <View style={styles.footerSpacing} />;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator color="#3b82f6" />
            </View>
        );
    };

    const showEmpty =
        !isLoading && (!notifications || notifications.length === 0);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.headerBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={styles.backButtonCircle}>
                        <ChevronLeft size={24} color="#374151" />
                    </View>
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                    {t("notification.title", "Thông báo")}
                </ThemedText>

                {hasUnread ? (
                    <TouchableOpacity
                        onPress={handleReadAll}
                        style={styles.readAllButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <CheckCheck size={22} color="#3b82f6" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerRightPlaceholder} />
                )}
            </View>

            {isLoading && !notifications.length ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : showEmpty ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <BellOff size={48} color="#9ca3af" />
                    </View>
                    <ThemedText style={styles.emptyTitle}>
                        {t(
                            "notification.empty_title",
                            "Chưa có thông báo nào"
                        )}
                    </ThemedText>
                    <ThemedText style={styles.emptySubtitle}>
                        {t(
                            "notification.empty_subtitle",
                            "Khi bạn học hoặc nhận thưởng, thông báo sẽ xuất hiện tại đây."
                        )}
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={notifications as NotificationItem[]}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderListFooter}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            colors={["#3b82f6"]}
                            tintColor="#3b82f6"
                        />
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb", // Gray 50
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingBottom: 16,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        zIndex: 10,
    },
    headerBack: {
        padding: 4,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    headerRightPlaceholder: {
        width: 48, // Matches back button + padding
    },
    readAllButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#eff6ff", // Blue 50
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    itemWrapper: {
        marginBottom: 12,
    },
    itemContainer: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f3f4f6", // Very subtle border
    },
    itemUnread: {
        backgroundColor: "#ffffff",
        borderColor: "#dbeafe", // Blue border for unread
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        position: 'relative',
    },
    onlineDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ef4444", // Red dot
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
        flex: 1,
        marginRight: 8,
    },
    itemTitleUnread: {
        color: "#111827",
        fontWeight: "700",
    },
    itemTime: {
        fontSize: 12,
        color: "#9ca3af",
        fontWeight: "500",
    },
    itemBody: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
    },
    footerLoading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerSpacing: {
        height: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 12,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },
});
