import { axiosPrivate } from "@configs/axios";

const notificationService = {
    showNotification: async (currentPage: number, pageSize: number) => {
        return axiosPrivate.get(`/notification/user?currentPage=${currentPage}&pageSize=${pageSize}`);
    },
    readNotification: async (notificationId: number) => {
        return axiosPrivate.put(`/notification/read/${notificationId}`);
    },
};

export default notificationService;