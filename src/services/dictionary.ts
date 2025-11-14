import { axiosPrivate } from "@configs/axios";

// Dictionary search params
interface DictionarySearchParams {
    query: string;
    currentPage?: number;
    pageSize?: number;
}

// Vocabulary item from API
interface VocabularyItem {
    id: number;
    wordJp: string;
    reading: string;
    meaning: string;
}

// Dictionary result (mapped from API)
interface DictionaryResult {
    id: string;
    word: string;
    reading?: string;
    romaji?: string;
    meaning: string;
    type?: string;
}

// API Response structure
interface DictionaryApiResponse {
    statusCode: number;
    data: {
        results: VocabularyItem[];
        pagination: {
            current: number;
            pageSize: number;
            totalPage: number;
            totalItem: number;
        };
    };
    message: string;
}

interface DictionaryResponse {
    success: boolean;
    data: {
        results: DictionaryResult[];
        pagination: {
            current: number;
            pageSize: number;
            totalPage: number;
            totalItem: number;
        };
    };
}

const dictionaryService = {
    // Search dictionary
    search: async (params: DictionarySearchParams): Promise<DictionaryResponse> => {
        const { query, currentPage = 1, pageSize = 10 } = params;
        
        const response = await axiosPrivate.get<DictionaryApiResponse>('/vocabulary/search', {
            params: {
                keyword: query,
                currentPage,
                pageSize
            }
        });
        
        // Map API response to DictionaryResult format
        const mappedResults: DictionaryResult[] = response.data.data.results.map((item) => ({
            id: item.id.toString(),
            word: item.wordJp,
            reading: item.reading,
            meaning: item.meaning,
        }));
        
        return {
            success: response.data.statusCode === 200,
            data: {
                results: mappedResults,
                pagination: response.data.data.pagination,
            }
        };
    },

    // Get word details by ID
    getWordDetails: async (wordId: string) => {
        const response = await axiosPrivate.get(`/vocabulary/search/${wordId}`);
        return response.data;
    },

    // Get kanji details
    getKanjiDetails: async (character: string) => {
        const response = await axiosPrivate.get(`/dictionary/kanji/${character}`);
        return response.data;
    },

    // Search by voice (convert speech to text and search)
    searchByVoice: async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        const response = await axiosPrivate.post('/dictionary/voice-search', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    },

    // Search by handwriting (convert image to text and search)
    searchByHandwriting: async (imageBlob: Blob) => {
        const formData = new FormData();
        formData.append('image', imageBlob);
        
        const response = await axiosPrivate.post('/dictionary/handwriting-search', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    },

    // Get search history from server
    getSearchHistory: async (params?: { currentPage?: number; pageSize?: number }) => {
        const { currentPage = 1, pageSize = 20 } = params || {};
        
        const response = await axiosPrivate.get('/vocabulary/search-history', {
            params: {
                currentPage,
                pageSize
            }
        });
        
        return response.data;
    },

    // Add to favorites
    addToFavorites: async (wordId: string) => {
        const response = await axiosPrivate.post('/dictionary/favorites', {
            wordId
        });
        return response.data;
    },

    // Remove from favorites
    removeFromFavorites: async (wordId: string) => {
        const response = await axiosPrivate.delete(`/dictionary/favorites/${wordId}`);
        return response.data;
    },

    // Get favorites
    getFavorites: async () => {
        const response = await axiosPrivate.get('/dictionary/favorites');
        return response.data;
    }
};

export default dictionaryService;
export type { DictionarySearchParams, DictionaryResult, DictionaryResponse };

