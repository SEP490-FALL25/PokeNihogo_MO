import { FlashcardContentType } from "@constants/flashcard.enum";
import { z } from "zod";

// Create Flashcard Deck Request Schema
export const CreateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1, "Tên sổ tay không được để trống"),
});

// Shared metadata schema for deck cards
export const FlashcardDeckCardMetadataSchema = z.object({
  wordJp: z.string().optional(),
  reading: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  meanings: z.string().optional(),
});

// Add Word to Flashcard Deck Request Schema
export const AddWordToFlashcardDeckRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  id: z.number().or(z.string().transform(Number)),
  contentType: z.nativeEnum(FlashcardContentType).optional(),
  notes: z.string().optional(),
});

// Create Flashcard Deck Card Request Schema
export const CreateFlashcardDeckCardRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  contentType: z.nativeEnum(FlashcardContentType).optional(),
  metadata: FlashcardDeckCardMetadataSchema.optional(),
});

// Update Flashcard Deck Request Schema
export const UpdateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

// Update Flashcard Deck Card Metadata Schema
export const UpdateFlashcardDeckCardMetadataSchema =
  FlashcardDeckCardMetadataSchema.optional();

// Update Flashcard Deck Card Request Schema
export const UpdateFlashcardDeckCardRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  cardId: z.number().or(z.string().transform(Number)),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  notes: z.string().nullable().optional(),
  read: z.boolean().optional(),
  metadata: UpdateFlashcardDeckCardMetadataSchema,
});

// Delete Flashcard Deck Cards Request Schema
export const DeleteFlashcardDeckCardsRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  cardIds: z.array(z.number().or(z.string().transform(Number))),
});

// Mark flashcard card read/unread schema
export const MarkFlashcardReadRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  cardId: z.number().or(z.string().transform(Number)),
  read: z.boolean(),
});

// Export types
export type ICreateFlashcardDeckRequest = z.infer<
  typeof CreateFlashcardDeckRequestSchema
>;
export type IAddWordToFlashcardDeckRequest = z.infer<
  typeof AddWordToFlashcardDeckRequestSchema
>;
export type ICreateFlashcardDeckCardRequest = z.infer<
  typeof CreateFlashcardDeckCardRequestSchema
>;
export type IUpdateFlashcardDeckRequest = z.infer<
  typeof UpdateFlashcardDeckRequestSchema
>;
export type IUpdateFlashcardDeckCardRequest = z.infer<
  typeof UpdateFlashcardDeckCardRequestSchema
>;
export type IDeleteFlashcardDeckCardsRequest = z.infer<
  typeof DeleteFlashcardDeckCardsRequestSchema
>;
export type IMarkFlashcardReadRequest = z.infer<
  typeof MarkFlashcardReadRequestSchema
>;

