import { axiosPrivate } from "@configs/axios";

export type GetSrsReviewParams = {
  currentPage?: number;
  pageSize?: number;
};

const userSrsReviewService = {
  /**
   * GET /user-srs-review/my
   * Fetch personalized spaced-repetition reminders for the current user
   */
  getMyReviews: (params?: GetSrsReviewParams) => {
    const queryParams = new URLSearchParams();
    if (params?.currentPage) {
      queryParams.append("currentPage", params.currentPage.toString());
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const queryString = queryParams.toString();
    const url = `/user-srs-review/my${queryString ? `?${queryString}` : ""}`;

    return axiosPrivate.get(url);
  },
  /**
   * PATCH /user-srs-review/{id}/read
   * Mark SRS review as read
   */
  markAsRead: (id: string) => {
    return axiosPrivate.patch(`/user-srs-review/${id}/read`);
  },
};

export default userSrsReviewService;

