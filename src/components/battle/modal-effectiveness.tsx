import { usePokemonById } from "@hooks/usePokemonData";
import React from "react";
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ModalEffectivenessProps {
    visible: boolean;
    onRequestClose: () => void;
    pokemonId: number | null;
    language: string;
}

export default function ModalEffectiveness({
    visible,
    onRequestClose,
    pokemonId,
    language,
}: ModalEffectivenessProps) {
    const { data: pokemonDetail, isLoading: isLoadingPokemonDetail } = usePokemonById(
        visible && pokemonId ? String(pokemonId) : ""
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View className="flex-1 bg-black/80 justify-center items-center p-5">
                <View className="bg-slate-800 rounded-3xl w-full p-6" style={{ maxWidth: 400, maxHeight: "80%" }}>
                    {isLoadingPokemonDetail ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <Text className="text-slate-300 mt-4">Đang tải thông tin...</Text>
                        </View>
                    ) : pokemonDetail ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View className="flex-row justify-between items-start mb-6">
                                <View className="flex-row items-center flex-1">
                                    <Image source={{ uri: pokemonDetail.imageUrl }} className="w-20 h-20 mr-4" resizeMode="contain" />
                                    <View className="flex-1">
                                        <Text className="text-2xl font-extrabold text-white mb-1">
                                            {(() => {
                                                if (language === "ja") return pokemonDetail.nameTranslations?.ja || pokemonDetail.nameJp || "";
                                                return pokemonDetail.nameTranslations?.en || pokemonDetail.nameJp || "";
                                            })()}
                                        </Text>
                                        {pokemonDetail.pokedex_number && (
                                            <Text className="text-sm text-slate-400 font-semibold">
                                                #{String(pokemonDetail.pokedex_number).padStart(3, "0")}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity onPress={onRequestClose} className="w-8 h-8 rounded-full bg-white/10 justify-center items-center">
                                    <Text className="text-2xl text-slate-300 font-semibold">×</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Types */}
                            {pokemonDetail.types?.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold text-white mb-3">Hệ</Text>
                                    <View className="flex-row flex-wrap gap-2 mt-1">
                                        {pokemonDetail.types.map((type: any) => {
                                            const tColor = type.color_hex || "#94a3b8";
                                            const tName =
                                                type.display_name?.[language as any] || type.display_name?.vi || type.display_name?.en || type.type_name;
                                            return (
                                                <View
                                                    key={type.id}
                                                    className="px-3 py-2 rounded-xl border min-w-[100px]"
                                                    style={{ backgroundColor: `${tColor}30`, borderColor: tColor }}
                                                >
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: tColor }} />
                                                        <Text className="text-base font-bold flex-1" style={{ color: tColor }}>
                                                            {tName}
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            {/* Weaknesses */}
                            {pokemonDetail.weaknesses?.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold text-white mb-3">Điểm yếu</Text>
                                    <View className="flex-row flex-wrap gap-2 mt-1">
                                        {pokemonDetail.weaknesses.map((w: any) => {
                                            const wColor = w.color_hex || "#ef4444";
                                            const wName =
                                                w.display_name?.[language as any] || w.display_name?.vi || w.display_name?.en || w.type_name;
                                            return (
                                                <View
                                                    key={w.id}
                                                    className="px-3 py-2 rounded-xl border min-w-[100px]"
                                                    style={{ backgroundColor: `${wColor}30`, borderColor: wColor }}
                                                >
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: wColor }} />
                                                        <Text className="text-base font-bold flex-1" style={{ color: wColor }}>
                                                            {wName}
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Text className="text-red-500">Không thể tải thông tin Pokemon</Text>
                            <TouchableOpacity onPress={onRequestClose} className="mt-3">
                                <Text className="text-sky-300 underline">Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

