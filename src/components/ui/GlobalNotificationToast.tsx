import { ThemedText } from "@components/ThemedText";
import { useReadNotification } from "@hooks/useNotification";
import { ROUTES } from "@routes/routes";
import { useNotificationToastStore } from "@stores/notification/notification-ui.store";
import { useRouter } from "expo-router";
import { Bell, BookOpen, Dumbbell, Gift, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getIcon = (type: string) => {
    switch (type) {
        case 'REWARD': return { icon: Gift, color: '#f59e0b', bg: '#fffbeb' };
        case 'LESSON': return { icon: BookOpen, color: '#3b82f6', bg: '#eff6ff' };
        case 'EXERCISE': return { icon: Dumbbell, color: '#8b5cf6', bg: '#f5f3ff' };
        default: return { icon: Bell, color: '#6b7280', bg: '#f9fafb' };
    }
};

export const GlobalNotificationToast = () => {
    const { isVisible, id, title, message, type, hideToast } = useNotificationToastStore();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { mutate: markAsRead } = useReadNotification();

    if (!isVisible) return null;

    const { icon: Icon, color, bg } = getIcon(type);

    const handlePress = () => {
        if (id) {
            console.log("Toast clicked, marking as read:", id);
            markAsRead(Number(id));
        }
        router.push(ROUTES.APP.NOTIFICATIONS);
        // Delay hiding toast to prevent unmounting the hook before mutation fires
        setTimeout(() => {
            hideToast();
        }, 500);
    };

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(15)}
            exiting={FadeOutUp}
            style={[styles.wrapper, { top: insets.top + 10 }]}
        >
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.9}
                onPress={handlePress}
            >
                <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                    <Icon size={24} color={color} strokeWidth={2.5} />
                </View>

                <View style={styles.content}>
                    <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
                    <ThemedText style={styles.message} numberOfLines={2}>{message}</ThemedText>
                </View>

                <TouchableOpacity onPress={hideToast} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={18} color="#9ca3af" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    container: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 1)',
        alignItems: 'center',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 18,
    },
    closeBtn: {
        padding: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    }
});

