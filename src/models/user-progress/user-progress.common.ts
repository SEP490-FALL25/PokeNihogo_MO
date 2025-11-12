
import { z } from "zod";

// User Progress Lesson schema
export const UserProgressLessonSchema = z.object({
  id: z.number(),
  titleJp: z.string(),
  levelJlpt: z.number(),
  isPublished: z.boolean(),
});
export type IUserProgressLesson = z.infer<typeof UserProgressLessonSchema>;

// User Progress User schema
export const UserProgressUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});
export type IUserProgressUser = z.infer<typeof UserProgressUserSchema>;
// User Progress schema
export const UserProgressSchema = z.object({
  id: z.number(),
  userId: z.number(),
  lessonId: z.number(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "TESTING_LAST","FAILED","TESTING_LAST_FAILED"]),
  progressPercentage: z.number(),
  completedAt: z.string().nullable(),
  lastAccessedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lesson: UserProgressLessonSchema,
  user: UserProgressUserSchema.optional(),
});
export type IUserProgress = z.infer<typeof UserProgressSchema>;
