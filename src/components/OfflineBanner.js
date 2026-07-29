import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useIsConnected } from "../context/NetworkContext";

// Siempre montado, clases estáticas (sin ternarios dark:) — mismo motivo que
// ToastContext: evita el bug de NativeWind con mount/unmount condicional.
export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const isConnected = useIsConnected();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -60 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ transform: [{ translateY }], top: insets.top }}
      className="absolute left-0 right-0 z-50 bg-gray-900 flex-row items-center justify-center gap-2 py-2"
    >
      <Ionicons name="cloud-offline-outline" size={14} color="#F2703C" />
      <Text className="text-white text-xs font-semibold">Sin conexión a internet</Text>
    </Animated.View>
  );
}
