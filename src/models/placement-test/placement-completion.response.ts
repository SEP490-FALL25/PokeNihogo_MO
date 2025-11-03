import { z } from 'zod';
import { BackendResponseModel } from '../backend/common';

// Placement Test Completion Response Schema
export const PlacementCompletionResponseSchema = BackendResponseModel(
  z.object({
    levelN: z.number(), // 3, 4, or 5 for N3, N4, N5
    levelId: z.number().nullable(),
  })
);

// Export types
export type IPlacementCompletionResponse = z.infer<
  typeof PlacementCompletionResponseSchema
>;

