import { axiosPrivate } from "@configs/axios";
import { IRewardHistoryResponse } from "@models/reward/reward.response";

type GetRewardHistoryParams = {
  currentPage?: number;
  pageSize?: number;
};

const rewardService = {
  /**
   * Get reward history
   * GET /user-reward-history
   */
  getRewardHistory: async (params?: GetRewardHistoryParams): Promise<IRewardHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    const queryString = queryParams.toString();
    const response = await axiosPrivate.get(
      `/user-reward-history${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default rewardService;

