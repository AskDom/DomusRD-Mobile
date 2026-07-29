import { View, Text, Image, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { typeLabel, statusLabel } from "../utils/propertyLabels";
import { colors } from "../theme/colors";

export const formatPrice = (price) =>
  `US$${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const STATUS_BG = {
  Venta: "bg-brand-700",
  Renta: "bg-emerald-600",
};

export default function PropertyCard({ property, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { dark } = useTheme();
  const favorited = isFavorite(property.id);
  const status = statusLabel(property.status);
  const type = typeLabel(property.type);
  const iconMuted = dark ? "#9CA3AF" : "#6B7280";
  const iconFaint = dark ? "#6B7280" : "#9CA3AF";

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 mb-4 overflow-hidden shadow-sm active:opacity-95"
    >
      <View className="relative">
        {property.images?.[0] ? (
          <Image source={{ uri: property.images[0] }} className="w-full h-52" />
        ) : (
          <View className="w-full h-52 bg-gray-100 dark:bg-gray-800" />
        )}

        {/* Badges de status y tipo */}
        <View className="absolute top-3 left-3 flex-row items-center gap-1.5">
          {status ? (
            <View className={`${STATUS_BG[status] || "bg-brand-700"} rounded-full px-2.5 py-1`}>
              <Text className="text-white text-xs font-bold">{status}</Text>
            </View>
          ) : null}
          {type ? (
            <View className="bg-white/90 dark:bg-gray-900/85 rounded-full px-2.5 py-1">
              <Text className="text-gray-700 dark:text-gray-200 text-xs font-semibold">{type}</Text>
            </View>
          ) : null}
        </View>

        {/* Favorito */}
        <Pressable
          onPress={() => toggleFavorite(property.id)}
          hitSlop={8}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-gray-900/90 items-center justify-center shadow-sm"
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={16}
            color={favorited ? colors.accent500 : iconMuted}
          />
        </Pressable>

        {/* Precio flotante */}
        <View className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/90 rounded-xl px-3 py-1.5 shadow-sm">
          <Text className="font-extrabold text-gray-900 dark:text-white text-base leading-none">
            {formatPrice(property.price)}
          </Text>
          {status === "Renta" && (
            <Text className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">/mes</Text>
          )}
        </View>
      </View>

      <View className="p-4">
        <Text className="font-bold text-gray-900 dark:text-white text-sm leading-snug" numberOfLines={2}>
          {property.title}
        </Text>
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="location-outline" size={13} color={iconFaint} />
          <Text className="text-gray-400 dark:text-gray-500 text-xs">
            {property.city || "República Dominicana"}
          </Text>
        </View>

        <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {property.rooms != null && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={14} color={iconMuted} />
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{property.rooms} hab</Text>
            </View>
          )}
          {property.baths != null && (
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="shower" size={14} color={iconMuted} />
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{property.baths} baños</Text>
            </View>
          )}
          {property.parking > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="car-outline" size={14} color={iconMuted} />
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{property.parking}</Text>
            </View>
          )}
          {property.verified && (
            <View className="ml-auto flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={13} color="#10B981" />
              <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                Verificada
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
