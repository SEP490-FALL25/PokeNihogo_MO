import { openInAppBrowser } from "@components/atoms/InAppBrowser";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import BackScreen from "@components/molecules/Back";
import SubscriptionHistoryModal from "@components/subscription/SubscriptionHistoryModal";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { WALLET } from "@constants/wallet.enum";
import { useCreateInvoice, useRefetchUserData } from "@hooks/useInvoice";
import { useMinimalAlert } from "@hooks/useMinimalAlert";
import { useSubscriptionMarketplacePackages } from "@hooks/useSubscription";
import { useWalletUser } from "@hooks/useWallet";
import { ISubscriptionMarketplaceEntity } from "@models/subscription/subscription.entity";
import { SubscriptionPackageType } from "@models/subscription/subscription.request";
import payosService from "@services/payos";
import { useLocalSearchParams } from "expo-router";
import { BookOpen, Check, Coins, Crown, Headphones, History, RefreshCw } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_POKECOIN_DEDUCTION = 10000;
const POKECOIN_DEDUCTION_STEP = 10000;

export default function SubscriptionScreen() {
    const { t } = useTranslation();
    const params = useLocalSearchParams<{ testType?: string; packageId?: string }>();
    const { data: packagesData, isLoading: isLoadingPackages } = useSubscriptionMarketplacePackages();
    const { walletUser, isLoading: isLoadingWallet } = useWalletUser();
    const { mutate: createInvoice, isPending: isPurchasing } = useCreateInvoice();
    const { refetchAll } = useRefetchUserData();
    const { showAlert } = useMinimalAlert();
    const scrollViewRef = useRef<ScrollView>(null);
    const packageRefs = useRef<Record<number, View | null>>({});
    const [highlightedPackageId, setHighlightedPackageId] = useState<number | null>(null);
    const highlightAnim = useRef(new Animated.Value(0)).current;

    const [selectedDiscounts, setSelectedDiscounts] = useState<Record<number, number>>({});
    const [isResolvingInvoice, setIsResolvingInvoice] = useState<boolean>(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState<boolean>(false);

    const packages = packagesData?.data?.data || [];
    const userBalance = walletUser?.find((w: any) => w.type === WALLET.WALLET_TYPES.PAID_COINS)?.balance ?? 0;

    // Helper function to map marketplace entity to packageType
    const getPackageType = useCallback((packageItem: ISubscriptionMarketplaceEntity): SubscriptionPackageType => {
        if (packageItem.tagName === 'ULTRA') {
            return SubscriptionPackageType.ULTRA_EXPLORER;
        }

        // Check features to determine READING or LISTENING
        const hasReading = packageItem.features.some(f => f.feature.featureKey === 'UNLOCK_READING');
        const hasListening = packageItem.features.some(f => f.feature.featureKey === 'UNLOCK_LISTENING');

        if (hasReading && hasListening) {
            return SubscriptionPackageType.READING_LISTENING;
        } else if (hasReading) {
            return SubscriptionPackageType.READING;
        } else if (hasListening) {
            return SubscriptionPackageType.LISTENING;
        }

        return SubscriptionPackageType.READING; // default
    }, []);

    // Helper function to check if package matches testType
    const matchesTestType = useCallback((packageItem: ISubscriptionMarketplaceEntity, testType?: string): boolean => {
        if (!testType) return false;

        const packageType = getPackageType(packageItem);
        const hasReading = packageItem.features.some(f => f.feature.featureKey === 'UNLOCK_READING');
        const hasListening = packageItem.features.some(f => f.feature.featureKey === 'UNLOCK_LISTENING');
        const isUltra = packageType === SubscriptionPackageType.ULTRA_EXPLORER;

        if (testType === 'READING_TEST') {
            // Match READING, READING_LISTENING, or ULTRA packages
            return hasReading || isUltra;
        } else if (testType === 'LISTENING_TEST') {
            // Match LISTENING, READING_LISTENING, or ULTRA packages
            return hasListening || isUltra;
        } else if (testType === 'SPEAKING_TEST') {
            // Match READING_LISTENING or ULTRA packages (speaking needs both)
            return (hasReading && hasListening) || isUltra;
        }

        return false;
    }, [getPackageType]);

    // Effect to highlight and scroll to package based on params
    const triggerPackageHighlight = useCallback(
        (packageId: number) => {
            setHighlightedPackageId(packageId);

            const animateHighlight = () => {
                Animated.sequence([
                    Animated.timing(highlightAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: false,
                    }),
                    Animated.timing(highlightAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: false,
                    }),
                ]).start();
            };

            animateHighlight();
            setTimeout(() => animateHighlight(), 800);
            setTimeout(() => animateHighlight(), 1600);

            setTimeout(() => {
                const packageRef = packageRefs.current[packageId];
                if (packageRef && scrollViewRef.current) {
                    packageRef.measureLayout(
                        scrollViewRef.current as any,
                        (x, y) => {
                            scrollViewRef.current?.scrollTo({
                                y: Math.max(0, y - 40),
                                animated: true,
                            });
                        },
                        () => {
                            try {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({
                                        y: 0,
                                        animated: true,
                                    });
                                }, 200);
                            } catch (e) {
                                console.log('Scroll error:', e);
                            }
                        }
                    );
                }
            }, 200);
        },
        [highlightAnim]
    );

    useEffect(() => {
        if (packages.length === 0 || isLoadingPackages) {
            return;
        }

        const packageIdParam = params.packageId ? Number(params.packageId) : undefined;
        if (packageIdParam) {
            const targetPackage = packages.find((pkg: ISubscriptionMarketplaceEntity) => pkg.id === packageIdParam);
            if (targetPackage) {
                triggerPackageHighlight(targetPackage.id);
                return;
            }
        }

        if (params.testType) {
            const targetPackage = packages.find((pkg: ISubscriptionMarketplaceEntity) =>
                matchesTestType(pkg, params.testType)
            );
            if (targetPackage) {
                triggerPackageHighlight(targetPackage.id);
            }
        }
    }, [packages, isLoadingPackages, params.packageId, params.testType, matchesTestType, triggerPackageHighlight]);

    // Helper function to get active plan
    const getActivePlan = useCallback((packageItem: ISubscriptionMarketplaceEntity) => {
        return packageItem.plans.find(plan => plan.isActive) || packageItem.plans[0];
    }, []);

    // Helper function to format duration
    const formatDuration = useCallback((plan: { type: string; durationInDays: number | null }) => {
        if (plan.type === 'LIFETIME') {
            return t('subscription.lifetime');
        } else if (plan.durationInDays) {
            if (plan.durationInDays === 30) {
                return '1 tháng';
            } else if (plan.durationInDays === 90) {
                return '3 tháng';
            } else if (plan.durationInDays === 365) {
                return '1 năm';
            }
            return `${plan.durationInDays} ngày`;
        }
        return null;
    }, [t]);

    // Helper function to get benefits from features
    const getBenefits = useCallback((packageItem: ISubscriptionMarketplaceEntity): string[] => {
        return packageItem.features.map(feature => {
            let benefit = feature.feature.nameTranslation;
            if (feature.value) {
                // Add multiplier value if exists (e.g., "1.2" for XP_MULTIPLIER)
                benefit = `${benefit} (x${feature.value})`;
            }
            return benefit;
        });
    }, []);

    const handleBrowserClose = useCallback(async () => {
        // Refetch data after payment (when browser closes)
        await refetchAll();
    }, [refetchAll]);

    const handleBrowserError = useCallback((error: Error) => {
        showAlert(error.message || t('subscription.purchase_failed'), 'error');
    }, [t, showAlert]);

    const getMaxDeductable = useCallback((price: number) => {
        const cap = Math.min(price, userBalance);
        if (cap < MIN_POKECOIN_DEDUCTION) {
            return 0;
        }
        return Math.floor(cap / POKECOIN_DEDUCTION_STEP) * POKECOIN_DEDUCTION_STEP;
    }, [userBalance]);

    const handleAdjustDeduction = useCallback((packageId: number, price: number, direction: 'increase' | 'decrease') => {
        setSelectedDiscounts((prev) => {
            const max = getMaxDeductable(price);
            if (!max) {
                return {
                    ...prev,
                    [packageId]: 0,
                };
            }

            const current = prev[packageId] || 0;
            const delta = direction === 'increase' ? POKECOIN_DEDUCTION_STEP : -POKECOIN_DEDUCTION_STEP;
            const nextRaw = Math.min(Math.max(current + delta, 0), max);
            const nextValue = Math.floor(nextRaw / POKECOIN_DEDUCTION_STEP) * POKECOIN_DEDUCTION_STEP;

            return {
                ...prev,
                [packageId]: nextValue,
            };
        });
    }, [getMaxDeductable]);

    const handleContinuePayment = useCallback(async (invoiceId?: number | null) => {
        if (!invoiceId) {
            showAlert(t('subscription.purchase_failed'), 'error');
            return;
        }

        setIsResolvingInvoice(true);
        try {
            const response = await payosService.recallPayment(invoiceId);
            const responseData = response.data?.data;
            const checkoutUrl = responseData?.payosData?.checkoutUrl;

            if (checkoutUrl) {
                openInAppBrowser(checkoutUrl, {
                    onClose: handleBrowserClose,
                    onError: handleBrowserError,
                });
            } else {
                showAlert(t('subscription.purchase_failed'), 'error');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || t('subscription.purchase_failed');
            showAlert(errorMessage, 'error');
        } finally {
            setIsResolvingInvoice(false);
        }
    }, [handleBrowserClose, handleBrowserError, t, showAlert]);

    const handlePurchase = useCallback((packageItem: ISubscriptionMarketplaceEntity) => {
        const activePlan = getActivePlan(packageItem);
        if (!activePlan) {
            showAlert(t('subscription.purchase_failed'), 'error');
            return;
        }

        if (activePlan.pendingInvoice) {
            handleContinuePayment(activePlan.pendingInvoice.id);
            return;
        }

        const maxDeductable = getMaxDeductable(activePlan.price);
        const selectedDiscount = selectedDiscounts[packageItem.id] || 0;
        const discountAmount = Math.min(selectedDiscount, maxDeductable);
        const normalizedDiscount = discountAmount >= MIN_POKECOIN_DEDUCTION
            ? Math.floor(discountAmount / POKECOIN_DEDUCTION_STEP) * POKECOIN_DEDUCTION_STEP
            : 0;

        createInvoice(
            {
                subscriptionPlanId: activePlan.id,
                discountAmount: normalizedDiscount,
            },
            {
                onSuccess: async (response) => {
                    setSelectedDiscounts((prev) => ({
                        ...prev,
                        [packageItem.id]: 0,
                    }));
                    const responseData = response.data?.data;

                    const checkoutUrl = responseData?.payment?.payosData?.checkoutUrl;

                    if (checkoutUrl) {
                        openInAppBrowser(checkoutUrl, {
                            onClose: handleBrowserClose,
                            onError: handleBrowserError,
                        });
                    } else {
                        showAlert(responseData?.message || t('subscription.purchase_success'), 'success');
                        await refetchAll();
                    }
                },
                onError: (error: any) => {
                    const statusCode = error?.response?.status;
                    const errorData = error?.response?.data;

                    if (statusCode === 409 && errorData?.data?.invoiceId) {
                        const invoiceId = errorData.data.invoiceId;

                        payosService.recallPayment(invoiceId)
                            .then((response) => {
                                const responseData = response.data?.data;
                                const checkoutUrl = responseData?.payosData?.checkoutUrl;

                                if (checkoutUrl) {
                                    openInAppBrowser(checkoutUrl, {
                                        onClose: handleBrowserClose,
                                        onError: handleBrowserError,
                                    });
                                } else {
                                    showAlert(t('subscription.purchase_failed'), 'error');
                                }
                            })
                            .catch((recallError: any) => {
                                const recallErrorMessage = recallError?.response?.data?.message || errorData?.message || t('subscription.purchase_failed');
                                showAlert(recallErrorMessage, 'error');
                            });
                    } else {
                        const errorMessage = errorData?.message || t('subscription.purchase_failed');
                        showAlert(errorMessage, 'error');
                    }
                },
            }
        );
    }, [createInvoice, t, getActivePlan, handleBrowserClose, handleBrowserError, selectedDiscounts, getMaxDeductable, handleContinuePayment, showAlert]);

    const handleRefetch = useCallback(() => {
        refetchAll();
        showAlert(t('subscription.data_refreshed'), 'success');
    }, [refetchAll, t, showAlert]);

    const getPackageIcon = (packageType: SubscriptionPackageType) => {
        switch (packageType) {
            case SubscriptionPackageType.READING:
                return (
                    <View className="bg-white/85 rounded-full p-3">
                        <BookOpen size={25} color="#3b82f6" />
                    </View>
                )
            case SubscriptionPackageType.LISTENING:
                return (
                    <View className="bg-white/85 rounded-full p-3">
                        <Headphones size={25} color="#8b5cf6" />
                    </View>
                )
            case SubscriptionPackageType.ULTRA_EXPLORER:
                return (
                    <View className="bg-white/95 rounded-full p-3">
                        <Crown size={25} color="#f59e0b" />
                    </View>
                )
            default:
                return null;
        }
    };

    const getPackageGradient = (packageType: SubscriptionPackageType): [string, string, string] => {
        switch (packageType) {
            case SubscriptionPackageType.READING:
                return ['#3b82f6', '#2563eb', '#1d4ed8'];
            case SubscriptionPackageType.LISTENING:
                return ['#8b5cf6', '#7c3aed', '#6d28d9'];
            case SubscriptionPackageType.READING_LISTENING:
                return ['#ec4899', '#db2777', '#be185d'];
            case SubscriptionPackageType.ULTRA_EXPLORER:
                return ['#f59e0b', '#d97706', '#b45309'];
            default:
                return ['#64748b', '#475569', '#334155'];
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    if (isLoadingPackages || isLoadingWallet) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <ThemedView className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <ThemedText className="mt-4 text-lg">{t('common.loading')}</ThemedText>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <ThemedView className="flex-1">
                <BackScreen
                    color="black"
                />
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View className="px-6 pt-12 pb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <ThemedText type="title" className="text-3xl font-bold flex-1">
                                {t('subscription.title')}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setIsHistoryModalVisible(true)}
                                className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3"
                            >
                                <History size={20} color="#3b82f6" />
                            </TouchableOpacity>
                        </View>
                        <ThemedText className="text-center text-slate-500 text-base">
                            {t('subscription.subtitle')}
                        </ThemedText>
                    </View>

                    {/* User Balance */}
                    <View className="mx-6 mb-6">
                        <View className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Coins size={24} color="#f59e0b" />
                                <Text className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                                    {t('subscription.balance')}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <Text className="text-amber-500 font-bold text-xl">
                                    {formatPrice(userBalance)}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleRefetch}
                                    className="p-2"
                                    disabled={isLoadingPackages || isLoadingWallet}
                                >
                                    <RefreshCw
                                        size={20}
                                        color="#3b82f6"
                                        style={isLoadingPackages || isLoadingWallet ? { opacity: 0.5 } : {}}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Packages List */}
                    <View className="px-6 pb-6 gap-4">
                        {packages.map((packageItem: ISubscriptionMarketplaceEntity) => {
                            const packageType = getPackageType(packageItem);
                            const activePlan = getActivePlan(packageItem);
                            const isUltra = packageType === SubscriptionPackageType.ULTRA_EXPLORER;
                            const isPopular = packageItem.isPopular;
                            const canBuy = packageItem.canBuy;
                            const gradientColors = getPackageGradient(packageType);
                            const benefits = getBenefits(packageItem);
                            const duration = activePlan ? formatDuration(activePlan) : null;
                            const isHighlighted = highlightedPackageId === packageItem.id;

                            if (!activePlan) {
                                return null; // Skip packages without active plans
                            }

                            const pendingInvoice = activePlan.pendingInvoice;
                            const hasPendingInvoice = Boolean(pendingInvoice);
                            const rawSelectedDiscount = selectedDiscounts[packageItem.id] || 0;
                            const maxDeductable = activePlan ? getMaxDeductable(activePlan.price) : 0;
                            const selectableDiscount = Math.min(rawSelectedDiscount, maxDeductable);
                            const selectedDiscount = hasPendingInvoice
                                ? pendingInvoice?.discountAmount ?? 0
                                : selectableDiscount;
                            const finalPrice = hasPendingInvoice
                                ? pendingInvoice?.totalAmount ?? activePlan.price
                                : activePlan
                                    ? Math.max(activePlan.price - selectedDiscount, 0)
                                    : 0;
                            const usagePercent = !hasPendingInvoice && maxDeductable
                                ? selectedDiscount / maxDeductable
                                : 0;
                            const buttonLabel = hasPendingInvoice
                                ? t('subscription.continue_payment', { defaultValue: 'Tiếp tục thanh toán' })
                                : t('subscription.purchase');
                            const isActionBusy = hasPendingInvoice ? isResolvingInvoice : isPurchasing;

                            const borderColor = isHighlighted
                                ? highlightAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 1)'],
                                })
                                : undefined;
                            const shadowOpacity = isHighlighted
                                ? highlightAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 0.9],
                                })
                                : undefined;

                            return (
                                <Animated.View
                                    key={packageItem.id}
                                    ref={(ref) => {
                                        if (ref) {
                                            packageRefs.current[packageItem.id] = ref as View;
                                        }
                                    }}
                                    className={`rounded-3xl overflow-hidden shadow-lg ${isUltra || isPopular ? 'border-2 border-amber-400' : ''} ${isHighlighted ? 'border-4' : ''}`}
                                    style={[
                                        isHighlighted && borderColor ? {
                                            borderWidth: 4,
                                            borderColor: borderColor,} : {},
                                    ]}
                                >
                                    <TWLinearGradient
                                        colors={gradientColors}
                                        className="p-6"
                                    >
                                        {/* Package Header */}
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center gap-3">
                                                {getPackageIcon(packageType)}
                                                <View>
                                                    <Text className="text-white font-bold text-xl">
                                                        {packageItem.nameTranslation}
                                                    </Text>
                                                    {duration && (
                                                        <Text className="text-white/80 text-sm mt-1">
                                                            {duration}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            {(isUltra || isPopular) && (
                                                <View className="bg-amber-400/20 px-3 py-1 rounded-full">
                                                    <Text className="text-amber-200 font-bold text-xs">
                                                        {t('subscription.popular')}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Description */}
                                        <Text className="text-white/90 text-base mb-4">
                                            {packageItem.descriptionTranslation}
                                        </Text>

                                        {/* Benefits */}
                                        {benefits.length > 0 && (
                                            <View className="mb-4 gap-2">
                                                {benefits.map((benefit, index) => (
                                                    <View key={index} className="flex-row items-start gap-2">
                                                        <Check size={18} color="#ffffff" style={{ marginTop: 2 }} />
                                                        <Text className="text-white/90 text-sm flex-1">
                                                            {benefit}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* PokeCoin Deduction */}
                                        {canBuy && hasPendingInvoice && (
                                            <View className="mb-4 rounded-3xl border border-amber-200/40 bg-white/10 p-4">
                                                <Text className="text-white font-semibold text-base">
                                                    {t('subscription.pending_invoice_title', { defaultValue: 'Bạn có hóa đơn đang chờ' })}
                                                </Text>
                                                <Text className="text-white/70 text-xs mt-1">
                                                    {t('subscription.pending_invoice_desc', { defaultValue: 'Hoàn tất thanh toán để kích hoạt quyền lợi.' })}
                                                </Text>
                                                <View className="mt-3 rounded-2xl bg-white/10 border border-white/15 p-3">
                                                    <Text className="text-white text-sm font-semibold">
                                                        {t('subscription.pending_invoice_amount', {
                                                            defaultValue: 'Tổng cần thanh toán: {{amount}}₫',
                                                            amount: formatPrice(finalPrice),
                                                        })}
                                                    </Text>
                                                    {selectedDiscount > 0 && (
                                                        <Text className="text-white/70 text-xs mt-1">
                                                            {t('subscription.pending_invoice_discount', {
                                                                defaultValue: 'Đã trừ PokeCoin: -{{amount}}₫',
                                                                amount: formatPrice(selectedDiscount),
                                                            })}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                        {canBuy && !hasPendingInvoice && (
                                            <View className="mb-4 rounded-3xl border border-white/15 bg-white/10 p-4">
                                                <View className="flex-row items-center justify-between mb-3">
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="w-10 h-10 rounded-2xl bg-white/15 items-center justify-center">
                                                            <Coins size={22} color="#fcd34d" />
                                                        </View>
                                                        <View>
                                                            <Text className="text-white font-semibold text-base">
                                                                {t('subscription.poke_coin_title', { defaultValue: 'Sử dụng PokeCoin' })}
                                                            </Text>
                                                            <Text className="text-white/60 text-xs">
                                                                {t('subscription.balance_short', { defaultValue: 'Số dư:' })} {formatPrice(userBalance)}₫
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {selectedDiscount > 0 && (
                                                        <View className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-200/30">
                                                            <Text className="text-emerald-100 text-xs font-semibold">
                                                                -{formatPrice(selectedDiscount)}₫
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {maxDeductable < MIN_POKECOIN_DEDUCTION ? (
                                                    <Text className="text-white/70 text-xs">
                                                        {t('subscription.poke_coin_insufficient', { defaultValue: 'Cần tối thiểu 10.000₫ để trừ PokeCoin.' })}
                                                    </Text>
                                                ) : (
                                                    <>
                                                        <View className="mb-3">
                                                            <View className="flex-row justify-between mb-1">
                                                                <Text className="text-white/70 text-xs">
                                                                    {t('subscription.poke_coin_hint', { defaultValue: 'Bội số 10.000₫' })}
                                                                </Text>
                                                                <Text className="text-white/80 text-xs">
                                                                    {t('subscription.poke_coin_max', {
                                                                        defaultValue: 'Tối đa {{amount}}₫',
                                                                        amount: formatPrice(maxDeductable),
                                                                    })}
                                                                </Text>
                                                            </View>
                                                            <View className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                                                                <View
                                                                    className="h-full bg-white"
                                                                    style={{ width: `${Math.min(Math.max(usagePercent * 100, 0), 100)}%` }}
                                                                />
                                                            </View>
                                                        </View>
                                                        <View className="flex-row items-center gap-3">
                                                            <TouchableOpacity
                                                                onPress={() => handleAdjustDeduction(packageItem.id, activePlan.price, 'decrease')}
                                                                disabled={selectedDiscount === 0 || isPurchasing}
                                                                className={`w-12 h-12 rounded-2xl items-center justify-center border ${selectedDiscount === 0 ? 'border-white/20 bg-white/5' : 'border-white/60 bg-white/15'}`}
                                                            >
                                                                <Text className="text-xl font-bold text-white">−</Text>
                                                            </TouchableOpacity>
                                                            <View className="flex-1 py-2 rounded-2xl bg-white/15 border border-white/20 items-center">
                                                                <Text className="text-white text-xs uppercase tracking-wide">
                                                                    {t('subscription.poke_coin_using', { defaultValue: 'Đang trừ' })}
                                                                </Text>
                                                                <Text className="text-white font-bold text-xl">
                                                                    -{formatPrice(selectedDiscount)}₫
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => handleAdjustDeduction(packageItem.id, activePlan.price, 'increase')}
                                                                disabled={selectedDiscount >= maxDeductable || isPurchasing}
                                                                className={`w-12 h-12 rounded-2xl items-center justify-center border ${selectedDiscount >= maxDeductable ? 'border-white/20 bg-white/5' : 'border-white/60 bg-white/15'}`}
                                                            >
                                                                <Text className="text-xl font-bold text-white">+</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        )}

                                        {/* Price and Purchase Button */}
                                        <View className="flex-row items-center justify-between mt-2">
                                            <View>
                                                <Text className="text-white/80 text-sm">
                                                    {t('subscription.price')}
                                                </Text>
                                                {selectedDiscount > 0 && (
                                                    <Text
                                                        className="text-white/60 text-xs mt-1"
                                                        style={{ textDecorationLine: 'line-through' }}
                                                    >
                                                        {formatPrice(activePlan.price)} ₫
                                                    </Text>
                                                )}
                                                <View className="flex-row items-center gap-1 mt-1">
                                                    <Text className="text-white font-bold text-2xl">
                                                        {formatPrice(finalPrice)}
                                                    </Text>
                                                    <Text className="text-white/80 text-sm">₫</Text>
                                                </View>
                                                {selectedDiscount > 0 && (
                                                    <Text className="text-emerald-200 text-xs mt-1">
                                                        -{formatPrice(selectedDiscount)}₫ {t('subscription.from_poke_coin', { defaultValue: 'từ PokeCoin' })}
                                                    </Text>
                                                )}
                                            </View>
                                            {!canBuy ? (
                                                // Already purchased - show "Đã mua" badge
                                                <View className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-400/30">
                                                    <Text className="font-bold text-green-300 text-center">
                                                        {t('subscription.purchased')}
                                                    </Text>
                                                </View>
                                            ) : (
                                                // Can purchase - show purchase button
                                                <TouchableOpacity
                                                    onPress={() => handlePurchase(packageItem)}
                                                    disabled={isActionBusy}
                                                    className="px-6 py-3 rounded-xl bg-white"
                                                >
                                                    {isActionBusy ? (
                                                        <ActivityIndicator size="small" color="#3b82f6" />
                                                    ) : (
                                                        <Text className="font-bold text-slate-800">
                                                            {buttonLabel}
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </TWLinearGradient>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </ThemedView>
            <SubscriptionHistoryModal
                visible={isHistoryModalVisible}
                onClose={() => setIsHistoryModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 20,
    },
});

