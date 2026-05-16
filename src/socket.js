import { io } from "socket.io-client";

const SOCKET_URL = "https://hackhero-api.onrender.com";
export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["polling", "websocket"], 
    autoConnect: false 
});

export const getSocket = () => socket;