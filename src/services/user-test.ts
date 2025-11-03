import { axiosPrivate } from "@configs/axios";
import { TestStatus } from "@constants/test.enum";
import { IUpsertUserTestAnswerLogRequest } from "@models/user-test-answer-log/user-test-answer-log.request";

type GetMyUserTestsParams = {
  currentPage?: number;
  pageSize?: number;
  status?: string;
  testId?: string | number;
  type: TestStatus | string;
};

const userTestService = {
  getMy: async (params: GetMyUserTestsParams) => {
    const search = new URLSearchParams();
    if (params.currentPage) search.append("currentPage", String(params.currentPage));
    if (params.pageSize) search.append("pageSize", String(params.pageSize));
    if (params.status) search.append("status", params.status);
    if (params.testId) search.append("testId", String(params.testId));
    if (params.type) search.append("type", String(params.type));
    const qs = search.toString();
    return axiosPrivate.get(`/user-test/my${qs ? `?${qs}` : ""}`);
  },

  // Lấy bài test attempt (tự tạo attempt nếu cần) theo testId
  getAttemptByTestId: async (testId: string | number) => {
    return axiosPrivate.get(`/user-test-attempt/test/${testId}`);
  },

  // Kiểm tra trạng thái hoàn thành bài test (reading)
  checkCompletion: async (userTestAttemptId: string | number) => {
    return axiosPrivate.get(`/user-test-attempt/${userTestAttemptId}/check-completion`);
  },

  // Nộp bài test (reading)
  submitCompletion: async (userTestAttemptId: string | number, time: number) => {
    return axiosPrivate.put(`/user-test-attempt/${userTestAttemptId}/submit-completion`, { time });
  },

  upsertTestAnswerLog: async (answerLog: IUpsertUserTestAnswerLogRequest) => {
    return axiosPrivate.post(`/user-test-answer-log/upsert`, answerLog);
  },
  getReviewResult: async (userTestAttemptId: string | number) => {
    return axiosPrivate.get(`/user-test-attempt/test/${userTestAttemptId}/review`);
  },
};

export default userTestService;


