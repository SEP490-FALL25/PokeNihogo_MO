import MinimalAlert from "@components/atoms/MinimalAlert";
import RarityBackground, { getRarityBorderColor } from "@components/atoms/RarityBackground";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShopPurchase } from "@hooks/useShopPurchase";
import { createShopPurchaseRequest, IShopPurchaseRequest } from "@models/shop-purchase/shop-purchase.request";
import { IShopItemRandomTodayResponseSchema } from "@models/shop/shop.response";
import { Sparkles } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ShopItemCapsuleProps {
    item: IShopItemRandomTodayResponseSchema;
    userPoints: number;
    exchangeLabel: string;
}

const ShopItemCapsule = ({ item, userPoints, exchangeLabel }: ShopItemCapsuleProps) => {
    const { t } = useTranslation();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

    const canAfford = userPoints >= item.price && item.canBuy;
    const pokemonName = item.pokemon.nameTranslations.en || item.pokemon.nameJp;
    const borderColor = getRarityBorderColor(item.pokemon.rarity);

    // Initialize form with react-hook-form using existing schema
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<IShopPurchaseRequest>({
        resolver: zodResolver(createShopPurchaseRequest),
        defaultValues: {
            shopItemId: item.id,
            quantity: 1,
        },
        mode: 'onChange',
    });

    const { mutate: purchaseItem } = useShopPurchase();

    const handleHideAlert = useCallback(() => {
        setAlertVisible(false);
    }, []);

    const handlePurchase = handleSubmit(async () => {
        if (!item.canBuy) {
            setAlertMessage(t('reward_shop.already_owned'));
            setAlertType('warning');
            setAlertVisible(true);
            return;
        }

        if (!canAfford) {
            setAlertMessage(t('reward_shop.insufficient_points'));
            setAlertType('error');
            setAlertVisible(true);
            return;
        }

        purchaseItem(
            { shopItemId: item.id, quantity: 1 },
            {
                onSuccess: (data) => {
                    setAlertMessage(data.data.message || t('reward_shop.purchase_success'));
                    setAlertType('success');
                    setAlertVisible(true);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || t('reward_shop.purchase_failed');
                    setAlertMessage(errorMessage);
                    setAlertType('error');
                    setAlertVisible(true);
                },
            }
        );
    });

    return (
        <View className="w-1/2 p-2">
            <View className="bg-white border-2 rounded-3xl shadow-lg overflow-hidden" style={{ borderColor }}>
                <RarityBackground rarity={item.pokemon.rarity} className="border-0 rounded-t-3xl">
                    <Image
                        source={{ uri: item.pokemon.imageUrl }}
                        className="w-24 h-24"
                        style={{ resizeMode: 'contain' }}
                    />
                </RarityBackground>

                {/* Phần thông tin */}
                <View className="p-3" style={{ borderTopWidth: 1, borderTopColor: borderColor + '40' }}>
                    <Text className="text-slate-800 font-bold text-lg text-center" numberOfLines={1}>{item.pokemon.nameJp}</Text>
                    <Text className="text-slate-500 text-xs text-center mt-0.5" numberOfLines={1}>{pokemonName}</Text>
                    <View className="flex-row items-center justify-center my-2">
                        <Text className="text-amber-500 font-bold text-base mr-1">{item.price.toLocaleString()}</Text>
                        <Sparkles size={16} color="#f59e0b" />
                    </View>
                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={!canAfford || !item.canBuy || isSubmitting}
                    >
                        <TWLinearGradient
                            colors={canAfford && item.canBuy && !isSubmitting ? ['#0ed557db', '#03a940d9'] : ['#e2e8f0', '#cbd5e1']}
                            className="px-4 py-2.5 rounded-xl"
                        >
                            <Text className={`font-bold text-center ${canAfford && item.canBuy && !isSubmitting ? 'text-white' : 'text-slate-500'}`}>
                                {isSubmitting
                                    ? t('common.loading') || 'Loading...'
                                    : !item.canBuy
                                        ? t('reward_shop.already_owned')
                                        : exchangeLabel}
                            </Text>
                        </TWLinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Minimal Alert */}
            <MinimalAlert
                message={alertMessage}
                visible={alertVisible}
                onHide={handleHideAlert}
                type={alertType}
            />
        </View>
    );
};

export default ShopItemCapsule;
