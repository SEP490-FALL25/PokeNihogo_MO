import { axiosPrivate } from "@configs/axios";
import { FlashcardContentType } from "@constants/flashcard.enum";
import { IQueryRequest } from "@models/common/common.request";
import {
  IAddWordToFlashcardDeckRequest,
  ICreateFlashcardDeckCardRequest,
  ICreateFlashcardDeckRequest,
  IDeleteFlashcardDeckCardsRequest,
  IMarkFlashcardReadRequest,
  IUpdateFlashcardDeckCardRequest,
  IUpdateFlashcardDeckRequest,
} from "@models/flashcard/flashcard.request";
import {
  IAddWordToFlashcardDeckResponse,
  ICreateFlashcardDeckResponse,
  IFlashcardDeckCardListResponse,
  IFlashcardDeckCardResponse,
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

  // Get cards inside a flashcard deck
  getDeckCards: async (
    deckId: number | string,
    params?: IQueryRequest & { contentType?: FlashcardContentType }
  ): Promise<IFlashcardDeckCardListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    if (params?.contentType) {
      queryParams.append("contentType", params.contentType);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const response = await axiosPrivate.get(
      `/flashcards/decks/${deckId}/cards${queryString ? `?${queryString}` : ""}`
    );
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

  // Create a brand new deck card with metadata
  createDeckCard: async (
    data: ICreateFlashcardDeckCardRequest
  ): Promise<IFlashcardDeckCardResponse> => {
    const deckId =
      typeof data.deckId === "string" ? Number(data.deckId) : data.deckId;

    const requestBody: {
      contentType: FlashcardContentType;
      metadata?: {
        wordJp?: string;
        reading?: string | null;
        audioUrl?: string | null;
        imageUrl?: string | null;
        meanings?: string;
      };
    } = {
      contentType: data.contentType || FlashcardContentType.VOCABULARY,
    };

    if (data.metadata) {
      requestBody.metadata = {
        ...(data.metadata.wordJp && { wordJp: data.metadata.wordJp }),
        ...(data.metadata.reading !== undefined && {
          reading: data.metadata.reading || null,
        }),
        ...(data.metadata.audioUrl !== undefined && {
          audioUrl: data.metadata.audioUrl || null,
        }),
        ...(data.metadata.imageUrl !== undefined && {
          imageUrl: data.metadata.imageUrl || null,
        }),
        ...(data.metadata.meanings && { meanings: data.metadata.meanings }),
      };
    }

    const response = await axiosPrivate.post(
      `/flashcards/decks/${deckId}/cards`,
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

  // Update deck card (e.g. notes/read status) - old PATCH endpoint
  updateDeckCard: async (
    deckId: number | string,
    cardId: number | string,
    data: { notes?: string | null; read?: boolean }
  ): Promise<IFlashcardDeckCardResponse> => {
    const response = await axiosPrivate.patch(
      `/flashcards/decks/${deckId}/cards/${cardId}`,
      data
    );
    return response.data;
  },

  // Update deck card with metadata (PUT /flashcards/decks/cards)
  updateDeckCardWithMetadata: async (
    data: IUpdateFlashcardDeckCardRequest
  ): Promise<IFlashcardDeckCardResponse> => {
    const requestBody: any = {
      deckId: typeof data.deckId === "string" ? Number(data.deckId) : data.deckId,
      cardId: typeof data.cardId === "string" ? Number(data.cardId) : data.cardId,
    };

    if (data.status) {
      requestBody.status = data.status;
    }

    if (data.notes !== undefined) {
      requestBody.notes = data.notes;
    }

    if (data.read !== undefined) {
      requestBody.read = data.read;
    }

    if (data.metadata) {
      requestBody.metadata = {
        ...(data.metadata.wordJp && { wordJp: data.metadata.wordJp }),
        ...(data.metadata.reading !== undefined && { reading: data.metadata.reading || null }),
        ...(data.metadata.audioUrl !== undefined && { audioUrl: data.metadata.audioUrl || null }),
        ...(data.metadata.imageUrl !== undefined && { imageUrl: data.metadata.imageUrl || null }),
        ...(data.metadata.meanings && { meanings: data.metadata.meanings }),
      };
    }

    const response = await axiosPrivate.put("/flashcards/decks/cards", requestBody);
    return response.data;
  },

  // Delete multiple deck cards (DELETE /flashcards/decks/cards)
  deleteDeckCards: async (
    data: IDeleteFlashcardDeckCardsRequest
  ) => {
    const requestBody = {
      deckId: typeof data.deckId === "string" ? Number(data.deckId) : data.deckId,
      cardIds: data.cardIds.map((id) =>
        typeof id === "string" ? Number(id) : id
      ),
    };
    const response = await axiosPrivate.delete("/flashcards/decks/cards", {
      data: requestBody,
    });
    return response.data;
  },

  // Mark flashcard card read/unread
  markCardRead: async (
    data: IMarkFlashcardReadRequest
  ): Promise<IFlashcardDeckCardResponse> => {
    const payload = {
      deckId: typeof data.deckId === "string" ? Number(data.deckId) : data.deckId,
      cardId: typeof data.cardId === "string" ? Number(data.cardId) : data.cardId,
      read: data.read,
    };

    const response = await axiosPrivate.put("/flashcards/read", payload);
    return response.data;
  },
};

export default flashcardService;

