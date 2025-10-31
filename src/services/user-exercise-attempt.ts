import { axiosPrivate } from "@configs/axios";

const userExerciseAttemptService = {
  getLatestExerciseAttempt: async (lessonId: string) => {
    return axiosPrivate.get(`/user-exercise-attempt/latest/lesson/${lessonId}`);
  },
  getExerciseQuestions: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/exercise/${exerciseAttemptId}`
    );
  },
  checkCompleted: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/${exerciseAttemptId}/check-completion`
    );
  },
  submitCompletion: async (exerciseAttemptId: string, time: number) => {
    return axiosPrivate.put(
      `/user-exercise-attempt/${exerciseAttemptId}/submit-completion`,
      { time }
    );
  },
  getReviewResult: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/exercise/${exerciseAttemptId}/review`
    );
  },
  abandonExercise: async (exerciseAttemptId: string, time: number) => {
    return axiosPrivate.put(
      `/user-exercise-attempt/${exerciseAttemptId}/abandon`,
      { time }
    );
  },
  continueAndAbandonExercise: async (
    exerciseAttemptId: string,
    status: string
  ) => {
    return axiosPrivate.put(`/user-exercise-attempt/${exerciseAttemptId}`, {
      status,
    });
  },
  createNewExerciseAttempt: async (exerciseId: string) => {
    return axiosPrivate.post(`/user-exercise-attempt/${exerciseId}`);
  },
};

export default userExerciseAttemptService;
