import { useInfiniteUserSubscription } from '@hooks/useSubscription';
import { IUserSubscriptionEntity } from '@models/subscription/subscription.entity';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Crown, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SubscriptionHistoryModalProps {
    visible: boolean;
    onClose: () => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return '#10b981';
        case 'EXPIRED':
            return '#ef4444';
        case 'CANCELLED':
            return '#6b7280';
        default:
            return '#6b7280';
    }
};

const getStatusText = (status: string, t: any) => {
    switch (status) {
        case 'ACTIVE':
            return t('subscription.status_active', { defaultValue: 'Đang kích hoạt' });
        case 'EXPIRED':
            return t('subscription.status_expired', { defaultValue: 'Đã hết hạn' });
        case 'CANCELLED':
            return t('subscription.status_cancelled', { defaultValue: 'Đã hủy' });
        default:
            return status;
    }
};

export default function SubscriptionHistoryModal({ visible, onClose }: SubscriptionHistoryModalProps) {
    const { t } = useTranslation();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useInfiniteUserSubscription();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Refetch when modal opens
    useEffect(() => {
        if (visible) {
            refetch();
        }
    }, [visible, refetch]);

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const allSubscriptions = useMemo(() => {
        if (!data?.pages) return [];
        const subscriptions = data.pages.flatMap((page) => {
            // page is the API response (already extracted response.data from service)
            // Structure: { statusCode, message, data: { results, pagination } }
            if (!page?.data?.results) return [];
            return page.data.results;
        });
        return subscriptions;
    }, [data]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && !isLoadingMore) {
            // Clear existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set loading state
            setIsLoadingMore(true);

            // Debounce the fetch
            debounceTimerRef.current = setTimeout(() => {
                fetchNextPage().finally(() => {
                    setIsLoadingMore(false);
                });
            }, 300); // 300ms debounce
        }
    }, [hasNextPage, isFetchingNextPage, isLoadingMore, fetchNextPage]);

    const renderSubscriptionItem = useCallback(
        ({ item: subscription }: { item: IUserSubscriptionEntity }) => {
            const isUltra = subscription.subscriptionPlan.subscription.tagName === 'ULTRA';
            const statusColor = getStatusColor(subscription.status);
            const statusText = getStatusText(subscription.status, t);

            return (
                <View style={styles.subscriptionCard}>
                    <LinearGradient
                        colors={
                            subscription.status === 'ACTIVE'
                                ? ['#ecfdf5', '#d1fae5']
                                : ['#f9fafb', '#f3f4f6']
                        }
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardContent}>
                            {/* Header */}
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    {isUltra && (
                                        <View style={styles.crownContainer}>
                                            <Crown size={18} color="#f59e0b" />
                                        </View>
                                    )}
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.packageName}>
                                            {subscription.subscriptionPlan.subscription.nameTranslation}
                                        </Text>
                                        <Text style={styles.packageDescription}>
                                            {subscription.subscriptionPlan.subscription.descriptionTranslation}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: statusColor },
                                    ]}
                                >
                                    <Text style={styles.statusText}>{statusText}</Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Calendar size={16} color="#64748b" />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>
                                            {t('subscription.start_date', { defaultValue: 'Ngày bắt đầu' })}
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(subscription.startDate)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Calendar size={16} color="#64748b" />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>
                                            {t('subscription.expires_at', { defaultValue: 'Ngày hết hạn' })}
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(subscription.expiresAt)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>
                                            {t('subscription.price', { defaultValue: 'Giá' })}
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {formatPrice(subscription.invoice.totalAmount)} ₫
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            );
        },
        [t]
    );

    const renderFooter = useCallback(() => {
        if (isFetchingNextPage || isLoadingMore) {
            return (
                <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.loadingMoreText}>
                        {t('common.loading')}
                    </Text>
                </View>
            );
        }
        if (!hasNextPage && allSubscriptions.length > 0) {
            return (
                <View style={styles.endContainer}>
                    <Text style={styles.endText}>
                        {t('subscription.end_of_list', { defaultValue: 'Đã hiển thị tất cả' })}
                    </Text>
                </View>
            );
        }
        return null;
    }, [isFetchingNextPage, isLoadingMore, hasNextPage, allSubscriptions.length, t]);

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            );
        }
        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {t('subscription.error_loading_history', { defaultValue: 'Có lỗi xảy ra khi tải lịch sử' })}
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>
                            {t('common.retry', { defaultValue: 'Thử lại' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {t('subscription.no_history', { defaultValue: 'Chưa có lịch sử đăng ký' })}
                </Text>
            </View>
        );
    }, [isLoading, error, t, refetch]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {t('subscription.history_title', { defaultValue: 'Lịch sử đăng ký' })}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.contentWrapper}>
                        <FlatList
                            data={allSubscriptions}
                            renderItem={renderSubscriptionItem}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={renderEmpty}
                            ListFooterComponent={renderFooter}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                        />
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 500,
        height: SCREEN_HEIGHT * 0.8,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        padding: 4,
    },
    contentWrapper: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    },
    subscriptionCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        borderRadius: 16,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1,
        gap: 8,
    },
    crownContainer: {
        marginTop: 2,
    },
    titleContainer: {
        flex: 1,
    },
    packageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    packageDescription: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    detailsContainer: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 14,
        color: '#6b7280',
    },
    endContainer: {
        padding: 20,
        alignItems: 'center',
    },
    endText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});

