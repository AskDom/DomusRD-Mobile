import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";

export default function StarRating({ value, onChange, readOnly = false, size = 22 }) {
  const { dark } = useTheme();
  const emptyColor = dark ? "#4B5563" : "#D1D5DB";

  return (
    <View className="flex-row" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} disabled={readOnly} onPress={() => onChange?.(star)} hitSlop={4}>
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color={star <= value ? "#FBBF24" : emptyColor}
          />
        </Pressable>
      ))}
    </View>
  );
}
