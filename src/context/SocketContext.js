import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { io as ioClient } from "socket.io-client";

import { API_URL, getToken } from "../api/client";
import { useAuth } from "./AuthContext";
import { useIsConnected } from "./NetworkContext";

const SocketContext = createContext(null);

// Mismo servidor Socket.IO que ya usa el web para mensajes en tiempo real
// (io.to(`user:${userId}`)) — acá nos conectamos al mismo canal en vez de
// depender solo del fetch inicial de /api/messages.
export function SocketProvider({ children }) {
  const { currentUser } = useAuth();
  const isConnected = useIsConnected();
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

      // El orden acá importa: con "websocket" primero, si esa conexión
      // directa falla (como en la red real de este teléfono — se vio
      // "connect_error: websocket error" repetido sin parar en los logs),
      // Socket.IO NO prueba "polling" como respaldo en ese mismo intento —
      // solo reintenta el mismo websocket que ya venía fallando. Con
      // "polling" primero arranca por HTTP long-polling (mucho más
      // tolerante a redes restrictivas) e intenta subir a websocket
      // después, sin cortar la conexión si esa mejora no entra.
      const s = ioClient(API_URL, {
        auth: { token },
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionDelay: 2000,
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

  // Un WebSocket de larga duración en el teléfono se puede caer en silencio
  // (pantalla bloqueada, cambio de wifi a datos, túnel/ascensor) sin que la
  // librería lo note enseguida — quedaba "conectado" en apariencia pero sin
  // recibir nada más, y solo se notaba al reabrir la app. Forzamos un
  // reconnect cuando la app vuelve a primer plano o cuando vuelve la red.
  useEffect(() => {
    const tryReconnect = () => {
      const s = socketRef.current;
      if (s && !s.connected) s.connect();
    };

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tryReconnect();
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isConnected) {
      const s = socketRef.current;
      if (s && !s.connected) s.connect();
    }
  }, [isConnected]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
