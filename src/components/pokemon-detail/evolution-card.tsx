import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { OwnershipBadge } from "@components/pokemon-detail/ownership-badge";
import { IEvolutionPokemonEntityType } from "@models/pokemon/pokemon.entity";
import { Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';

export const EvolutionCard = ({
    entity,
    isCurrent,
    onPress,
}: {
    entity: IEvolutionPokemonEntityType;
    isCurrent?: boolean;
    onPress?: (id: number) => void;
}) => {
    const { t } = useTranslation();
    const displayName = entity.nameTranslations?.en;

    return (
        <TouchableOpacity
            disabled={isCurrent || !entity.userPokemon}
            onPress={() => onPress?.(entity.id)}
            activeOpacity={0.8}
            className="relative"
        >
            {isCurrent && <View className="absolute w-full h-full bg-teal-500/50 rounded-3xl shadow-[0_0_20px_rgba(20,184,166,0.6)]" />}

            <TWLinearGradient
                colors={
                    isCurrent
                        ? ['#14b8a6', '#0d9488', '#0f766e']
                        : entity.userPokemon
                            ? ['#1e293b', '#0f172a']
                            : ['#1e2530', '#242f3d']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-[150px] rounded-3xl p-[18px] items-center overflow-hidden shadow-black/40 shadow-lg"
            >
                <View className="absolute -top-[30px] -right-[30px] w-20 h-20 rounded-[40px] bg-white/10" />
                <View className="absolute -bottom-5 -left-5 w-15 h-15 rounded-[30px] bg-white/5" />

                <View className={`w-24 h-24 rounded-[20px] items-center justify-center mb-3.5 overflow-hidden ${isCurrent ? 'bg-white/15 shadow-[0_4px_8px_rgba(20,184,166,0.4)]' : 'bg-white/10'} relative`}>
                    <View className="absolute w-full h-full bg-teal-500/10 z-0" />
                    <Image
                        source={{
                            uri:
                                entity.imageUrl ||
                                (entity.pokedex_number
                                    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entity.pokedex_number}.png`
                                    : undefined),
                        }}
                        style={{ width: 80, height: 80, zIndex: 2 }}
                        resizeMode="contain"
                    />
                    {!entity.userPokemon && !isCurrent && (
                        <View className="absolute w-full h-full bg-black/40 rounded-[20px] z-10" style={{ top: 0, left: 0 }} />
                    )}
                </View>

                <View className="items-center w-full">
                    <Text
                        className={`text-white text-[16px] font-extrabold capitalize tracking-[0.5px] ${isCurrent ? 'text-[17px]' : ''}`}
                        numberOfLines={1}
                    >
                        {displayName}
                    </Text>
                    {!isCurrent && <View className="mt-2"><OwnershipBadge owned={entity.userPokemon} /></View>}
                </View>

                {isCurrent && (
                    <TWLinearGradient
                        colors={['#fbbf24', '#f59e0b']}
                        className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-full items-center justify-center shadow-[0_3px_6px_rgba(251,191,36,0.5)]"
                    >
                        <Star size={12} color="white" fill="white" strokeWidth={2.5} />
                    </TWLinearGradient>
                )}
            </TWLinearGradient>
        </TouchableOpacity>
    );
};