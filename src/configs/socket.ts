import { useGlobalStore } from '@stores/global/global.config';
import { io, Socket } from 'socket.io-client';

const sockets: Record<string, Socket> = {};

export function getSocket(room: string, token: string): Socket {
  if (!sockets[room] || !sockets[room].connected) {
    const language = useGlobalStore.getState().language || 'vi';

    sockets[room] = io(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}/${room}`, {
      auth: {
        authorization: `Bearer ${token}`,
        'Accept-Language': language,
      },
      transports: ['websocket'],
      forceNew: true,
    });
  }
  return sockets[room];
}

export function disconnectSocket(room?: string): void {
  if (room) {
    if (sockets[room]) {
      sockets[room].disconnect();
      delete sockets[room];
    }
  } else {
    Object.keys(sockets).forEach(key => {
      sockets[key].disconnect();
      delete sockets[key];
    });
  }
}