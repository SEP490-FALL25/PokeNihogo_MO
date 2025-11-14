import MinimalAlert from "@components/atoms/MinimalAlert";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { WALLET } from "@constants/wallet.enum";
import { useSubscriptionPackages, useSubscriptionPurchase } from "@hooks/useSubscription";
import { useWalletUser } from "@hooks/useWallet";
import { SubscriptionPackageType } from "@models/subscription/subscription.request";
import { ISubscriptionPackageResponse } from "@models/subscription/subscription.response";
import { BookOpen, Check, Crown, Headphones, Sparkles } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubscriptionScreen() {
    const { t } = useTranslation();
    const { data: packagesData, isLoading: isLoadingPackages } = useSubscriptionPackages();
    const { walletUser, isLoading: isLoadingWallet } = useWalletUser();
    const { mutate: purchasePackage, isPending: isPurchasing } = useSubscriptionPurchase();

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

    const packages = packagesData?.data || [];
    const userBalance = walletUser?.find((w: any) => w.type === WALLET.WALLET_TYPES.PAID_COINS)?.balance ?? 0;

    const handleHideAlert = useCallback(() => {
        setAlertVisible(false);
    }, []);

    const handlePurchase = useCallback((packageItem: ISubscriptionPackageResponse) => {
        if (userBalance < packageItem.price) {
            setAlertMessage(t('subscription.insufficient_balance'));
            setAlertType('error');
            setAlertVisible(true);
            return;
        }

        purchasePackage(
            { packageType: packageItem.packageType },
            {
                onSuccess: (data) => {
                    setAlertMessage(data.data.message || t('subscription.purchase_success'));
                    setAlertType('success');
                    setAlertVisible(true);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || t('subscription.purchase_failed');
                    setAlertMessage(errorMessage);
                    setAlertType('error');
                    setAlertVisible(true);
                },
            }
        );
    }, [userBalance, purchasePackage, t]);

    const getPackageIcon = (packageType: SubscriptionPackageType) => {
        switch (packageType) {
            case SubscriptionPackageType.READING:
                return <BookOpen size={32} color="#3b82f6" />;
            case SubscriptionPackageType.LISTENING:
                return <Headphones size={32} color="#8b5cf6" />;
            case SubscriptionPackageType.READING_LISTENING:
                return (
                    <View className="flex-row items-center gap-1">
                        <BookOpen size={28} color="#3b82f6" />
                        <Headphones size={28} color="#8b5cf6" />
                    </View>
                );
            case SubscriptionPackageType.ULTRA_EXPLORER:
                return <Crown size={32} color="#f59e0b" />;
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
            <ThemedView className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View className="px-6 pt-12 pb-6">
                        <ThemedText type="title" className="text-3xl font-bold text-center mb-2">
                            {t('subscription.title')}
                        </ThemedText>
                        <ThemedText className="text-center text-slate-500 text-base">
                            {t('subscription.subtitle')}
                        </ThemedText>
                    </View>

                    {/* User Balance */}
                    <View className="mx-6 mb-6">
                        <View className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Sparkles size={24} color="#f59e0b" />
                                <Text className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                                    {t('subscription.balance')}
                                </Text>
                            </View>
                            <Text className="text-amber-500 font-bold text-xl">
                                {formatPrice(userBalance)}
                            </Text>
                        </View>
                    </View>

                    {/* Packages List */}
                    <View className="px-6 pb-6 gap-4">
                        {packages.map((packageItem) => {
                            const isUltra = packageItem.packageType === SubscriptionPackageType.ULTRA_EXPLORER;
                            const canAfford = userBalance >= packageItem.price;
                            const gradientColors = getPackageGradient(packageItem.packageType);

                            return (
                                <View
                                    key={packageItem.id}
                                    className={`rounded-3xl overflow-hidden shadow-lg ${isUltra ? 'border-2 border-amber-400' : ''}`}
                                    style={isUltra ? { shadowColor: '#f59e0b', shadowOpacity: 0.3, shadowRadius: 10 } : {}}
                                >
                                    <TWLinearGradient
                                        colors={gradientColors}
                                        className="p-6"
                                    >
                                        {/* Package Header */}
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center gap-3">
                                                {getPackageIcon(packageItem.packageType)}
                                                <View>
                                                    <Text className="text-white font-bold text-xl">
                                                        {packageItem.name}
                                                    </Text>
                                                    {packageItem.duration && (
                                                        <Text className="text-white/80 text-sm mt-1">
                                                            {packageItem.duration === 'lifetime'
                                                                ? t('subscription.lifetime')
                                                                : packageItem.duration}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            {isUltra && (
                                                <View className="bg-amber-400/20 px-3 py-1 rounded-full">
                                                    <Text className="text-amber-200 font-bold text-xs">
                                                        {t('subscription.popular')}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Description */}
                                        <Text className="text-white/90 text-base mb-4">
                                            {packageItem.description}
                                        </Text>

                                        {/* Benefits */}
                                        <View className="mb-4 gap-2">
                                            {packageItem.benefits.map((benefit, index) => (
                                                <View key={index} className="flex-row items-start gap-2">
                                                    <Check size={18} color="#ffffff" style={{ marginTop: 2 }} />
                                                    <Text className="text-white/90 text-sm flex-1">
                                                        {benefit}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Price and Purchase Button */}
                                        <View className="flex-row items-center justify-between mt-2">
                                            <View>
                                                <Text className="text-white/80 text-sm">
                                                    {t('subscription.price')}
                                                </Text>
                                                <View className="flex-row items-center gap-1 mt-1">
                                                    <Text className="text-white font-bold text-2xl">
                                                        {formatPrice(packageItem.price)}
                                                    </Text>
                                                    <Text className="text-white/80 text-sm">₫</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handlePurchase(packageItem)}
                                                disabled={!canAfford || isPurchasing}
                                                className={`px-6 py-3 rounded-xl ${canAfford && !isPurchasing ? 'bg-white' : 'bg-white/50'}`}
                                            >
                                                {isPurchasing ? (
                                                    <ActivityIndicator size="small" color="#3b82f6" />
                                                ) : (
                                                    <Text className={`font-bold ${canAfford ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {t('subscription.purchase')}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </TWLinearGradient>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Alert */}
                <MinimalAlert
                    message={alertMessage}
                    visible={alertVisible}
                    onHide={handleHideAlert}
                    type={alertType}
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 20,
    },
});

