import { createContext, useContext, useState, useCallback, useEffect } from "react";

import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext";

const InboxContext = createContext();

const normalize = (m) => ({
  id: m.id,
  fromId: m.fromId,
  fromName: m.from?.name || "Usuario",
  toId: m.toId,
  toName: m.to?.name || "Usuario",
  propertyId: m.propertyId,
  propertyTitle: m.property?.title || "",
  text: m.text,
  replyToId: m.replyToId,
  createdAt: m.createdAt,
  read: m.read,
});

export function InboxProvider({ children }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUser) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/messages");
      setMessages(data.messages.map(normalize));
    } catch {
      // Sin conexión o error del servidor — dejamos el estado como estaba.
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Optimista: agrega un mensaje temporal, lo reemplaza por el real cuando
  // responde el backend, y lo saca si falla. Sin websocket, este es el único
  // momento en que el hilo se actualiza aparte del refetch al enfocar la pantalla.
  const sendMessage = useCallback(
    async ({ toId, toName, propertyId, propertyTitle, text, replyToId = null }) => {
      const tempId = `temp-${Date.now()}`;
      const temp = {
        id: tempId,
        fromId: currentUser.id,
        fromName: currentUser.name,
        toId,
        toName,
        propertyId,
        propertyTitle,
        text,
        replyToId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => [temp, ...prev]);

      try {
        const data = await apiFetch("/api/messages", {
          method: "POST",
          body: JSON.stringify({ toId, propertyId, text, replyToId }),
        });
        const real = normalize(data.message);
        setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
        return real;
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw err;
      }
    },
    [currentUser]
  );

  const markAsRead = useCallback(async (id) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    try {
      await apiFetch(`/api/messages/${id}/read`, { method: "PATCH" });
    } catch {
      // no revertimos — en el peor caso se corrige en el próximo fetch
    }
  }, []);

  const getConversations = useCallback(() => {
    if (!currentUser) return [];
    const userId = currentUser.id;
    const relevant = messages.filter((m) => m.fromId === userId || m.toId === userId);
    const map = {};
    relevant.forEach((m) => {
      const otherId = m.fromId === userId ? m.toId : m.fromId;
      const otherName = m.fromId === userId ? m.toName : m.fromName;
      const key = `${[userId, otherId].sort().join("-")}-${m.propertyId}`;
      if (!map[key]) {
        map[key] = {
          key,
          otherId,
          otherName,
          propertyId: m.propertyId,
          propertyTitle: m.propertyTitle,
          messages: [],
          unread: 0,
        };
      }
      map[key].messages.push(m);
      if (m.toId === userId && !m.read) map[key].unread++;
    });
    return Object.values(map).sort(
      (a, b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
    );
  }, [messages, currentUser]);

  return (
    <InboxContext.Provider
      value={{ messages, loading, fetchMessages, sendMessage, markAsRead, getConversations }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  return useContext(InboxContext);
}
