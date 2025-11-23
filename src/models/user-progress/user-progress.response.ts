import { UserProgressSchema } from "./user-progress.common";
import { BackendResponsePaginationModel } from "@models/backend/common";
import { z } from "zod";

export const UserProgressResponseSchema =
  BackendResponsePaginationModel(UserProgressSchema);
export type IUserProgressResponse = z.infer<typeof UserProgressResponseSchema>;
