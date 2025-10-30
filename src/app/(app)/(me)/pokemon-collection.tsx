import BackScreen from '@components/molecules/Back';
import PokemonGridItem from '@components/Organism/PokemonGridItem';
import { Skeleton } from '@components/ui/Skeleton';
import { useGetUserPokemonStats, useInfiniteUserPokemons } from '@hooks/useUserPokemon';
import { IUserPokemonResponse } from '@models/user-pokemon/user-pokemon.response';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Search, Trophy } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;

export default function PokemonCollectionScreen() {
    /**
     * Handle use Hook useListUserPokemons
     */
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');
    const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 350);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteUserPokemons({
        pageSize: 15,
        sortBy: 'id',
        sortOrder: 'asc' as 'asc' | 'desc',
        search: debouncedQuery || undefined,
        hasPokemon:
            ownershipFilter === 'owned'
                ? true
                : ownershipFilter === 'unowned'
                    ? false
                    : undefined,
    });
    const flattenedPokemons = useMemo(
        () => (data?.pages ?? []).flatMap((p: any) => p?.data?.data?.results ?? []),
        [data]
    );
    const resultsCount = flattenedPokemons.length;
    //------------------------End------------------------//


    /**
     * Handle use Hook useGetUserPokemonStats
     */
    const { data: collectionStats, isLoading: isLoadingCollectionStats, isError: isErrorCollectionStats } = useGetUserPokemonStats();
    //------------------------End------------------------//

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <BackScreen onPress={() => router.back()} color='black' title='Pokémon' />

            {/* Collection Stats Card */}
            <View className="px-4 pt-2 pb-3">
                <LinearGradient
                    colors={['#6FAFB2', '#538f91']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statsCard}
                    className="rounded-3xl p-5 overflow-hidden shadow-lg"
                >
                    {/* Decorative circles */}
                    <View className="absolute w-30 h-30 rounded-full bg-white/10" />
                    <View className="absolute w-20 h-20 rounded-full bg-white/8" />

                    {!isLoadingCollectionStats && !isErrorCollectionStats ? (
                        <>
                            <View className="flex-row items-center mb-4">
                                <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center mr-3.5">
                                    <Trophy size={28} color="white" strokeWidth={2.5} />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-lg font-extrabold text-white mb-1 tracking-tight">Bộ sưu tập của bạn</Text>
                                    <Text className="text-sm font-semibold text-white/90 tracking-wide">
                                        {collectionStats?.userPokemonsCount} / {collectionStats?.totalPokemons} Pokémon
                                    </Text>
                                </View>

                                <View className="bg-white/25 px-4 py-2 rounded-2xl">
                                    <Text className="text-xl font-extrabold text-white tracking-tight">
                                        {collectionStats?.ownershipPercentage}%
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View className="mt-1">
                                <View className="h-2 bg-white/25 rounded-sm overflow-hidden">
                                    <LinearGradient
                                        colors={['#10b981', '#059669']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${collectionStats?.ownershipPercentage ?? 0}%` }
                                        ]}
                                        className="h-full rounded-sm"
                                    />
                                </View>
                            </View>
                        </>
                    ) : isLoadingCollectionStats || isErrorCollectionStats ? (
                        <>
                            <View className="flex-row items-center mb-4">
                                <Skeleton style={{ width: 56, height: 56, borderRadius: 16, marginRight: 14 }} />
                                <View className="flex-1">
                                    <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                                    <Skeleton className="h-4 w-1/2 rounded" />
                                </View>
                                <Skeleton style={{ width: 64, height: 28, borderRadius: 14 }} />
                            </View>
                            <Skeleton className="h-2 w-full rounded" />
                        </>
                    ) : null}
                </LinearGradient>
            </View>

            {/* Search and collection area */}
            <View className="flex-1 px-4">
                {/* Ownership Filter Buttons */}
                <View className="flex-row justify-between mb-3">
                    <Pressable
                        className={`flex-1 px-4 py-2 rounded-2xl mr-2 ${ownershipFilter === 'all' ? 'bg-teal-500' : 'bg-slate-200'}`}
                        onPress={() => setOwnershipFilter('all')}
                    >
                        <Text className={`text-center font-bold ${ownershipFilter === 'all' ? 'text-white' : 'text-teal-700'}`}>Tất cả</Text>
                    </Pressable>
                    <Pressable
                        className={`flex-1 px-4 py-2 rounded-2xl mr-2 ${ownershipFilter === 'owned' ? 'bg-teal-500' : 'bg-slate-200'}`}
                        onPress={() => setOwnershipFilter('owned')}
                    >
                        <Text className={`text-center font-bold ${ownershipFilter === 'owned' ? 'text-white' : 'text-teal-700'}`}>Đã sở hữu</Text>
                    </Pressable>
                    <Pressable
                        className={`flex-1 px-4 py-2 rounded-2xl ${ownershipFilter === 'unowned' ? 'bg-teal-500' : 'bg-slate-200'}`}
                        onPress={() => setOwnershipFilter('unowned')}
                    >
                        <Text className={`text-center font-bold ${ownershipFilter === 'unowned' ? 'text-white' : 'text-teal-700'}`}>Chưa có</Text>
                    </Pressable>
                </View>
                {/* Enhanced Search Bar */}
                <View className="mb-3">
                    <LinearGradient
                        colors={['#ffffff', '#fefefe']}
                        style={styles.searchBar}
                    >
                        <View className="w-9 h-9 rounded-xl bg-teal-50 items-center justify-center mr-3">
                            <Search size={20} color="#6FAFB2" strokeWidth={2.5} />
                        </View>
                        <TextInput
                            placeholder="Tìm kiếm theo tên hoặc số thứ tự..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 text-base font-semibold text-slate-800 tracking-wide"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable
                                onPress={() => setSearchQuery('')}
                                className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                            >
                                <Text className="text-base font-bold text-slate-500">✕</Text>
                            </Pressable>
                        )}
                    </LinearGradient>
                </View>

                {/* Results count */}
                {debouncedQuery.length > 0 && (
                    <Text className="text-sm font-bold text-slate-500 mb-3 ml-1 tracking-wide">
                        Tìm thấy {resultsCount} kết quả
                    </Text>
                )}

                {/* Pokemon grid */}
                {isLoading ? (
                    <FlatList
                        data={Array.from({ length: 9 }, (_, i) => i)}
                        numColumns={3}
                        keyExtractor={(item) => `skeleton-${item}`}
                        renderItem={() => (
                            <Skeleton
                                style={{ width: CARD_SIZE, height: CARD_SIZE, borderRadius: 20 }}
                                className="mb-3"
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={styles.gridRow}
                        className="pb-6"
                    />
                ) : isError ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-slate-500 font-semibold">Không thể tải dữ liệu Pokémon</Text>
                    </View>
                ) : (
                    <FlatList
                        data={flattenedPokemons}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }: { item: IUserPokemonResponse }) => <PokemonGridItem item={item} />}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={styles.gridRow}
                        className="pb-6"
                        onEndReachedThreshold={0.4}
                        onEndReached={() => {
                            if (hasNextPage && !isFetchingNextPage) {
                                fetchNextPage();
                            }
                        }}
                        refreshing={isLoading}
                        onRefresh={() => refetch()}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <View className="py-3">
                                    <ActivityIndicator size="large" color="#929898" />
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Stats Card
    statsCard: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        shadowColor: '#6FAFB2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },

    // Search Bar - Complex shadow styles
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },

    // Grid
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});