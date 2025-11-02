import { z } from 'zod';
import { BackendResponseModel } from '../backend/common';
import {
    PlacementDistributionSchema,
    PlacementQuestionSchema,
} from './placement-question.common';

// Get Placement Questions Response
export const GetPlacementQuestionsResponse = BackendResponseModel(
  z.object({
    questions: z.array(PlacementQuestionSchema),
    distribution: PlacementDistributionSchema,
  })
);

// Export types
export type IGetPlacementQuestionsResponse = z.infer<
  typeof GetPlacementQuestionsResponse
>;
