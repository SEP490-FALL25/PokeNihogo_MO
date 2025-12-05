import { getSocket } from "@configs/socket";
import { useAuthStore } from "@stores/auth/auth.config";
import { useNotificationToastStore } from "@stores/notification/notification-ui.store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useSocketNotificationListener = () => {
    const { accessToken } = useAuthStore();
    const showToast = useNotificationToastStore((state) => state.showToast);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!accessToken) return;

        // Kết nối socket namespace 'user' với token
        const socket = getSocket("user", accessToken);

        if (!socket.connected) {
            socket.connect();
        }

        // Emit join room 
        socket.emit("join-user-room");

        const handleNotification = (payload: any) => {
            console.log("Socket Notification Received:", payload);

            // Hiển thị Toast
            showToast({
                id: payload.id,
                title: payload.title || "Thông báo mới",
                message: payload.body || "Bạn có thông báo mới",
                type: payload.type || "DEFAULT",
            });

            // Làm mới danh sách notification
            queryClient.invalidateQueries({ queryKey: ['notification'] });

            // Làm mới User Info/Wallet nếu thông báo liên quan đến Reward
            if (payload.type === 'REWARD') {
                queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
            }
        };

        socket.on("notification", handleNotification);

        // Cleanup khi unmount hoặc đổi token
        return () => {
            socket.off("notification", handleNotification);
            // Không disconnect socket ở đây vì getSocket quản lý singleton, 
            // chỉ disconnect khi logout hoàn toàn (auth service lo việc này)
        };
    }, [accessToken, showToast, queryClient]);
};

