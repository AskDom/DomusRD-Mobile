import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io as ioClient } from "socket.io-client";

import { API_URL, getToken } from "../api/client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

// Mismo servidor Socket.IO que ya usa el web para mensajes en tiempo real
// (io.to(`user:${userId}`)) — acá nos conectamos al mismo canal en vez de
// depender solo del fetch inicial de /api/messages.
export function SocketProvider({ children }) {
  const { currentUser } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    (async () => {
      const token = await getToken();
      if (cancelled || !token) return;

      // "websocket" a secas: el fallback de polling de socket.io-client
      // depende de un handshake HTTP que en RN no siempre respeta el mismo
      // manejo de CORS/Origin que en un navegador — de entrada por websocket
      // evita ese problema.
      const s = ioClient(API_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = s;
      setSocket(s);
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [currentUser?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
