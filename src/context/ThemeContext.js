import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "nativewind";

const STORAGE_KEY = "domusrd-theme";
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  // Igual que el web: arranca siempre en claro y el usuario lo prende a mano
  // (no sigue el tema del sistema) — leemos la preferencia guardada una vez.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      setColorScheme(saved === "dark" ? "dark" : "light");
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDark = async () => {
    const next = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    await SecureStore.setItemAsync(STORAGE_KEY, next);
  };

  // Evita un flash del tema equivocado mientras se lee la preferencia guardada.
  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ dark: colorScheme === "dark", toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
