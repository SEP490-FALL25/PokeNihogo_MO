// src/app/(app)/pokemon/[id].tsx
import BackScreen from '@components/molecules/Back';
import GlowingRingEffect from '@components/molecules/GlowingRingEffect';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StatusBar, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_POKEMON } from '../../../../mock-data/pokemon';
// highlight-start
import { TYPE_COLORS, TYPE_MATCHUPS } from '../../../../mock-data/type-matchups';
// highlight-end

// --- Component con ---

// Component Badge cho mỗi Hệ
const TypeBadge = ({ type }: { type: string }) => (
    <View style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] || '#A8A878' }} className="px-3 py-1 rounded-full">
        <Text className="text-white font-bold capitalize text-sm">{type}</Text>
    </View>
);

// Tab Tiến hóa (giữ nguyên)
const EvolutionTab = ({ pokemon }: { pokemon: any }) => {
    // ... (Mã nguồn của component này không đổi)
};

// highlight-start
// Bỏ tab "Chỉ số"
const TABS = ['Giới thiệu', 'Tiến hóa'];
// highlight-end

export default function PokemonDetailScreen() {
    const { id } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Giới thiệu');

    const pokemon = ALL_POKEMON.find((p: any) => p.id.toString() === id);

    if (!pokemon) {
        return <SafeAreaView className="flex-1 bg-slate-900" />;
    }

    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    // Hàm render nội dung cho từng Tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Tiến hóa':
                const evolutionChain = ALL_POKEMON.filter((p: any) => p.evolutionChainId === pokemon.evolutionChainId);
                return (
                    <View className="flex-row items-center justify-center pt-6">
                        {evolutionChain.map((evo: any, index: number) => (
                            <React.Fragment key={evo.id}>
                                <View className="items-center">
                                    <View className="w-24 h-24 bg-slate-700/50 rounded-full items-center justify-center">
                                        <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png` }} className="w-20 h-20" />
                                    </View>
                                    <Text className="text-white font-semibold mt-1">{evo.name}</Text>
                                    {evo.level && <Text className="text-slate-400 text-xs">Lv. {evo.level}</Text>}
                                </View>
                                {index < evolutionChain.length - 1 && <ArrowRight size={24} color="#64748B" className="mx-4" />}
                            </React.Fragment>
                        ))}
                    </View>
                );
            case 'Giới thiệu':
            default:
                const matchups = TYPE_MATCHUPS[pokemon.type as keyof typeof TYPE_MATCHUPS];
                const evolutionChainAll = ALL_POKEMON.filter((p: any) => p.evolutionChainId === pokemon.evolutionChainId);
                const currentIndex = evolutionChainAll.findIndex(p => p.id === pokemon.id);
                const nextEvolution = currentIndex > -1 && currentIndex < evolutionChainAll.length - 1 ? evolutionChainAll[currentIndex + 1] : null;

                return (
                    <View className="gap-y-6">
                        {/* Thông tin tiến hóa */}
                        {nextEvolution && (
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Tiến hóa tiếp theo</Text>
                                <Text className="text-slate-300 text-base">
                                    {pokemon.name} sẽ tiến hóa thành <Text className="font-bold text-white">{nextEvolution.name}</Text> ở <Text className="font-bold text-white">Level {nextEvolution.level}</Text>.
                                </Text>
                            </View>
                        )}

                        {/* Thông tin khắc hệ */}
                        {matchups && (
                            <View>
                                <Text className="font-bold text-white text-lg mb-3">Thông tin khắc hệ</Text>
                                <View className="mb-4">
                                    <Text className="font-semibold text-green-400 mb-2">✅ Khắc chế (Gây thêm sát thương)</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {matchups.strongAgainst.map((type: string) => <TypeBadge key={type} type={type} />)}
                                        {matchups.strongAgainst.length === 0 && <Text className="text-slate-400">Không có</Text>}
                                    </View>
                                </View>
                                <View>
                                    <Text className="font-semibold text-red-400 mb-2">❌ Yếu thế trước (Nhận thêm sát thương)</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {matchups.weakAgainst.map((type: string) => <TypeBadge key={type} type={type} />)}
                                        {matchups.weakAgainst.length === 0 && <Text className="text-slate-400">Không có</Text>}
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" />

            {/* --- Sân khấu chính --- */}
            <View className="flex-1 items-center justify-center">
                <Image source={require('../../../../assets/images/list_pokemon_bg.png')} className="w-80 h-80 absolute opacity-5" />

                <View className="items-center absolute top-0 w-full px-6">
                    <Text className="text-4xl font-bold text-white tracking-wider">{pokemon.name}</Text>
                    <Text className="text-xl font-semibold text-slate-400">#{String(pokemon.id).padStart(3, '0')}</Text>

                    {pokemon.level != null && pokemon.xp != null && (
                        <View className="w-full mt-3">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="font-bold text-white">Lv. {pokemon.level}</Text>
                                <Text className="font-bold text-slate-400">Next Lv.</Text>
                            </View>
                            <Progress.Bar progress={pokemon.xp} width={null} height={8} color={pokemon.platformColor} unfilledColor={'#475569'} borderWidth={0} borderRadius={5} />
                        </View>
                    )}
                </View>

                <View className="w-72 h-72 items-center justify-center">
                    {isLoading && <ActivityIndicator size="large" color={pokemon.platformColor} className="absolute z-20" />}
                    <Image source={{ uri: imageUrl }} className="w-64 h-64 z-10" resizeMode="contain" onLoadEnd={() => setIsLoading(false)} />
                    <View className="w-40 h-8 bg-black/30 rounded-full absolute bottom-8" />
                    <View className="absolute -bottom-20">
                        <GlowingRingEffect color={pokemon.platformColor} ringSize={200} />
                    </View>
                </View>
            </View>

            {/* --- Khu vực thông tin chi tiết --- */}
            <View className="h-[40%] bg-slate-800 rounded-t-3xl p-6">
                <View className="flex-row justify-around mb-6 border-b border-slate-700">
                    {TABS.map((tab: string) => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="pb-3">
                            <Text className={`font-bold text-lg ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>{tab}</Text>
                            {activeTab === tab && <View className="h-1 bg-cyan-400 rounded-full mt-1" />}
                        </TouchableOpacity>
                    ))}
                </View>
                {renderTabContent()}
            </View>
        </SafeAreaView>
    );
}