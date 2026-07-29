import { createContext, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

const NetworkContext = createContext(true);

export function NetworkProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable puede quedar en null mientras se determina —
      // solo lo tratamos como "sin conexión" cuando explícitamente es false,
      // para no mostrar el banner de arranque antes de que NetInfo resuelva.
      setIsConnected(state.isConnected !== false && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  return <NetworkContext.Provider value={isConnected}>{children}</NetworkContext.Provider>;
}

export function useIsConnected() {
  return useContext(NetworkContext);
}
