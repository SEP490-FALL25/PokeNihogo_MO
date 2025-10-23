import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";

const userProgressService = {
  getMyProgress: async (params: IQueryRequest) => {
    const queryString = new URLSearchParams();

    if (params.currentPage)
      queryString.append("currentPage", params.currentPage.toString());
    if (params.pageSize)
      queryString.append("pageSize", params.pageSize.toString());
    if (params.search) queryString.append("search", params.search);
    if (params.sortBy) queryString.append("sortBy", params.sortBy);
    if (params.sortOrder) queryString.append("sortOrder", params.sortOrder);

    // Add any additional parameters from the catchall
    Object.entries(params).forEach(([key, value]) => {
      if (
        !["currentPage", "pageSize", "search", "sortBy", "sortOrder"].includes(
          key
        ) &&
        value !== undefined
      ) {
        queryString.append(key, value.toString());
      }
    });

    return axiosPrivate.get(`/user-progress?${queryString.toString()}`);
  },
};

export default userProgressService;
