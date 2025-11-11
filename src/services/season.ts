import { axiosPrivate } from "@configs/axios";

const seasonService = {
    getCurrentSeason: async () => {
        return await axiosPrivate.get("/user/stats/season");
    },
};

export default seasonService;