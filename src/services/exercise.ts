import { axiosPrivate } from "@configs/axios";
import { ILessonExercisesResponse } from "@models/user-exercise-attempt/user-exercise-attempt.response";

export const exerciseService = {
  getExercisesByLesson: async (
    lessonId: string
  ): Promise<ILessonExercisesResponse> => {
    const response = await axiosPrivate.get(`/exercises/lesson/${lessonId}`);
    return response.data;
  },
};

export default exerciseService;

