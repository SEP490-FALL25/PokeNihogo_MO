import { PaginationSchema } from "@models/user-pokemon/user-pokemon.common";
import { z } from "zod";

// Flashcard Deck Metadata Schema
export const FlashcardDeckMetadataSchema = z.record(z.any()).optional();

// Flashcard Deck Status Schema
export const FlashcardDeckStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

// Flashcard Deck Source Schema
export const FlashcardDeckSourceSchema = z.enum(["USER", "SYSTEM", "SHARED"]);

// Flashcard Deck Schema
export const FlashcardDeckSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  status: FlashcardDeckStatusSchema,
  source: FlashcardDeckSourceSchema,
  metadata: FlashcardDeckMetadataSchema,
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalCards: z.number(),
});

// Export types
export type IFlashcardDeck = z.infer<typeof FlashcardDeckSchema>;
export type IFlashcardDeckStatus = z.infer<typeof FlashcardDeckStatusSchema>;
export type IFlashcardDeckSource = z.infer<typeof FlashcardDeckSourceSchema>;
export type IFlashcardDeckMetadata = z.infer<typeof FlashcardDeckMetadataSchema>;

// Re-export PaginationSchema for convenience
export { PaginationSchema };
export type IPagination = z.infer<typeof PaginationSchema>;

