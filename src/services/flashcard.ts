import { axiosPrivate } from "@configs/axios";
import { FlashcardContentType } from "@constants/flashcard.enum";
import { IQueryRequest } from "@models/common/common.request";
import {
  IAddWordToFlashcardDeckRequest,
  ICreateFlashcardDeckRequest,
  IUpdateFlashcardDeckRequest,
} from "@models/flashcard/flashcard.request";
import {
  IAddWordToFlashcardDeckResponse,
  ICreateFlashcardDeckResponse,
  IFlashcardDeckDetailResponse,
  IFlashcardDeckListResponse,
} from "@models/flashcard/flashcard.response";

const flashcardService = {
  // Get all flashcard decks for current user
  getDecks: async (
    params: IQueryRequest
  ): Promise<IFlashcardDeckListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const queryString = queryParams.toString();
    const response = await axiosPrivate.get(
      `/flashcards/decks?${queryString}`
    );
    return response.data;
  },

  // Get flashcard deck by ID
  getDeckById: async (deckId: number | string): Promise<IFlashcardDeckDetailResponse> => {
    const response = await axiosPrivate.get(`/flashcards/decks/${deckId}`);
    return response.data;
  },

  // Create a new flashcard deck
  createDeck: async (
    data: ICreateFlashcardDeckRequest
  ): Promise<ICreateFlashcardDeckResponse> => {
    const response = await axiosPrivate.post("/flashcards/decks", data);
    return response.data;
  },

  // Update flashcard deck
  updateDeck: async (
    deckId: number | string,
    data: IUpdateFlashcardDeckRequest
  ) => {
    const response = await axiosPrivate.put(`/flashcards/decks/${deckId}`, data);
    return response.data;
  },

  // Delete flashcard deck
  deleteDeck: async (deckId: number | string) => {
    const response = await axiosPrivate.delete(`/flashcards/decks/${deckId}`);
    return response.data;
  },

  // Add word to flashcard deck
  addWord: async (
    data: IAddWordToFlashcardDeckRequest
  ): Promise<IAddWordToFlashcardDeckResponse> => {
    const requestBody: {
      id: number;
      contentType: FlashcardContentType;
      notes?: string;
    } = {
      id: typeof data.id === "string" 
        ? Number(data.id) 
        : data.id,
      contentType: data.contentType || FlashcardContentType.VOCABULARY,
    };
    
    // Only include notes if provided
    if (data.notes) {
      requestBody.notes = data.notes;
    }
    
    const response = await axiosPrivate.post(
      `/flashcards/decks/${data.deckId}/cards`,
      requestBody
    );
    return response.data;
  },

  // Get words in a flashcard deck
  getWords: async (deckId: number | string, params?: IQueryRequest) => {
    const queryParams = new URLSearchParams();

    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const queryString = queryParams.toString();
    const response = await axiosPrivate.get(
      `/flashcards/decks/${deckId}/words${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Remove word from flashcard deck
  removeWord: async (deckId: number | string, id: number | string) => {
    const response = await axiosPrivate.delete(
      `/flashcards/decks/${deckId}/words/${id}`
    );
    return response.data;
  },
};

export default flashcardService;

