import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { typeLabel, statusLabel } from "../utils/propertyLabels";
import { formatPrice } from "./PropertyCard";
import { colors } from "../theme/colors";

// Tarjeta compacta en fila — para listas donde la tarjeta grande de
// PropertyCard generaría confusión con el feed principal (ej. Favoritos).
export default function PropertyListItem({ property, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { dark } = useTheme();
  const favorited = isFavorite(property.id);
  const iconColor = dark ? "#9CA3AF" : "#6B7280";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-3 overflow-hidden shadow-sm active:opacity-90"
    >
      {property.images?.[0] ? (
        <Image source={{ uri: property.images[0] }} className="w-24 h-24" />
      ) : (
        <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 items-center justify-center">
          <Ionicons name="home-outline" size={22} color={iconColor} />
        </View>
      )}

      <View className="flex-1 p-3 justify-center">
        <View className="flex-row items-center gap-1.5 flex-wrap mb-1">
          <Text className="text-[10px] font-bold text-brand-700 dark:text-brand-300">
            {statusLabel(property.status)}
          </Text>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">
            · {typeLabel(property.type)}
          </Text>
        </View>

        <Text className="font-bold text-gray-900 dark:text-white text-sm" numberOfLines={1}>
          {property.title}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Ionicons name="location-outline" size={11} color={iconColor} />
          <Text className="text-gray-400 dark:text-gray-500 text-xs" numberOfLines={1}>
            {property.city}
          </Text>
        </View>
        <Text className="font-extrabold text-brand-700 dark:text-brand-400 text-sm mt-1">
          {formatPrice(property.price)}
        </Text>
      </View>

      <Pressable
        onPress={() => toggleFavorite(property.id)}
        hitSlop={8}
        className="items-center justify-center pr-3"
      >
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={20}
          color={favorited ? colors.accent500 : iconColor}
        />
      </Pressable>
    </Pressable>
  );
}
