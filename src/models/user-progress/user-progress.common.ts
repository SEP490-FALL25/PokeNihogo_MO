import { PaginationSchema } from "@models/user-pokemon/user-pokemon.common";
import { z } from "zod";

// User Progress Lesson schema
export const UserProgressLessonSchema = z.object({
  id: z.number(),
  titleJp: z.string(),
  levelJlpt: z.number(),
  isPublished: z.boolean(),
});

// User Progress User schema
export const UserProgressUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

// User Progress schema
export const UserProgressSchema = z.object({
  id: z.number(),
  userId: z.number(),
  lessonId: z.number(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
  progressPercentage: z.number(),
  completedAt: z.string().nullable(),
  lastAccessedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lesson: UserProgressLessonSchema,
  user: UserProgressUserSchema,
});

// User Progress Pagination schema
export const UserProgressPaginationSchema = PaginationSchema;

// User Progress Response schema
export const UserProgressResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    results: z.array(UserProgressSchema),
    pagination: UserProgressPaginationSchema,
  }),
  message: z.string(),
});

// Export types
export type IUserProgressLesson = z.infer<typeof UserProgressLessonSchema>;
export type IUserProgressUser = z.infer<typeof UserProgressUserSchema>;
export type IUserProgress = z.infer<typeof UserProgressSchema>;
export type IUserProgressPagination = z.infer<typeof UserProgressPaginationSchema>;
export type IUserProgressResponse = z.infer<typeof UserProgressResponseSchema>;
