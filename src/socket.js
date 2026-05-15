import { io } from "socket.io-client";

const SOCKET_URL = "https://hackhero-tpme.onrender.com";
export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: true 
});

export const getSocket = () => socket;
