import { io } from "socket.io-client";

const SOCKET_URL = "https://hackhero-tpme.onrender.com";
export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["polling", "websocket"], 
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const getSocket = () => socket;
