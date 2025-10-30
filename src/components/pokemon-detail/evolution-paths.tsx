import { IEvolutionPokemonEntityType } from "@models/pokemon/pokemon.entity";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { EvolutionCard } from "./evolution-card";

export const EvolutionPaths = ({ pokemon }: { pokemon: IEvolutionPokemonEntityType }) => {
    const handleNavigate = (targetId: number) => {
        if (targetId === pokemon.id) return;
        router.push(`/pokemon/${targetId}`);
    };

    const prevs = pokemon.previousPokemons ?? [];
    const nexts = pokemon.nextPokemons ?? [];
    return (
        <View style={{ width: '100%', alignItems: 'center', marginTop: 12, marginBottom: 24 }}>
            {/* Tiến hóa trước */}
            {prevs.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2, gap: 16 }} style={{ minHeight: 84 }}>
                    {prevs.map((p: IEvolutionPokemonEntityType) => (
                        <EvolutionCard key={p.id} entity={p} isCurrent={false} onPress={handleNavigate} />
                    ))}
                </ScrollView>
            )}
            {/* Mũi tên xuống prev -> current */}
            {prevs.length > 0 && (
                <ArrowRight style={{ transform: [{ rotate: '90deg' }], marginVertical: 6 }} color="#38bdf8" size={22} />
            )}

            <EvolutionCard entity={pokemon} isCurrent onPress={handleNavigate} />

            {/* Mũi tên xuống current -> next */}
            {nexts.length > 0 && (
                <ArrowRight style={{ transform: [{ rotate: '90deg' }], marginVertical: 10, alignSelf: 'center' }} color="#38bdf8" size={24} />
            )}

            {/* Các nhánh tiến hóa tiếp theo */}
            {nexts.length > 0 && (
                nexts.length === 1 ? (
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <EvolutionCard entity={nexts[0]} isCurrent={false} onPress={handleNavigate} />
                        {Array.isArray(nexts[0].nextPokemons) && nexts[0].nextPokemons.length > 0 && (
                            <>
                                <ArrowRight style={{ transform: [{ rotate: '90deg' }], marginVertical: 6 }} color="#38bdf8" size={15} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'flex-start' }}>
                                    {nexts[0].nextPokemons.map((subn: IEvolutionPokemonEntityType) => (
                                        <EvolutionCard key={subn.id} entity={subn} isCurrent={false} onPress={handleNavigate} />
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2, gap: 18, alignItems: 'flex-start', paddingHorizontal: 12 }} style={{ minHeight: 88, width: '100%' }}>
                        {nexts.map((nxt: IEvolutionPokemonEntityType) => (
                            <View key={nxt.id} style={{ alignItems: 'center' }}>
                                <EvolutionCard entity={nxt} isCurrent={false} onPress={handleNavigate} />
                                {Array.isArray(nxt.nextPokemons) && nxt.nextPokemons.length > 0 && (
                                    <>
                                        <ArrowRight style={{ transform: [{ rotate: '90deg' }], marginVertical: 6 }} color="#38bdf8" size={15} />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'flex-start' }}>
                                            {nxt.nextPokemons.map((subn: IEvolutionPokemonEntityType) => (
                                                <EvolutionCard key={subn.id} entity={subn} isCurrent={false} onPress={handleNavigate} />
                                            ))}
                                        </ScrollView>
                                    </>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )
            )}
        </View>
    );
};
