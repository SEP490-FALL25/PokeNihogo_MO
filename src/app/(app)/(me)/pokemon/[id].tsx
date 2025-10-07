import BackScreen from '@components/molecules/Back';
import GlowingRingEffect from '@components/molecules/GlowingRingEffect';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Award, Shield, Sparkles, Star, Swords, TrendingUp, Zap } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_POKEMON } from '../../../../../mock-data/pokemon';
import { TYPE_COLORS, TYPE_MATCHUPS } from '../../../../../mock-data/type-matchups';

// Enable className on LinearGradient
cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

interface Pokemon {
    id: number;
    name: string;
    type: string;
    level?: number;
    xp?: number;
    platformColor: string;
    evolutionChainId?: number;
}

// Ultra Premium Type Badge with Glow
const TypeBadge = ({ type }: { type: string }) => {
    const color = TYPE_COLORS[type as keyof typeof TYPE_COLORS] || '#A8A878';

    return (
        <View className="relative">
            <TWLinearGradient
                colors={[color, `${color}DD`, `${color}BB`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-[9px] rounded-[14px] shadow-black/30 shadow-md"
            >
                <View className="relative">
                    <Text className="text-white text-[14px] font-extrabold capitalize tracking-[0.8px] drop-shadow">{type}</Text>
                    <View className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white/30 rounded-full" />
                </View>
            </TWLinearGradient>
        </View>
    );
};

// Premium Evolution Chain with Enhanced Design
const EvolutionChain = ({ pokemon }: { pokemon: Pokemon }) => {
    const evolutionChain = ALL_POKEMON.filter(
        (p: any) => p.evolutionChainId === pokemon.evolutionChainId
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
        >
            <View className="flex-row items-center">
                {evolutionChain.map((evo: any, index: number) => (
                    <React.Fragment key={evo.id}>
                        <TouchableOpacity
                            onPress={() => router.push(`/pokemon/${evo.id}`)}
                            activeOpacity={0.8}
                            className="relative"
                        >
                            {/* Outer Glow Effect */}
                            {evo.id === pokemon.id && (
                                <View className="absolute w-full h-full bg-teal-500/50 rounded-3xl shadow-[0_0_20px_rgba(20,184,166,0.6)]" />
                            )}

                            <TWLinearGradient
                                colors={
                                    evo.id === pokemon.id
                                        ? ['#14b8a6', '#0d9488', '#0f766e']
                                        : ['#1e293b', '#334155', '#475569']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-[150px] rounded-3xl p-[18px] items-center overflow-hidden shadow-black/40 shadow-lg"
                            >
                                {/* Multiple Decorative Layers */}
                                <View className="absolute -top-[30px] -right-[30px] w-20 h-20 rounded-[40px] bg-white/10" />
                                <View className="absolute -bottom-5 -left-5 w-15 h-15 rounded-[30px] bg-white/5" />

                                {/* Sparkle Effect for Current */}
                                {evo.id === pokemon.id && (
                                    <>
                                        <View className="absolute w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.8)] top-5 right-5" />
                                        <View className="absolute w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.8)] top-10 left-4" />
                                        <View className="absolute w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.8)] bottom-15 right-4" />
                                    </>
                                )}

                                {/* Pokemon Image with Enhanced Container */}
                                <View className={"w-24 h-24 rounded-[20px] items-center justify-center mb-3.5 overflow-hidden " + (evo.id === pokemon.id ? 'bg-white/15 shadow-[0_4px_8px_rgba(20,184,166,0.4)]' : 'bg-white/10')}>
                                    <View className="absolute w-full h-full bg-teal-500/10" />
                                    <Image
                                        source={{
                                            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`,
                                        }}
                                        style={{ width: 76, height: 76, zIndex: 2 }}
                                    />
                                </View>

                                {/* Info with Enhanced Styling */}
                                <View className="items-center w-full">
                                    <Text className={`text-white text-[16px] font-extrabold capitalize mb-2 tracking-[0.5px] ${evo.id === pokemon.id ? 'text-[17px]' : ''}`} numberOfLines={1}>{evo.name}</Text>
                                    {evo.level && (
                                        <TWLinearGradient
                                            colors={['#fbbf24', '#f59e0b']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="flex-row items-center px-[11px] py-[5px] rounded-[11px] gap-1 shadow-[0_2px_4px_rgba(251,191,36,0.4)]"
                                        >
                                            <Zap size={11} color="white" fill="white" strokeWidth={2.5} />
                                            <Text className="text-white text-[12px] font-extrabold tracking-[0.5px]">Lv. {evo.level}</Text>
                                        </TWLinearGradient>
                                    )}
                                </View>

                                {/* Premium Current Badge */}
                                {evo.id === pokemon.id && (
                                    <TWLinearGradient
                                        colors={['#fbbf24', '#f59e0b']}
                                        className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-full items-center justify-center shadow-[0_3px_6px_rgba(251,191,36,0.5)]"
                                    >
                                        <Star size={12} color="white" fill="white" strokeWidth={2.5} />
                                    </TWLinearGradient>
                                )}
                            </TWLinearGradient>
                        </TouchableOpacity>

                        {/* Enhanced Arrow with Animation */}
                        {index < evolutionChain.length - 1 && (
                            <View className="items-center justify-center mx-4 relative">
                                <View className="w-12 h-[3px] bg-slate-800 rounded" />
                                <TWLinearGradient
                                    colors={['#334155', '#475569']}
                                    className="absolute w-10 h-10 rounded-full items-center justify-center shadow-black/30 shadow-md"
                                >
                                    <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center">
                                        <ArrowRight size={16} color="#14b8a6" strokeWidth={3} />
                                    </View>
                                </TWLinearGradient>
                            </View>
                        )}
                    </React.Fragment>
                ))}
            </View>
        </ScrollView>
    );
};

const TABS = ['Giới thiệu', 'Tiến hóa'];

export default function PokemonDetailScreen() {
    const { id } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Giới thiệu');

    const pokemon = ALL_POKEMON.find((p: any) => p.id.toString() === id);

    if (!pokemon) {
        return (
            <SafeAreaView className="flex-1 bg-slate-900">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white text-[18px] font-semibold">Pokemon not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Tiến hóa':
                return <EvolutionChain pokemon={pokemon} />;

            case 'Giới thiệu':
            default:
                const matchups = TYPE_MATCHUPS[pokemon.type as keyof typeof TYPE_MATCHUPS];
                const evolutionChainAll = ALL_POKEMON.filter(
                    (p: any) => p.evolutionChainId === pokemon.evolutionChainId
                );
                const currentIndex = evolutionChainAll.findIndex((p) => p.id === pokemon.id);
                const nextEvolution =
                    currentIndex > -1 && currentIndex < evolutionChainAll.length - 1
                        ? evolutionChainAll[currentIndex + 1]
                        : null;

                return (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    >
                        {/* Ultra Premium Next Evolution Card */}
                        {nextEvolution && (
                            <View className="relative mb-6">
                                <View className="absolute w-full h-full bg-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                <TWLinearGradient
                                    colors={['#1e293b', '#334155', '#475569']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-2xl p-6 overflow-hidden shadow-black/40 shadow-lg"
                                >
                                    {/* Decorative Elements */}
                                    <View className="absolute w-40 h-40 rounded-[80px] bg-emerald-500/10 -top-15 -right-15" />
                                    <View className="absolute w-25 h-25 rounded-[50px] bg-emerald-500/6 -bottom-7 -left-7" />
                                    <View className="absolute w-15 h-15 rounded-[30px] bg-emerald-500/5 top-10 left-5" />

                                    <View className="flex-row items-center mb-5">
                                        <TWLinearGradient
                                            colors={['#10b981', '#059669']}
                                            className="w-[42px] h-[42px] rounded-[14px] items-center justify-center mr-3 shadow-[0_3px_6px_rgba(16,185,129,0.4)]"
                                        >
                                            <TrendingUp size={20} color="white" strokeWidth={2.8} />
                                        </TWLinearGradient>
                                        <Text className="flex-1 text-[19px] font-black text-white tracking-[0.3px]">Tiến hóa tiếp theo</Text>
                                        <View className="w-8 h-8 rounded-2xl bg-emerald-500/20 items-center justify-center">
                                            <Sparkles size={14} color="#10b981" strokeWidth={2.5} />
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-[18px]">
                                        <TWLinearGradient
                                            colors={['#0f172a', '#1e293b']}
                                            className="w-[100px] h-[100px] rounded-[20px] items-center justify-center relative overflow-hidden shadow-[0_4px_8px_rgba(16,185,129,0.3)]"
                                        >
                                            <View className="absolute w-full h-full bg-emerald-500/10" />
                                            <Image
                                                source={{
                                                    uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nextEvolution.id}.png`,
                                                }}
                                                style={{ width: 80, height: 80, zIndex: 2 }}
                                            />
                                        </TWLinearGradient>

                                        <View className="flex-1">
                                            <Text className="text-[14px] font-semibold text-slate-300 leading-5 tracking-[0.2px] mb-2">
                                                {pokemon.name} sẽ tiến hóa thành
                                            </Text>
                                            <Text className="text-[22px] font-black text-white tracking-[0.5px] mb-2 capitalize">{nextEvolution.name}</Text>
                                            <View className="items-start">
                                                <TWLinearGradient
                                                    colors={['#fbbf24', '#f59e0b']}
                                                    className="flex-row items-center px-3 py-1.5 rounded-xl gap-1 shadow-[0_3px_6px_rgba(251,191,36,0.4)]"
                                                >
                                                    <Zap size={14} color="white" fill="white" strokeWidth={2.5} />
                                                    <Text className="text-[14px] font-black text-white tracking-[0.5px]">Level {nextEvolution.level}</Text>
                                                </TWLinearGradient>
                                            </View>
                                        </View>
                                    </View>
                                </TWLinearGradient>
                            </View>
                        )}

                        {/* Ultra Premium Type Matchups */}
                        {matchups && (
                            <View className="gap-5">
                                <View className="flex-row items-center mb-3">
                                    <TWLinearGradient
                                        colors={['#6FAFB2', '#7EC5C8']}
                                        className="w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3 shadow-[0_3px_6px_rgba(111,175,178,0.4)]"
                                    >
                                        <Shield size={22} color="white" strokeWidth={2.8} />
                                    </TWLinearGradient>
                                    <Text className="flex-1 text-[19px] font-black text-white tracking-[0.3px]">Thông tin khắc hệ</Text>
                                    <View className="w-8 h-8 rounded-2xl bg-[#6FAFB233] items-center justify-center">
                                        <Award size={16} color="#6FAFB2" strokeWidth={2.5} />
                                    </View>
                                </View>

                                {/* Strong Against - Ultra Premium */}
                                <View className="relative">
                                    <View className="absolute w-full h-full rounded-[22px] shadow-[0_0_16px_rgba(16,185,129,0.5)]" style={{ backgroundColor: '#10b98155' }} />
                                    <TWLinearGradient
                                        colors={['#064e3b', '#065f46', '#047857']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="rounded-[22px] p-5 overflow-hidden shadow-black/35 shadow-md"
                                    >
                                        {/* Decorative Elements */}
                                        <View className="absolute w-30 h-30 rounded-[60px] -top-10 -right-10" style={{ backgroundColor: '#10b98120' }} />
                                        <View className="absolute w-20 h-20 rounded-[40px] -bottom-5 -left-5" style={{ backgroundColor: '#10b98115' }} />

                                        <View className="flex-row items-center mb-4">
                                            <TWLinearGradient
                                                colors={['#10b981', '#059669']}
                                                className="w-[38px] h-[38px] rounded-[12px] items-center justify-center mr-3 shadow-black/20 shadow"
                                            >
                                                <Swords size={18} color="white" strokeWidth={2.8} />
                                            </TWLinearGradient>
                                            <View className="flex-1">
                                                <Text className="text-[17px] font-black text-white tracking-[0.3px] mb-0.5">Khắc chế</Text>
                                                <Text className="text-[12px] font-semibold text-white/70 tracking-[0.2px]">Gây thêm sát thương</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row flex-wrap gap-2.5">
                                            {matchups.strongAgainst.length > 0 ? (
                                                matchups.strongAgainst.map((type: string) => (
                                                    <TypeBadge key={type} type={type} />
                                                ))
                                            ) : (
                                                <Text className="text-[14px] font-semibold text-slate-500 italic">Không có</Text>
                                            )}
                                        </View>
                                    </TWLinearGradient>
                                </View>

                                {/* Weak Against - Ultra Premium */}
                                <View className="relative">
                                    <View className="absolute w-full h-full rounded-[22px] shadow-[0_0_16px_rgba(239,68,68,0.5)]" style={{ backgroundColor: '#ef444455' }} />
                                    <TWLinearGradient
                                        colors={['#7f1d1d', '#991b1b', '#b91c1c']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="rounded-[22px] p-5 overflow-hidden shadow-black/35 shadow-md"
                                    >
                                        {/* Decorative Elements */}
                                        <View className="absolute w-30 h-30 rounded-[60px] -top-10 -right-10" style={{ backgroundColor: '#ef444420' }} />
                                        <View className="absolute w-20 h-20 rounded-[40px] -bottom-5 -left-5" style={{ backgroundColor: '#ef444415' }} />

                                        <View className="flex-row items-center mb-4">
                                            <TWLinearGradient
                                                colors={['#ef4444', '#dc2626']}
                                                className="w-[38px] h-[38px] rounded-[12px] items-center justify-center mr-3 shadow-black/20 shadow"
                                            >
                                                <Shield size={18} color="white" strokeWidth={2.8} />
                                            </TWLinearGradient>
                                            <View className="flex-1">
                                                <Text className="text-[17px] font-black text-white tracking-[0.3px] mb-0.5">Yếu thế trước</Text>
                                                <Text className="text-[12px] font-semibold text-white/70 tracking-[0.2px]">Nhận thêm sát thương</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row flex-wrap gap-2.5">
                                            {matchups.weakAgainst.length > 0 ? (
                                                matchups.weakAgainst.map((type: string) => (
                                                    <TypeBadge key={type} type={type} />
                                                ))
                                            ) : (
                                                <Text className="text-[14px] font-semibold text-slate-500 italic">Không có</Text>
                                            )}
                                        </View>
                                    </TWLinearGradient>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" />

            {/* Ultra Premium Hero Section */}
            <TWLinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 items-center justify-center relative overflow-hidden"
            >
                {/* Multiple Background Layers */}
                <View className="absolute w-[300px] h-[300px] rounded-full bg-[#6FAFB233] -top-25 -right-25" />
                <View className="absolute w-[200px] h-[200px] rounded-full bg-[#7EC5C826] -bottom-12 -left-12" />
                <View className="absolute w-[150px] h-[150px] rounded-full bg-[#6FAFB21A] top-[150px] -left-[75px]" />

                {/* Background Pattern with Opacity */}
                <Image
                    source={require('../../../../../assets/images/list_pokemon_bg.png')}
                    style={{ width: 360, height: 360, position: 'absolute', opacity: 0.03 }}
                />

                {/* Pokemon Info Header */}
                <View className="absolute top-0 w-full px-6 z-10">
                    <View className="items-center mb-5">
                        <Text className="text-[42px] font-black text-white tracking-[1.5px] capitalize drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)] mb-3">{pokemon.name}</Text>
                        <TWLinearGradient
                            colors={['#6FAFB2', '#7EC5C8']}
                            className="px-5 py-2 rounded-2xl shadow-[#6FAFB2]/40 shadow-md"
                        >
                            <Text className="text-[18px] font-extrabold text-white tracking-[1.5px]">#{String(pokemon.id).padStart(3, '0')}</Text>
                        </TWLinearGradient>
                    </View>

                    {/* Enhanced Level Progress */}
                    {pokemon.level != null && pokemon.xp != null && (
                        <View className="w-full">
                            <View className="flex-row justify-between items-center mb-2.5">
                                <TWLinearGradient
                                    colors={['#fbbf24', '#f59e0b']}
                                    className="flex-row items-center px-[14px] py-2 rounded-[14px] gap-1.5 shadow-[0_3px_6px_rgba(251,191,36,0.4)]"
                                >
                                    <Zap size={14} color="white" fill="white" strokeWidth={2.5} />
                                    <Text className="text-[15px] font-black text-white tracking-[0.8px]">Lv. {pokemon.level}</Text>
                                </TWLinearGradient>
                                <Text className="text-[14px] font-bold text-slate-400 tracking-[0.5px]">Next Level</Text>
                            </View>
                            <View className="relative">
                                <View className="absolute w-full h-3 bg-[#6FAFB2] opacity-30 rounded-[6px] shadow-[0_0_8px_rgba(111,175,178,0.6)]" />
                                <Progress.Bar
                                    progress={pokemon.xp}
                                    width={null}
                                    height={12}
                                    color={pokemon.platformColor}
                                    unfilledColor={'#1e293b'}
                                    borderWidth={0}
                                    borderRadius={6}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Pokemon Image with Multiple Effects */}
                <View className="w-[300px] h-[300px] items-center justify-center relative">
                    {isLoading && (
                        <ActivityIndicator
                            size="large"
                            color={pokemon.platformColor}
                            style={{ position: 'absolute', zIndex: 20 }}
                        />
                    )}

                    {/* Multiple Shadow Layers */}
                    <View className="w-[180px] h-9 bg-black/40 rounded-[90px] absolute bottom-5 shadow-black/60 shadow-2xl" />
                    <View className="w-[140px] h-7 bg-black/20 rounded-[70px] absolute bottom-[18px] shadow-black/40 shadow-lg" />

                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 280, height: 280, zIndex: 10 }}
                        resizeMode="contain"
                        onLoadEnd={() => setIsLoading(false)}
                    />

                    {/* Enhanced Glowing Ring */}
                    <View className="absolute -bottom-[90px]">
                        <GlowingRingEffect color={pokemon.platformColor} ringSize={220} />
                    </View>
                </View>
            </TWLinearGradient>

            {/* Details Section */}
            <TWLinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="h-[42%] rounded-t-[36px] pt-7 px-6 shadow-black/40 shadow-2xl"
            >
                {/* Premium Tabs */}
                <View className="flex-row justify-around mb-6 border-b-2 border-slate-800">
                    {TABS.map((tab: string) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className="pb-[14px] relative"
                            activeOpacity={0.7}
                        >
                            <View className={`flex-row items-center ${activeTab === tab ? 'gap-2' : 'gap-1.5'}`}>
                                <Text
                                    className={`text-[17px] font-bold tracking-[0.5px] ${activeTab === tab ? 'text-white font-extrabold' : 'text-slate-500'}`}
                                >
                                    {tab}
                                </Text>
                                {activeTab === tab && (
                                    <View className="w-[22px] h-[22px] rounded-[11px] bg-[#6FAFB233] items-center justify-center">
                                        <Sparkles size={14} color="#6FAFB2" strokeWidth={2.5} />
                                    </View>
                                )}
                            </View>
                            {activeTab === tab && (
                                <TWLinearGradient
                                    colors={['#6FAFB2', '#7EC5C8', '#6FAFB2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="absolute -bottom-0.5 left-0 right-0 h-1 rounded"
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                <View className="flex-1">{renderTabContent()}</View>
            </TWLinearGradient>
        </SafeAreaView>
    );
}
