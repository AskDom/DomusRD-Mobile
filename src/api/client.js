import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "domusrd-token";

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

// Wrapper de fetch: arma la URL contra el backend e inyecta el Bearer token
// guardado en SecureStore, para no repetirlo en cada llamada del app.
export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    // FormData necesita que fetch arme el Content-Type con el boundary solo —
    // si lo forzamos a JSON acá, el backend no puede parsear el multipart.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.fields?.[0]?.message || data?.error || "Ocurrió un error de red.");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
