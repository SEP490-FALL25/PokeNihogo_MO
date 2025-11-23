import { ISrsReviewResponse } from "@models/srs/srs-review.response";
import userSrsReviewService, {
  GetSrsReviewParams,
} from "@services/user-srs-review";
import { useQuery } from "@tanstack/react-query";

const defaultParams: Required<GetSrsReviewParams> = {
  currentPage: 1,
  pageSize: 10,
};

export const useSrsReview = (params?: GetSrsReviewParams) => {
  const mergedParams = {
    ...defaultParams,
    ...(params ?? {}),
  };

  return useQuery<ISrsReviewResponse>({
    queryKey: ["user-srs-review", mergedParams],
    queryFn: async () => {
      const res = await userSrsReviewService.getMyReviews(mergedParams);
      return res.data as ISrsReviewResponse;
    },
    staleTime: 60 * 1000,
  });
};


