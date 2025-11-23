import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type ExerciseStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'FAIL';

export interface LessonExerciseStatus {
  id: string;
  status: ExerciseStatus;
}

export interface ExerciseStatusResponse {
  vocabulary: LessonExerciseStatus;
  grammar: LessonExerciseStatus;
  kanji: LessonExerciseStatus;
}

export function useLessonExerciseStatus(lessonId: string) {
  return useQuery<ExerciseStatusResponse>({
    queryKey: ['lesson-exercise-status', lessonId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/lesson/${lessonId}/exercises-status`);
      return data as ExerciseStatusResponse;
    },
    enabled: !!lessonId,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}