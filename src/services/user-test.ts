import { axiosPrivate } from "@configs/axios";
import { TestStatus } from "@constants/test.enum";
import { IUpsertUserTestAnswerLogRequest } from "@models/user-test-answer-log/user-test-answer-log.request";
import { TestDetail, TestFullUserResponseSchema } from "@models/user-test/test-full-user.response";

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

  // Lấy toàn bộ thông tin test + sets + questions cho user
  getTestFullUser: async (testId: string | number): Promise<TestDetail> => {
    const { data } = await axiosPrivate.get(`/test/${testId}/full-user`);
    // Some APIs return envelope { statusCode, data, message }
    const parsed = TestFullUserResponseSchema.safeParse(data);
    if (parsed.success) return parsed.data.data;
    // Fallback: if BE returns raw object
    const fallback = TestFullUserResponseSchema.shape.data.safeParse(data?.data ?? data);
    if (fallback.success) return fallback.data;
    // If parsing fails, still return raw data to avoid breaking UI
    return (data?.data ?? data) as TestDetail;
  },

  // Lấy bài test attempt (tự tạo attempt nếu cần) theo testId
  getAttemptByTestId: async (testId: string | number) => {
    return axiosPrivate.get(`/user-test-attempt/test/${testId}`);
  },

  // Lấy câu hỏi test từ lesson (API mới cho lesson review test)
  getLessonReviewQuestions: async (testId: string | number) => {
    return axiosPrivate.get(`/test/lesson-review/${testId}/questions`);
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
  abandonTest: async (userTestAttemptId: string | number) => {
    return axiosPrivate.put(`/user-test-attempt/${userTestAttemptId}/abandon`);
  },
};

export default userTestService;


