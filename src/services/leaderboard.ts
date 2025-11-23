import { axiosPrivate } from "@configs/axios";

const leaderboardService = {
    getLeaderboardByRankName: async (rankName: string, currentPage = 1, pageSize = 3) => {
        return await axiosPrivate.get("/leaderboard-season/rank-list", {
            params: {
                rankName,
                currentPage,
                pageSize,
            },
        });
    },  

    getLeaderboardSeasonNow: async () => {
        return await axiosPrivate.get(`/leaderboard-season/reward-now`);
    },
};

export default leaderboardService;