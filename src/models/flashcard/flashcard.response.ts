import {
    FlashcardDeckCardSchema,
    FlashcardDeckSchema,
    PaginationSchema,
} from "@models/flashcard/flashcard.common";
import { z } from "zod";

// Flashcard Deck Response Data Schema (single item)
export const FlashcardDeckResponseDataSchema = FlashcardDeckSchema;

// Flashcard Deck List Response Data Schema
export const FlashcardDeckListResponseDataSchema = z.object({
  results: z.array(FlashcardDeckSchema),
  pagination: PaginationSchema,
});

// Flashcard Deck List Response Schema
export const FlashcardDeckListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: FlashcardDeckListResponseDataSchema,
});

// Flashcard Deck Card List Response Data Schema
export const FlashcardDeckCardListResponseDataSchema = z.object({
  results: z.array(FlashcardDeckCardSchema),
  pagination: PaginationSchema,
});

// Flashcard Deck Card List Response Schema
export const FlashcardDeckCardListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: FlashcardDeckCardListResponseDataSchema,
});

// Flashcard Deck Card Response Schema
export const FlashcardDeckCardResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: FlashcardDeckCardSchema.optional(),
});

// Flashcard Deck Detail Response Schema
export const FlashcardDeckDetailResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: FlashcardDeckResponseDataSchema.optional(),
});

// Create Flashcard Deck Response Schema
export const CreateFlashcardDeckResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: FlashcardDeckResponseDataSchema.optional(),
});

// Add Word to Flashcard Deck Response Schema
export const AddWordToFlashcardDeckResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.any().optional(),
});

// Export types
export type IFlashcardDeckResponseData = z.infer<
  typeof FlashcardDeckResponseDataSchema
>;
export type IFlashcardDeckListResponseData = z.infer<
  typeof FlashcardDeckListResponseDataSchema
>;
export type IFlashcardDeckListResponse = z.infer<
  typeof FlashcardDeckListResponseSchema
>;
export type IFlashcardDeckDetailResponse = z.infer<
  typeof FlashcardDeckDetailResponseSchema
>;
export type IFlashcardDeckCardListResponse = z.infer<
  typeof FlashcardDeckCardListResponseSchema
>;
export type IFlashcardDeckCardResponse = z.infer<
  typeof FlashcardDeckCardResponseSchema
>;
export type ICreateFlashcardDeckResponse = z.infer<
  typeof CreateFlashcardDeckResponseSchema
>;
export type IAddWordToFlashcardDeckResponse = z.infer<
  typeof AddWordToFlashcardDeckResponseSchema
>;

