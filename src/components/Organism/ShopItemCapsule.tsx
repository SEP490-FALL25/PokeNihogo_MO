import MinimalAlert from "@components/atoms/MinimalAlert";
import RarityBackground, { getRarityBorderColor } from "@components/atoms/RarityBackground";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { IShopItemRandomTodayResponseSchema } from "@models/shop/shop.response";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ShopItemCapsuleProps {
    item: IShopItemRandomTodayResponseSchema;
    userPoints: number;
    exchangeLabel: string;
}

const ShopItemCapsule = ({ item, userPoints, exchangeLabel }: ShopItemCapsuleProps) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

    const canAfford = userPoints >= item.price && item.canBuy;
    const pokemonName = item.pokemon.nameTranslations.en || item.pokemon.nameJp;
    const borderColor = getRarityBorderColor(item.pokemon.rarity);

    const handlePurchase = () => {
        if (!canAfford) {
            setAlertMessage('Không đủ điểm để đổi!');
            setAlertType('error');
            setAlertVisible(true);
            return;
        }

        console.log('Purchase item:', item);

        // Test success message
        setAlertMessage(`Đã đổi thành công: ${item.pokemon.nameJp}!`);
        setAlertType('success');
        setAlertVisible(true);
    };

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
                        disabled={!canAfford}
                    >
                        <TWLinearGradient
                            colors={canAfford ? ['#0ed557db', '#03a940d9'] : ['#e2e8f0', '#cbd5e1']}
                            className="px-4 py-2.5 rounded-xl"
                        >
                            <Text className={`font-bold text-center ${canAfford ? 'text-white' : 'text-slate-500'}`}>{exchangeLabel}</Text>
                        </TWLinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Minimal Alert */}
            <MinimalAlert
                message={alertMessage}
                visible={alertVisible}
                onHide={() => setAlertVisible(false)}
                type={alertType}
            />
        </View>
    );
};

export default ShopItemCapsule;