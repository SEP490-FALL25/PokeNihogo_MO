import { z } from "zod";

// QuestionBank inside each question
export const QuestionBankSchema = z.object({
  id: z.number(),
  question: z.string(),
  questionType: z.enum(["SPEAKING", "READING", "LISTENING", "WRITING"]).or(z.string()),
  audioUrl: z.string().nullable().optional(),
  pronunciation: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  levelN: z.number().nullable().optional(),
  answers: z.array(z.any()).optional(),
});

// Question item in a test set
export const TestSetQuestionSchema = z.object({
  id: z.number(),
  questionOrder: z.number(),
  questionBank: QuestionBankSchema,
});

// Test set
export const TestSetSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  content: z.any().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  testType: z.enum(["SPEAKING", "READING", "LISTENING", "WRITING"]).or(z.string()),
  status: z.string(),
  levelN: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  questions: z.array(TestSetQuestionSchema),
});

// Root test object
export const TestDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number().nullable().optional(),
  levelN: z.number(),
  limit: z.number(),
  testType: z.string(),
  status: z.string(),
  testSets: z.array(TestSetSchema),
});

// API envelope
export const TestFullUserResponseSchema = z.object({
  statusCode: z.number(),
  data: TestDetailSchema,
  message: z.string().optional(),
});

export type QuestionBank = z.infer<typeof QuestionBankSchema>;
export type TestSetQuestion = z.infer<typeof TestSetQuestionSchema>;
export type TestSet = z.infer<typeof TestSetSchema>;
export type TestDetail = z.infer<typeof TestDetailSchema>;
export type TestFullUserResponse = z.infer<typeof TestFullUserResponseSchema>;


