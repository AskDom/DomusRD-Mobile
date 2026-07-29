import { View, Text } from "react-native";

export default function SectionHeader({ children }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-1 h-4 bg-brand-700 dark:bg-brand-400 rounded-full" />
      <Text className="font-extrabold text-base text-gray-900 dark:text-white">{children}</Text>
    </View>
  );
}
