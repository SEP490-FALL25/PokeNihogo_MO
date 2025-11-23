import { TWLinearGradient } from '@components/atoms/TWLinearGradient';
import BackScreen from '@components/molecules/Back';
import GlowingRingEffect from '@components/molecules/GlowingRingEffect';
import { EvolutionPaths } from '@components/pokemon-detail/evolution-paths';
import { OwnershipBadge } from '@components/pokemon-detail/ownership-badge';
import { TypeBadge } from '@components/pokemon-detail/typebage';
import { useGetPokemonByIdWithEvolechain } from '@hooks/useUserPokemon';
import { IEvolutionPokemonSchema } from '@models/pokemon/pokemon.response';
import { router, useLocalSearchParams } from 'expo-router';
import { Award, Shield, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['intro', 'evolution'] as const;

export default function PokemonDetailScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('intro');
    const { data, isLoading, isError } = useGetPokemonByIdWithEvolechain(String(id));

    const detail = data as IEvolutionPokemonSchema | undefined;
    const pokemon = detail?.pokemon;

    const primaryColor = pokemon?.types?.[0]?.color_hex || '#6FAFB2';

    const displayName = useMemo(() => {
        if (!pokemon) return '';
        return pokemon.nameTranslations?.en;
    }, [pokemon]);

    const imageUrl = pokemon?.imageUrl || (pokemon?.pokedex_number ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokedex_number}.png` : undefined);

    const levelInfo = detail?.level;
    const expRequired = levelInfo?.requiredExp ?? 0;
    const currentExp = detail?.exp ?? 0;
    const expProgress = expRequired > 0 ? Math.min(currentExp / expRequired, 1) : 0;

    const nickname = detail?.nickname;

    const renderTabContent = () => {
        if (!pokemon) return null;

        if (activeTab === 'evolution') {
            return (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                    <EvolutionPaths pokemon={pokemon} />
                </ScrollView>
            );
        }

        const nextEvolution = pokemon.nextPokemons && pokemon.nextPokemons.length > 0 ? pokemon.nextPokemons[0] : undefined;

        return (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {nextEvolution && (
                    <View className="relative mb-6">
                        <View className="absolute w-full h-full bg-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                        <TWLinearGradient
                            colors={['#1e293b', '#334155', '#475569']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-6 overflow-hidden shadow-black/40 shadow-lg"
                        >
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
                                <Text className="flex-1 text-[19px] font-black text-white tracking-[0.3px]">{t('pokemon_detail.next_evolution_title')}</Text>
                                <OwnershipBadge owned={nextEvolution?.userPokemon} />
                            </View>

                            <View className="flex-row items-center gap-[18px]">
                                <TWLinearGradient
                                    colors={['#0f172a', '#1e293b']}
                                    className="w-[100px] h-[100px] rounded-[20px] items-center justify-center relative overflow-hidden shadow-[0_4px_8px_rgba(16,185,129,0.3)]"
                                >
                                    <View className="absolute w-full h-full bg-emerald-500/10" />
                                    <Image
                                        source={{
                                            uri:
                                                nextEvolution.imageUrl ||
                                                (nextEvolution.pokedex_number
                                                    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nextEvolution.pokedex_number}.png`
                                                    : undefined),
                                        }}
                                        style={{ width: 80, height: 80, zIndex: 2 }}
                                        resizeMode="contain"
                                    />
                                </TWLinearGradient>

                                <View className="flex-1">
                                    <Text className="text-[14px] font-semibold text-slate-300 leading-5 tracking-[0.2px] mb-2">
                                        {displayName} {t('pokemon_detail.can_evolve_to')}
                                    </Text>
                                    <Text className="text-[22px] font-black text-white tracking-[0.5px] mb-2 capitalize">
                                        {nextEvolution.nameTranslations.en}
                                    </Text>
                                </View>
                            </View>
                        </TWLinearGradient>
                    </View>
                )}

                {pokemon.weaknesses && pokemon.weaknesses.length > 0 && (
                    <View className="gap-5">
                        <View className="flex-row items-center mb-3">
                            <TWLinearGradient
                                colors={['#6FAFB2', '#7EC5C8']}
                                className="w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3 shadow-[0_3px_6px_rgba(111,175,178,0.4)]"
                            >
                                <Shield size={22} color="white" strokeWidth={2.8} />
                            </TWLinearGradient>
                            <Text className="flex-1 text-[19px] font-black text-white tracking-[0.3px]">{t('pokemon_detail.weakness_section.title')}</Text>
                            <View className="w-8 h-8 rounded-2xl bg-[#6FAFB233] items-center justify-center">
                                <Award size={16} color="#6FAFB2" strokeWidth={2.5} />
                            </View>
                        </View>

                        <View className="relative">
                            <View className="absolute w-full h-full rounded-[22px] shadow-[0_0_16px_rgba(239,68,68,0.5)]" style={{ backgroundColor: '#ef444455' }} />
                            <TWLinearGradient
                                colors={['#7f1d1d', '#991b1b', '#b91c1c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-[22px] p-5 overflow-hidden shadow-black/35 shadow-md"
                            >
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
                                        <Text className="text-[17px] font-black text-white tracking-[0.3px] mb-0.5">{t('pokemon_detail.weakness_section.weak_against')}</Text>
                                        <Text className="text-[12px] font-semibold text-white/70 tracking-[0.2px]">{t('pokemon_detail.weakness_section.takes_more_damage')}</Text>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-2.5">
                                    {pokemon.weaknesses?.map((w) => (
                                        <TypeBadge key={w.id} label={w.display_name?.vi || w.display_name?.en || w.type_name} color={w.color_hex} />
                                    ))}
                                </View>
                            </TWLinearGradient>
                        </View>
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" />

            <TWLinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 items-center justify-center relative overflow-hidden"
            >
                <View className="absolute w-[300px] h-[300px] rounded-full bg-[#6FAFB233] -top-25 -right-25" />
                <View className="absolute w-[200px] h-[200px] rounded-full bg-[#7EC5C826] -bottom-12 -left-12" />
                <View className="absolute w-[150px] h-[150px] rounded-full bg-[#6FAFB21A] top-[150px] -left-[75px]" />

                <Image
                    source={require('../../../../../assets/images/list_pokemon_bg.png')}
                    style={{ width: 360, height: 360, position: 'absolute', opacity: 0.03 }}
                />

                <View className="absolute top-0 w-full px-6 z-10">
                    <View className="items-center mb-5">
                        <Text className="text-[42px] font-black text-white tracking-[1.5px] capitalize drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)] mb-3">
                            {displayName}
                        </Text>
                        {pokemon && (
                            <TWLinearGradient
                                colors={['#6FAFB2', '#7EC5C8']}
                                className="px-5 py-2 rounded-2xl shadow-[#6FAFB2]/40 shadow-md"
                            >
                                <Text className="text-[18px] font-extrabold text-white tracking-[1.5px]">
                                    #{String(pokemon.pokedex_number || pokemon.id || '').padStart(3, '0')}
                                </Text>
                            </TWLinearGradient>
                        )}
                    </View>
                </View>

                <View className="w-[300px] h-[300px] items-center justify-center relative top-10">
                    {(isLoading || !pokemon) && (
                        <ActivityIndicator size="large" color={primaryColor} style={{ position: 'absolute', zIndex: 20 }} />
                    )}

                    <View className="w-[180px] h-9 bg-black/40 rounded-[90px] absolute bottom-5 shadow-black/60 shadow-2xl" />
                    <View className="w-[140px] h-7 bg-black/20 rounded-[70px] absolute bottom-[18px] shadow-black/40 shadow-lg" />

                    {imageUrl && (
                        <Image
                            source={{ uri: imageUrl }}
                            style={{ width: 250, height: 250, zIndex: 10 }}
                            resizeMode="contain"
                        />
                    )}

                    <View className="absolute -bottom-[75px]">
                        <GlowingRingEffect color={primaryColor} ringSize={220} />
                    </View>
                </View>
            </TWLinearGradient>

            <TWLinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="h-[42%] rounded-t-[36px] pt-7 px-6 shadow-black/40 shadow-2xl"
            >
                <View className="flex-row justify-around mb-6 border-b-2 border-slate-800">
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className="pb-[14px] relative"
                            activeOpacity={0.7}
                        >
                            <View className={`flex-row items-center pl-2 pr-1 pb-1.5 ${activeTab === tab ? 'gap-2' : 'gap-1.5'}`}>
                                <Text className={`text-[17px] font-bold tracking-[0.5px] ${activeTab === tab ? 'text-white font-extrabold' : 'text-slate-500'}`}>
                                    {tab === 'intro' ? t('pokemon_detail.tabs.intro') : t('pokemon_detail.tabs.evolution')}
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

                <View className="flex-1">
                    {isError ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-white">{t('pokemon_detail.load_error')}</Text>
                        </View>
                    ) : isLoading || !pokemon ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="small" color={primaryColor} />
                        </View>
                    ) : (
                        renderTabContent()
                    )}
                </View>
            </TWLinearGradient>
        </SafeAreaView>
    );
}