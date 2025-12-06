import leaderboardService from "@services/leaderboard";
import { useQuery } from "@tanstack/react-query";

/**
 * Get leaderboard by rank name
 * @param rankName Rank name
 * @param currentPage Current page
 * @param pageSize Page size
 * @param enabled Enabled
 */
export const useLeaderboard = ({
    rankName,
    currentPage = 1,
    pageSize = 3,
    enabled = true,
}: {
    rankName: string;
    currentPage?: number;
    pageSize?: number;
    enabled?: boolean;
}) => {
    const query = useQuery({
        queryKey: ['leaderboard', rankName, currentPage, pageSize],
        queryFn: () => leaderboardService.getLeaderboardByRankName(rankName, currentPage, pageSize),
        enabled: Boolean(rankName) && enabled,
    });

    const responseData = query.data as any;

    return {
        ...query,
        leaderboard: responseData?.data?.data ?? responseData?.data ?? [],
        pagination: responseData?.data?.pagination ?? responseData?.pagination,
    };
};

/**
 * Get leaderboard season now
 * @returns Leaderboard season now data
 */
export const useLeaderboardSeasonNow = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['leaderboard-season-now'],
        queryFn: () => leaderboardService.getLeaderboardSeasonNow(),
    });
    // Response structure: { statusCode, data: {...}, message }
    // axios wraps it: response.data = { statusCode, data: {...}, message }
    // So we need: data?.data (the inner data object)
    const responseData = data as any;
    return {
        data: responseData?.data?.data ?? responseData?.data,
        isLoading,
        isError
    };
};
//------------------------End------------------------//