import {
  IUserProgress,
  IUserProgressPagination,
  IUserProgressResponse,
  UserProgressPaginationSchema,
  UserProgressResponseSchema,
  UserProgressSchema
} from "./user-progress.common";

// Re-export types for backward compatibility
export type UserProgress = IUserProgress;
export type UserProgressPagination = IUserProgressPagination;
export type UserProgressResponse = IUserProgressResponse;

// Export schemas for validation
export {
  UserProgressPaginationSchema,
  UserProgressResponseSchema, UserProgressSchema
};

