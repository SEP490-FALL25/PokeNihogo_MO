import { IUpsertUserAnswerLogRequest } from "@models/user-answer-log/user-answer-log.request";
import userAnswerLogService from "@services/user-answer-log";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpsertUserAnswerLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerLog: IUpsertUserAnswerLogRequest) => {
      const res = await userAnswerLogService.upsertAnswerLog(answerLog);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed
      // queryClient.invalidateQueries({ queryKey: ["user-answer-log"] });
    },
  });
};

