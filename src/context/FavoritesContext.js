import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  const load = useCallback(async () => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }
    try {
      const data = await apiFetch("/api/favorites");
      setFavorites(data.favorites);
    } catch {
      // Sin conexión o error del servidor — dejamos el estado como estaba.
    }
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  // Optimista: actualiza el estado local antes de que responda el backend,
  // y revierte si la llamada falla — misma idea que el toggle del web.
  const toggleFavorite = useCallback(
    async (id) => {
      const wasFavorite = favorites.includes(id);
      setFavorites((prev) => (wasFavorite ? prev.filter((f) => f !== id) : [...prev, id]));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        await apiFetch(`/api/favorites/${id}`, { method: wasFavorite ? "DELETE" : "POST" });
      } catch {
        setFavorites((prev) => (wasFavorite ? [...prev, id] : prev.filter((f) => f !== id)));
      }
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
