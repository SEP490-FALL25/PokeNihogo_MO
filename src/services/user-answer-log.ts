import { axiosPrivate } from "@configs/axios";
import { IUpsertUserAnswerLogRequest } from "@models/user-answer-log/user-answer-log.request";

const userAnswerLogService = {
  upsertAnswerLog: async (answerLog: IUpsertUserAnswerLogRequest) => {
    return axiosPrivate.post(`/user-answer-log/upsert`, answerLog);
  },
};

export default userAnswerLogService;
