import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonExerciseStatus {
  id: string;
  status: ExerciseStatus;
}

interface ExerciseStatusResponse {
  vocabulary: LessonExerciseStatus;
  grammar: LessonExerciseStatus;
  kanji: LessonExerciseStatus;
}

export function useLessonExerciseStatus(lessonId: string) {
  return useQuery<ExerciseStatusResponse>(['lesson-exercise-status', lessonId], async () => {
    const { data } = await axios.get(`/api/lesson/${lessonId}/exercises-status`);
    return data;
  }, {
    enabled: !!lessonId,
  });
}