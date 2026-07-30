import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const LOCK_KEY = "domify-biometric-lock";

const BiometricLockContext = createContext(null);

export function BiometricLockProvider({ children }) {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const [hasHardware, isEnrolled, stored] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        SecureStore.getItemAsync(LOCK_KEY),
      ]);
      setAvailable(hasHardware && isEnrolled);
      setEnabledState(stored === "1");
      setReady(true);
    })();
  }, []);

  // Vuelve a pedir biometría cada vez que la app vuelve de segundo plano, no
  // solo en el arranque en frío — si no, "bloquear con Face ID" no protege
  // nada en el caso real (alguien toma el teléfono con la app ya abierta).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/active/) && next.match(/inactive|background/)) {
        setUnlocked(false);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  const setEnabled = async (value) => {
    setEnabledState(value);
    await SecureStore.setItemAsync(LOCK_KEY, value ? "1" : "0");
    if (value) setUnlocked(false);
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloqueá Domify",
      cancelLabel: "Cancelar",
    });
    if (result.success) setUnlocked(true);
    return result.success;
  };

  return (
    <BiometricLockContext.Provider value={{ available, enabled, unlocked, ready, setEnabled, authenticate }}>
      {children}
    </BiometricLockContext.Provider>
  );
}

export function useBiometricLock() {
  return useContext(BiometricLockContext);
}
