import { IEvolutionPokemonEntityType } from "@models/pokemon/pokemon.entity";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { EvolutionCard } from "./evolution-card";

export const EvolutionTree = ({
    branch,
    parentLevel = 1,
    onNavigate,
}: {
    branch: IEvolutionPokemonEntityType[];
    parentLevel?: number;
    onNavigate: (id: number) => void;
}) => {
    if (!branch || branch.length === 0) return null;

    /**
     * If there is only one branch, render the branch vertically
     */
    if (branch.length === 1) {
        const curr = branch[0];
        return (
            <View style={{ alignItems: 'center' }}>
                <EvolutionCard
                    entity={curr}
                    isCurrent={false}
                    onPress={onNavigate}
                />
                {curr.nextPokemons && curr.nextPokemons.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                        <ArrowRight size={20} color="#38bdf8" style={{ alignSelf: 'center' }} />
                        <EvolutionTree branch={curr.nextPokemons} parentLevel={curr.conditionLevel ?? parentLevel} onNavigate={onNavigate} />
                    </View>
                )}
            </View>
        );
    }
    //------------------------End------------------------//


    /**
     * If there are multiple branches, render the branches horizontally
     */
    return (
        <View style={{ marginTop: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    {branch.map((b) => (
                        <View key={b.id} style={{ alignItems: 'center' }}>
                            <EvolutionCard
                                entity={b}
                                isCurrent={false}
                                onPress={onNavigate}
                            />
                            {b.nextPokemons && b.nextPokemons.length > 0 && (
                                <View style={{ marginTop: 12, borderLeftWidth: 2, borderColor: '#64748b', paddingLeft: 10 }}>
                                    <ArrowRight size={16} color="#38bdf8" style={{ alignSelf: 'flex-start' }} />
                                    <EvolutionTree branch={b.nextPokemons} parentLevel={b.conditionLevel ?? parentLevel} onNavigate={onNavigate} />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
    //------------------------End------------------------//
};