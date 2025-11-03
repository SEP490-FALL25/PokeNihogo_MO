import { axiosPrivate } from "@configs/axios";
import { IUpsertUserTestAnswerLogRequest } from "@models/user-test-answer-log/user-test-answer-log.request";

const userAnswerLogService = {
  upsertAnswerLog: async (answerLog: IUpsertUserTestAnswerLogRequest) => {
    return axiosPrivate.post(`/user-test-answer-log/upsert`, answerLog);
  },

  checkPlacementTest: async (testAttemptId: number | string) => {
    return axiosPrivate.put(`/user-test-attempt/${testAttemptId}/placement-test/submit-completion`,{});
  },
};

export default userAnswerLogService;
