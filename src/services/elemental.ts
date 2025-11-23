import { axiosPrivate } from "@configs/axios";

const elementalService = {
    getListElemental: async () => {
        return await axiosPrivate.get(`/elemental-type?qs=sort:id&currentPage=1`);
    },
}

export default elementalService