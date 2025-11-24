import { axiosPrivate } from "@configs/axios";
import { RewardSourceType } from "@constants/reward.enum";
import { IRewardHistoryResponse } from "@models/reward/reward.response";

type GetRewardHistoryParams = {
  currentPage?: number;
  pageSize?: number;
  sourceType?: RewardSourceType;
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
};

const rewardService = {
  /**
   * Get reward history
   * GET /user-reward-history/my
   */
  getRewardHistory: async (params?: GetRewardHistoryParams): Promise<IRewardHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    if (params?.sourceType) {
      queryParams.append("sourceType", params.sourceType);
    }
    if (params?.dateFrom) {
      queryParams.append("dateFrom", params.dateFrom);
    }
    if (params?.dateTo) {
      queryParams.append("dateTo", params.dateTo);
    }
    const queryString = queryParams.toString();
    const response = await axiosPrivate.get(
      `/user-reward-history/my${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default rewardService;

