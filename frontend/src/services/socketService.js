import { io } from "socket.io-client";
import { API_BASE_URL, assertApiBaseUrl } from "../config/runtime";

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;
  assertApiBaseUrl();

  const token = localStorage.getItem("accessToken");

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
