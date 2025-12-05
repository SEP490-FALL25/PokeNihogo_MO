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
        // console.log("[SocketListener] Hook mounted. Has Token:", !!accessToken);
        if (!accessToken) return;

        const socket = getSocket("user", accessToken);

        const onConnect = () => {
            console.log("[SocketListener] Connected:", socket.id);
            socket.emit("join-user-room");
        };

        const onDisconnect = () => {
            console.log("[SocketListener] Disconnected");
        };

        if (!socket.connected) {
            socket.connect();
        } else {
            // If already connected, ensure we join room
            socket.emit("join-user-room");
        }

        const handleNotification = (payload: any) => {
            console.log("[SocketListener] Notification Received:", payload);

            let type = payload.type || "DEFAULT";
            let title = payload.title || "Thông báo mới";
            let message = payload.body || "Bạn có thông báo mới";

            if (payload.type === 'REWARDS_RECEIVED') {
                type = 'REWARD';
                if (!payload.title) title = "Nhận thưởng thành công!";

                if (!payload.body && payload.data) {
                    const parts = [];
                    if (payload.data.sparkles?.amount) parts.push(`+${payload.data.sparkles.amount} Sparkles ✨`);
                    if (payload.data.exp?.amount) parts.push(`+${payload.data.exp.amount} EXP 📈`);
                    if (parts.length > 0) message = `Bạn nhận được: ${parts.join(" và ")}`;
                }
            }

            showToast({
                id: payload.notificationId || payload.id,
                title,
                message,
                type,
            });

            queryClient.invalidateQueries({ queryKey: ['notification'] });

            if (type === 'REWARD') {
                queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
            }
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("notification", handleNotification);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("notification", handleNotification);
        };
    }, [accessToken, showToast, queryClient]);
};
