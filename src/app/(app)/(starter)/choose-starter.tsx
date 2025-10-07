// ============================================================================
// IMPORTS
// ============================================================================
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import StarterCard from "@components/Organism/StarterCard";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { IPokemon } from "@models/pokemon/pokemon.common";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import pokemonService from "@services/pokemon";
import userPokemonService from "@services/user-pokemon";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";

// ============================================================================
// CONSTANTS
// ============================================================================
const GRID_HEIGHT = 432;
const FLATLIST_CONFIG = {
  maxToRenderPerBatch: 6,
  windowSize: 10,
  initialNumToRender: 6,
  removeClippedSubviews: true,
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ChooseStarterScreen() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { t } = useTranslation();

  // UI state
  const [selected, setSelected] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pokemons, setPokemons] = useState<IPokemon[]>([]);

  // Store selectors
  const setStarterId = useUserStore((s) => s.setStarterId);
  const setIsFirstTimeLogin = useUserStore((s) => s.setIsFirstTimeLogin);

  // Refs for cleanup
  const mountedRef = useRef(true);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  /**
   * Fetch starter Pokemon on component mount
   * Optimized with cleanup and error handling
   */
  useEffect(() => {
    const fetchStarters = async () => {
      try {
        setIsLoading(true);
        const response = await pokemonService.getAll(
          1,
          "sort:id,isStarted=true"
        );
        
        // Check if component is still mounted before updating state
        if (mountedRef.current) {
          const pokemonData = response.data.data.results;
          setPokemons(pokemonData);
        }
      } catch (error) {
        console.error("Error fetching starters:", error);
        
        // Only show alert if component is still mounted
        if (mountedRef.current) {
          Alert.alert(
            t("common.error") || "Error",
            t("auth.choose_starter.fetch_error") ||
              "Failed to load starter Pokemon. Please try again."
          );
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchStarters();

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [t]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  /**
   * Memoized selected Pokemon to avoid repeated find operations
   */
  const selectedPokemon = useMemo(() => {
    return selected ? pokemons.find((p) => p.id === selected) : null;
  }, [selected, pokemons]);

  /**
   * Memoized Pokemon data for navigation to prevent unnecessary JSON.stringify calls
   */
  const pokemonDataForNavigation = useMemo(() => {
    if (!selectedPokemon) return null;
    
    return JSON.stringify({
      id: selectedPokemon.id,
      name: selectedPokemon.nameTranslations.en,
      nameJp: selectedPokemon.nameJp,
      image: selectedPokemon.imageUrl,
      types: selectedPokemon.types.map((t) => ({
        name: t.type_name,
        displayName: t.display_name.en,
        color: t.color_hex,
      })),
    });
  }, [selectedPokemon]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handles starter selection
   * @param id - The ID of the selected starter
   */
  const handleSelect = useCallback((id: number) => {
    setSelected(id);
  }, []);

  /**
   * Handles confirmation of starter selection
   * Sets the starter in the store and navigates to congrats screen
   */
  const onConfirm = useCallback(async () => {
    if (!selected || isProcessing || !selectedPokemon || !pokemonDataForNavigation) return;

    try {
      setIsProcessing(true);

      // Add the Pokemon to user's collection
      await userPokemonService.getNewPokemon({
        pokemonId: selected,
        nickname: selectedPokemon.nameTranslations.en,
      });

      // Update store and navigate
      setStarterId(selected.toString());
      setIsFirstTimeLogin(true);
      await authService.selectStarter(selected.toString());

      // Pass selected Pokemon data to congrats screen
      router.replace({
        pathname: ROUTES.STARTER.CONGRATS,
        params: {
          selectedPokemon: pokemonDataForNavigation,
        },
      });
    } catch (error) {
      console.error("Error selecting starter:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("auth.choose_starter.select_error") ||
          "Failed to select starter. Please try again."
      );
      setIsProcessing(false);
    }
  }, [selected, isProcessing, selectedPokemon, pokemonDataForNavigation, setStarterId, setIsFirstTimeLogin, t]);

  /**
   * Handles back navigation - prevents navigation during processing
   */
  const handleBack = useCallback(() => {
    if (!isProcessing) {
      router.back();
    }
  }, [isProcessing]);

  // ============================================================================
  // MEMOIZED RENDER ITEM
  // ============================================================================
  const renderPokemonItem = useCallback(({ item }: { item: IPokemon }) => (
    <View style={styles.pokemonItemContainer}>
      <StarterCard
        starter={{
          id: item.id.toString(),
          name: item.nameTranslations.en,
          type: item.types.map((t) => t.display_name.en),
          image: item.imageUrl,
        }}
        selected={selected === item.id}
        onSelect={() => handleSelect(item.id)}
      />
    </View>
  ), [selected, handleSelect]);

  const keyExtractor = useCallback((item: IPokemon) => item.id.toString(), []);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout currentStep={2} totalSteps={2} onBack={handleBack}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          {t("auth.choose_starter.title")}
        </ThemedText>
      </View>

      {/* Starter Grid Section */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            {t("auth.choose_starter.loading") || "Loading starter Pokemon..."}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={pokemons}
          numColumns={2}
          keyExtractor={keyExtractor}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          {...FLATLIST_CONFIG}
          renderItem={renderPokemonItem}
        />
      )}

      {/* Confirm Button Section */}
      <View style={styles.buttonContainer}>
        <BounceButton
          variant="solid"
          disabled={!selected || isProcessing}
          onPress={onConfirm}
        >
          {isProcessing
            ? t("common.processing") || "Processing..."
            : t("auth.choose_starter.confirm")}
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 16,
  },
  loadingContainer: {
    height: GRID_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  flatList: {
    height: GRID_HEIGHT,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 0,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  pokemonItemContainer: {
    width: "48%",
    marginBottom: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
});
