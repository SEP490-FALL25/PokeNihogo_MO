import { BackendResponsePaginationModel } from "@models/backend/common";
import { z } from "zod";
import { LessonCategorySchema } from "./lesson-category.common";

export const LessonCategoryResponseSchema =
  BackendResponsePaginationModel(LessonCategorySchema);
export type ILessonCategoryResponse = z.infer<typeof LessonCategoryResponseSchema>;
