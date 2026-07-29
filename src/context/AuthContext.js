import { createContext, useContext, useState, useCallback, useEffect } from "react";

import { apiFetch, setToken, clearToken, getToken as getStoredToken } from "../api/client";

const ROLE_DISPLAY = { CLIENTE: "Cliente", VENDEDOR: "Vendedor", AGENTE: "Agente", ADMIN: "Admin" };
const normalizeUser = (user) => ({ ...user, role: ROLE_DISPLAY[user.role] || user.role });

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // SecureStore es async, así que la sesión guardada no está disponible en
  // el primer render — bootstrapping cubre esa carga inicial.
  const [bootstrapping, setBootstrapping] = useState(true);

  // Al arrancar: cargar la sesión guardada y refrescarla contra el backend.
  // Si el token expiró, se limpia la sesión; si el error es de red/servidor,
  // seguimos con la sesión guardada localmente.
  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const data = await apiFetch("/api/auth/me");
        setCurrentUser(normalizeUser(data.user));
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          await clearToken();
          setCurrentUser(null);
        }
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      const user = normalizeUser(data.user);
      await setToken(data.token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const user = normalizeUser(data.user);
      await setToken(data.token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Antes de limpiar el token — el endpoint necesita el Bearer para
      // saber de qué usuario borrar los push tokens registrados.
      await apiFetch("/api/notifications/push-token", { method: "DELETE" });
    } catch {
      // no bloqueamos el logout si esto falla
    }
    await clearToken();
    setCurrentUser(null);
  }, []);

  // asset: { uri, name, type } tal como lo entrega expo-image-picker.
  const updateAvatar = useCallback(async (asset) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("avatar", { uri: asset.uri, name: asset.name, type: asset.type });
      const data = await apiFetch("/api/auth/avatar", { method: "POST", body: formData });
      const user = normalizeUser(data.user);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "No se pudo actualizar la foto de perfil.");
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateAvatar,
        error,
        setError,
        loading,
        bootstrapping,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
