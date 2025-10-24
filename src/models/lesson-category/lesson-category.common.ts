import { z } from "zod";

// Lesson Category schema
export const LessonCategorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ILessonCategory = z.infer<typeof LessonCategorySchema>;
