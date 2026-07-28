import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Placeholder({ title }) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-bold text-lg text-gray-900">{title}</Text>
        <Text className="mt-2 text-gray-500 text-center">Próximamente.</Text>
      </View>
    </SafeAreaView>
  );
}
