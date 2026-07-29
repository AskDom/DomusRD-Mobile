import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ToastContext = createContext(null);

const ICONS = {
  success: { name: "checkmark-circle", color: "#10B981" },
  error: { name: "close-circle", color: "#EF4444" },
};

// Siempre montado (nunca condicionalmente {toast && ...}) y con clases
// estáticas (sin ternarios dark:) a propósito — ver los comentarios en
// Perfil.js sobre el bug de NativeWind que dispara un mount/unmount o un
// cambio de necesidad de "variables" después del primer render.
export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState({ message: "", type: "success" });
  const translateY = useRef(new Animated.Value(-200)).current;
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, { toValue: -200, duration: 200, useNativeDriver: true }).start();
  }, [translateY]);

  const showToast = useCallback(
    (message, type = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9 }).start();
      timerRef.current = setTimeout(hide, 2500);
    },
    [hide, translateY]
  );

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const icon = ICONS[toast.type] || ICONS.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents="box-none"
        style={{ transform: [{ translateY }], top: insets.top + 8 }}
        className="absolute left-4 right-4 z-50"
      >
        <Pressable
          onPress={hide}
          className="flex-row items-center gap-2.5 bg-gray-900 dark:bg-gray-800 rounded-2xl px-4 py-3.5 shadow-lg"
        >
          <Ionicons name={icon.name} size={18} color={icon.color} />
          <Text className="text-white text-sm font-medium flex-1" numberOfLines={2}>
            {toast.message}
          </Text>
        </Pressable>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}
