import { useSocketNotificationListener } from "@hooks/useSocketNotificationListener";

/**
 * Component invisible để kích hoạt lắng nghe socket global
 * Phải được đặt bên trong ReactQueryProvider
 */
export const GlobalSocketManager = () => {
  useSocketNotificationListener();
  return null;
};

