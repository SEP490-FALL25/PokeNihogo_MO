import { z } from 'zod';

// Placement Question Answer Schema
export const PlacementAnswerSchema = z.object({
  id: z.number(),
  answer: z.string(),
  isCorrect: z.boolean(),
});

// Placement Question Schema
export const PlacementQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  questionType: z.enum(['KANJI', 'VOCABULARY', 'GRAMMAR', 'READING', 'LISTENING']),
  audioUrl: z.string().nullable(),
  pronunciation: z.string(),
  levelN: z.number(), // 3, 4, or 5 for N3, N4, N5
  answers: z.array(PlacementAnswerSchema),
});

// Placement Test Distribution Schema
export const PlacementDistributionSchema = z.object({
  level5: z.number(),
  level4: z.number(),
  level3: z.number(),
  total: z.number(),
});

// Export types
export type PlacementAnswer = z.infer<typeof PlacementAnswerSchema>;
export type PlacementQuestion = z.infer<typeof PlacementQuestionSchema>;
export type PlacementDistribution = z.infer<typeof PlacementDistributionSchema>;
