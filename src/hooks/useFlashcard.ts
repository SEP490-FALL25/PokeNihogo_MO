import { FlashcardContentType } from "@constants/flashcard.enum";
import { IQueryRequest } from "@models/common/common.request";
import {
  IAddWordToFlashcardDeckRequest,
  ICreateFlashcardDeckRequest,
  IUpdateFlashcardDeckCardRequest,
  IUpdateFlashcardDeckRequest,
} from "@models/flashcard/flashcard.request";
import flashcardService from "@services/flashcard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
        queryKey: ["flashcard-deck", variables.deckId],
      });
      // Invalidate words in the deck
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck-words", variables.deckId],
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

// Hook to get cards of a flashcard deck (supports VOCABULARY/GRAMMAR/KANJI)
export const useFlashcardDeckCards = (
  deckId: number | string | null,
  params?: IQueryRequest & { contentType?: FlashcardContentType }
) => {
  return useQuery({
    queryKey: ["flashcard-deck-cards", deckId, params],
    queryFn: () => flashcardService.getDeckCards(deckId!, params),
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

// Hook to update flashcard deck card (e.g. notes/read) - old PATCH endpoint
export const useUpdateFlashcardDeckCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deckId,
      cardId,
      data,
    }: {
      deckId: number | string;
      cardId: number | string;
      data: { notes?: string | null; read?: boolean };
    }) => flashcardService.updateDeckCard(deckId, cardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck-cards", variables.deckId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck", variables.deckId],
      });
    },
  });
};

// Hook to update flashcard deck card with metadata (PUT /flashcards/decks/cards)
export const useUpdateFlashcardDeckCardWithMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateFlashcardDeckCardRequest) =>
      flashcardService.updateDeckCardWithMetadata(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck-cards", variables.deckId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcard-deck", variables.deckId],
      });
    },
  });
};

