import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";

type GetHistoryExercisesParams = {
  currentPage?: number;
  pageSize?: number;
};

type GetHistoryTestsParams = {
  currentPage?: number;
  pageSize?: number;
};

const userHistoryService = {
  /**
   * Get list of completed exercises
   * GET /user-history/history-exercises
   */
  getHistoryExercises: async (params?: GetHistoryExercisesParams) => {
    const queryParams = new URLSearchParams();
    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    const queryString = queryParams.toString();
    return axiosPrivate.get(
      `/user-history/history-exercises${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get list of completed tests
   * GET /user-history/history-tests
   */
  getHistoryTests: async (params?: GetHistoryTestsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    const queryString = queryParams.toString();
    return axiosPrivate.get(
      `/user-history/history-tests${queryString ? `?${queryString}` : ""}`
    );
  },
};

export default userHistoryService;

