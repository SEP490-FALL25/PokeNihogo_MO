import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";
import { UserProgressResponseSchema } from "@models/user-progress/user-progress.response";
import { PerformanceMonitor } from "@utils/performance";

// Cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const userProgressService = {
  getMyProgress: async (params: IQueryRequest) => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTimer("userProgressService.getMyProgress");

    // Create cache key
    const cacheKey = `user-progress-${JSON.stringify(params)}`;

    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      monitor.endTimer("userProgressService.getMyProgress");
      return cached.data;
    }

    try {
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
          ![
            "currentPage",
            "pageSize",
            "search",
            "sortBy",
            "sortOrder",
          ].includes(key) &&
          value !== undefined
        ) {
          queryString.append(key, value.toString());
        }
      });

      const response = await axiosPrivate.get(
        `user-progress/my?${queryString.toString()}`
      );
      // Validate response with Zod schema
      const validatedData = UserProgressResponseSchema.parse(response.data);

      // Cache the response
      responseCache.set(cacheKey, {
        data: validatedData,
        timestamp: Date.now(),
      });

      monitor.endTimer("userProgressService.getMyProgress");
      return validatedData;
    } catch (error) {
      monitor.endTimer("userProgressService.getMyProgress");
      throw error;
    }
  },

  // Clear cache method
  clearCache: () => {
    responseCache.clear();
  },

  // Get cache stats
  getCacheStats: () => {
    return {
      size: responseCache.size,
      keys: Array.from(responseCache.keys()),
    };
  },
};

export default userProgressService;
