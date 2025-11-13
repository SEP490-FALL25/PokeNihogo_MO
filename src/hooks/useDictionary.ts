import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dictionaryService, { DictionarySearchParams } from '@services/dictionary';

// Hook for dictionary search
export const useDictionarySearch = (params: DictionarySearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['dictionary', 'search', params],
        queryFn: () => dictionaryService.search(params),
        enabled: enabled && !!params.query && params.query.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook for word details
export const useWordDetails = (wordId: string | null) => {
    return useQuery({
        queryKey: ['dictionary', 'word', wordId],
        queryFn: () => dictionaryService.getWordDetails(wordId!),
        enabled: !!wordId,
    });
};

// Hook for kanji details
export const useKanjiDetails = (character: string | null) => {
    return useQuery({
        queryKey: ['dictionary', 'kanji', character],
        queryFn: () => dictionaryService.getKanjiDetails(character!),
        enabled: !!character,
    });
};

// Hook for search history from server
export const useSearchHistory = (params?: { currentPage?: number; pageSize?: number }) => {
    return useQuery({
        queryKey: ['dictionary', 'search-history', params],
        queryFn: () => dictionaryService.getSearchHistory(params),
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

// Hook for favorites
export const useFavorites = () => {
    return useQuery({
        queryKey: ['dictionary', 'favorites'],
        queryFn: () => dictionaryService.getFavorites(),
    });
};

// Hook for adding to favorites
export const useAddToFavorites = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (wordId: string) => dictionaryService.addToFavorites(wordId),
        onSuccess: () => {
            // Invalidate and refetch favorites
            queryClient.invalidateQueries({ queryKey: ['dictionary', 'favorites'] });
        },
    });
};

// Hook for removing from favorites
export const useRemoveFromFavorites = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (wordId: string) => dictionaryService.removeFromFavorites(wordId),
        onSuccess: () => {
            // Invalidate and refetch favorites
            queryClient.invalidateQueries({ queryKey: ['dictionary', 'favorites'] });
        },
    });
};

// Hook for voice search
export const useVoiceSearch = () => {
    return useMutation({
        mutationFn: (audioBlob: Blob) => dictionaryService.searchByVoice(audioBlob),
    });
};

// Hook for handwriting search
export const useHandwritingSearch = () => {
    return useMutation({
        mutationFn: (imageBlob: Blob) => dictionaryService.searchByHandwriting(imageBlob),
    });
};

