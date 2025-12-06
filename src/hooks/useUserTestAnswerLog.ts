import { IUpsertUserTestAnswerLogRequest } from "@models/user-test-answer-log/user-test-answer-log.request";
import userTestService from "@services/user-test";
import { useMutation } from "@tanstack/react-query";

export const useUpsertUserTestAnswerLog = () => {
  return useMutation({
    mutationFn: async (answerLog: IUpsertUserTestAnswerLogRequest) => {
      const res = await userTestService.upsertTestAnswerLog(answerLog);
      return res.data;
    },
  });
};

