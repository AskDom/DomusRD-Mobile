import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Image from "../components/Image";
import { useBiometricLock } from "../context/BiometricLockContext";
import { useTheme } from "../context/ThemeContext";

export default function LockScreen() {
  const { authenticate } = useBiometricLock();
  const { dark } = useTheme();

  // Pide biometría apenas se muestra, para no obligar a un toque extra en
  // el caso normal — el botón de abajo es solo para reintentar si se
  // cancela o falla.
  useEffect(() => {
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-8">
      <Image
        source={dark ? require("../../assets/logo-dark.png") : require("../../assets/logo-light.png")}
        className="w-16 h-16 mb-4"
        contentFit="contain"
      />
      <View className="w-20 h-20 rounded-3xl bg-brand-700 items-center justify-center mb-6">
        <Ionicons name="lock-closed" size={32} color="#fff" />
      </View>
      <Text className="font-bold text-lg text-gray-900 dark:text-white mb-1">Domify bloqueado</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
        Desbloqueá con Face ID o tu huella para continuar.
      </Text>
      <Pressable onPress={authenticate} className="bg-brand-700 rounded-2xl px-6 py-3.5 active:bg-brand-800">
        <Text className="text-white font-semibold">Intentar de nuevo</Text>
      </Pressable>
    </SafeAreaView>
  );
}
