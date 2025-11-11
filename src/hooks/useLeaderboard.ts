import leaderboardService from "@services/leaderboard";
import { useQuery } from "@tanstack/react-query";


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