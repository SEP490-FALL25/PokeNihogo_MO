import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed';

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
  });
}