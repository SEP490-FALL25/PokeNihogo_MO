import { FlashcardContentType } from "@constants/flashcard.enum";
import { z } from "zod";

// Create Flashcard Deck Request Schema
export const CreateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1, "Tên sổ tay không được để trống"),
});

// Add Word to Flashcard Deck Request Schema
export const AddWordToFlashcardDeckRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  id: z.number().or(z.string().transform(Number)),
  contentType: z.nativeEnum(FlashcardContentType).optional(),
  notes: z.string().optional(),
});

// Update Flashcard Deck Request Schema
export const UpdateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

// Update Flashcard Deck Card Metadata Schema
export const UpdateFlashcardDeckCardMetadataSchema = z.object({
  wordJp: z.string().optional(),
  reading: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  meanings: z.string().optional(),
}).optional();

// Update Flashcard Deck Card Request Schema
export const UpdateFlashcardDeckCardRequestSchema = z.object({
  deckId: z.number().or(z.string().transform(Number)),
  cardId: z.number().or(z.string().transform(Number)),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  notes: z.string().nullable().optional(),
  read: z.boolean().optional(),
  metadata: UpdateFlashcardDeckCardMetadataSchema,
});

// Export types
export type ICreateFlashcardDeckRequest = z.infer<
  typeof CreateFlashcardDeckRequestSchema
>;
export type IAddWordToFlashcardDeckRequest = z.infer<
  typeof AddWordToFlashcardDeckRequestSchema
>;
export type IUpdateFlashcardDeckRequest = z.infer<
  typeof UpdateFlashcardDeckRequestSchema
>;
export type IUpdateFlashcardDeckCardRequest = z.infer<
  typeof UpdateFlashcardDeckCardRequestSchema
>;

