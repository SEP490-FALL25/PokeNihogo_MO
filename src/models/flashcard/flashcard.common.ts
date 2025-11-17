import { FlashcardContentType } from "@constants/flashcard.enum";
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

// Flashcard vocabulary content schema
export const FlashcardVocabularySchema = z.object({
  id: z.number(),
  wordJp: z.string(),
  reading: z.string().nullable().optional(),
  levelN: z.number().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  meanings: z
    .union([
      z.array(z.string()),
      z.string(),
      z.array(
        z.object({
          meaning: z.string().optional(),
          text: z.string().optional(),
        })
      ),
    ])
    .nullable()
    .optional(),
});

// Flashcard deck card schema
export const FlashcardDeckCardSchema = z.object({
  id: z.number(),
  deckId: z.number(),
  contentType: z.nativeEnum(FlashcardContentType),
  status: z.string(),
  vocabularyId: z.number().nullable(),
  kanjiId: z.number().nullable(),
  grammarId: z.number().nullable(),
  vocabulary: FlashcardVocabularySchema.nullable().optional(),
  kanji: z.any().nullable().optional(),
  grammar: z.any().nullable().optional(),
  notes: z.string().nullable().optional(),
  read: z.boolean().nullable().optional(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type IFlashcardDeck = z.infer<typeof FlashcardDeckSchema>;
export type IFlashcardDeckStatus = z.infer<typeof FlashcardDeckStatusSchema>;
export type IFlashcardDeckSource = z.infer<typeof FlashcardDeckSourceSchema>;
export type IFlashcardDeckMetadata = z.infer<typeof FlashcardDeckMetadataSchema>;
export type IFlashcardVocabulary = z.infer<typeof FlashcardVocabularySchema>;
export type IFlashcardDeckCard = z.infer<typeof FlashcardDeckCardSchema>;

// Re-export PaginationSchema for convenience
export { PaginationSchema };
export type IPagination = z.infer<typeof PaginationSchema>;

