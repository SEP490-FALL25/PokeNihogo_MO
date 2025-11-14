import { z } from "zod";

// Create Flashcard Deck Request Schema
export const CreateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1, "Tên sổ tay không được để trống"),
});

// Add Word to Flashcard Deck Request Schema
export const AddWordToFlashcardDeckRequestSchema = z.object({
  flashcardDeckId: z.number().or(z.string().transform(Number)),
  vocabularyId: z.number().or(z.string().transform(Number)),
});

// Update Flashcard Deck Request Schema
export const UpdateFlashcardDeckRequestSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
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

