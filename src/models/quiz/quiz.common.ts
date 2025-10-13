import { z } from 'zod';

// Quiz Question Schema
export const QuizQuestionSchema = z.object({
  id: z.string(),
  lessonId: z.string().optional(),
  category: z.string(),
  type: z.enum(['single-choice', 'multiple-choice', 'text-input', 'audio', 'image']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  level: z.enum(['N5', 'N4', 'N3']),
  question: z.string(),
  questionImage: z.string().optional(),
  audioUrl: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    image: z.string().optional(),
    isCorrect: z.boolean(),
  })).optional(),
  correctAnswers: z.array(z.string()),
  explanation: z.string().optional(),
  tags: z.array(z.string()),
  estimatedTime: z.number(),
  points: z.number(),
});

// Quiz Session Schema
export const QuizSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string().optional(),
  category: z.string(),
  level: z.enum(['N5', 'N4', 'N3']),
  questions: z.array(QuizQuestionSchema),
  currentQuestionIndex: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswers: z.array(z.string()),
    isCorrect: z.boolean(),
    timeSpent: z.number(),
    points: z.number(),
    answeredAt: z.string(),
  })),
  startTime: z.string(),
  endTime: z.string().optional(),
  isCompleted: z.boolean(),
  totalPoints: z.number(),
  score: z.number(),
});

// Quiz Result Schema
export const QuizResultSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  lessonId: z.string().optional(),
  category: z.string(),
  level: z.enum(['N5', 'N4', 'N3']),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  score: z.number(),
  totalPoints: z.number(),
  earnedPoints: z.number(),
  timeSpent: z.number(),
  completedAt: z.string(),
  pokemonReward: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  }).optional(),
  achievements: z.array(z.string()).optional(),
});

// Quiz Stats Schema
export const QuizStatsSchema = z.object({
  totalQuizzesCompleted: z.number(),
  averageScore: z.number(),
  totalPointsEarned: z.number(),
  streakDays: z.number(),
  categoryStats: z.record(z.object({
    quizzesCompleted: z.number(),
    averageScore: z.number(),
    bestScore: z.number(),
  })),
});

// Export types
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizSession = z.infer<typeof QuizSessionSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;
export type QuizStats = z.infer<typeof QuizStatsSchema>;
export type QuizAnswer = z.infer<typeof QuizSessionSchema>['answers'][0];
