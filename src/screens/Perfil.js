import { View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const { currentUser, logout } = useAuth();

  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="items-center pt-10 px-6">
        {currentUser?.avatar ? (
          <Image
            source={{ uri: currentUser.avatar }}
            className="w-24 h-24 rounded-full bg-gray-200"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-blue-700 items-center justify-center">
            <Text className="text-white font-extrabold text-3xl">{initial}</Text>
          </View>
        )}

        <Text className="font-bold text-xl text-gray-900 mt-4">{currentUser?.name}</Text>
        <Text className="text-gray-500 mt-1">{currentUser?.email}</Text>

        <View className="bg-blue-50 rounded-full px-3 py-1 mt-3">
          <Text className="text-blue-700 font-semibold text-xs">{currentUser?.role}</Text>
        </View>
      </View>

      <View className="mt-10 px-6">
        <Pressable
          onPress={logout}
          className="border border-red-200 rounded-xl py-3 items-center"
        >
          <Text className="text-red-600 font-semibold">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
