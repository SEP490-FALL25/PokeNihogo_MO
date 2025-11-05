import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(room: string, token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}/${room}`, {
      auth: { authorization: `Bearer ${token}` },
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