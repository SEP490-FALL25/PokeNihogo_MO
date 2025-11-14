import { IQueryRequest } from "@models/common/common.request";
import {
  IAddWordToFlashcardDeckRequest,
  ICreateFlashcardDeckRequest,
  IUpdateFlashcardDeckRequest,
} from "@models/flashcard/flashcard.request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import flashcardService from "@services/flashcard";

// Hook to get all flashcard decks
export const useFlashcardDecks = (params?: IQueryRequest) => {
  return useQuery({
    queryKey: ["flashcard-decks", params],
    queryFn: () =>
      flashcardService.getDecks(params || { currentPage: 1, pageSize: 100 }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to get flashcard deck by ID
export const useFlashcardDeck = (deckId: number | string | null) => {
  return useQuery({
    queryKey: ["flashcard-deck", deckId],
    queryFn: () => flashcardService.getDeckById(deckId!),
    enabled: !!deckId,
    staleTime: 1 * 60 * 1000,
  });
};

// Hook to create a new flashcard deck
export const useCreateFlashcardDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateFlashcardDeckRequest) =>
      flashcardService.createDeck(data),
    onSuccess: () => {
      // Invalidate and refetch flashcard decks list
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Hook to update flashcard deck
export const useUpdateFlashcardDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deckId,
      data,
    }: {
      deckId: number | string;
      data: IUpdateFlashcardDeckRequest;
    }) => flashcardService.updateDeck(deckId, data),
    onSuccess: (_, variables) => {
      // Invalidate flashcard decks list and specific deck
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck", variables.deckId],
      });
    },
  });
};

// Hook to delete flashcard deck
export const useDeleteFlashcardDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deckId: number | string) =>
      flashcardService.deleteDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Hook to add word to flashcard deck
export const useAddWordToFlashcardDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAddWordToFlashcardDeckRequest) =>
      flashcardService.addWord(data),
    onSuccess: (_, variables) => {
      // Invalidate flashcard decks to update totalCards count
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      // Invalidate specific deck
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck", variables.flashcardDeckId],
      });
      // Invalidate words in the deck
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck-words", variables.flashcardDeckId],
      });
    },
  });
};

// Hook to get words in a flashcard deck
export const useFlashcardDeckWords = (
  deckId: number | string | null,
  params?: IQueryRequest
) => {
  return useQuery({
    queryKey: ["flashcard-deck-words", deckId, params],
    queryFn: () => flashcardService.getWords(deckId!, params),
    enabled: !!deckId,
    staleTime: 1 * 60 * 1000,
  });
};

// Hook to remove word from flashcard deck
export const useRemoveWordFromFlashcardDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deckId,
      vocabularyId,
    }: {
      deckId: number | string;
      vocabularyId: number | string;
    }) => flashcardService.removeWord(deckId, vocabularyId),
    onSuccess: (_, variables) => {
      // Invalidate flashcard decks to update totalCards count
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      // Invalidate specific deck
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck", variables.deckId],
      });
      // Invalidate words in the deck
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck-words", variables.deckId],
      });
    },
  });
};

