import { View, Text } from "react-native";

import Image from "./Image";
import { useTheme } from "../context/ThemeContext";

// Título del header nativo de cada pestaña principal — logo + wordmark,
// siempre visible arriba (a diferencia del logo de Login/LockScreen, que
// solo se ve antes de entrar). El header nativo ya resuelve el área segura
// y el borde/sombra inferior solos, no hace falta armarlo a mano.
export default function BrandTitle() {
  const { dark } = useTheme();
  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={dark ? require("../../assets/logo-dark.png") : require("../../assets/logo-light.png")}
        className="w-6 h-6"
        contentFit="contain"
      />
      <Text className="font-extrabold text-lg text-gray-900 dark:text-white">Domify</Text>
    </View>
  );
}
