import { useGlobalStore } from '@stores/global/global.config';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(room: string, token: string): Socket {
  if (!socket || !socket.connected) {
    const language = useGlobalStore.getState().language || 'vi';

    socket = io(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}/${room}`, {
      auth: {
        authorization: `Bearer ${token}`,
        'Accept-Language': language,
      },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}