import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("token");
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL!, {
      auth: { token },
      autoConnect: false,
    });
  } else {
    socket.auth = { token };
  }
  console.log(socket);
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
