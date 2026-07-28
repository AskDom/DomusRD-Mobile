import { View, Text, Image, Pressable } from "react-native";

import { useFavorites } from "../context/FavoritesContext";

export const formatPrice = (price) =>
  `US$${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function PropertyCard({ property, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-white rounded-2xl border border-gray-100 mb-3 overflow-hidden shadow-sm active:opacity-90"
    >
      {property.images?.[0] ? (
        <Image source={{ uri: property.images[0] }} className="w-28 h-28" />
      ) : (
        <View className="w-28 h-28 bg-gray-100" />
      )}
      <View className="flex-1 p-3 justify-center">
        <View className="flex-row items-start justify-between">
          <Text className="font-semibold text-gray-900 flex-1 pr-2" numberOfLines={1}>
            {property.title}
          </Text>
          <Pressable onPress={() => toggleFavorite(property.id)} hitSlop={8}>
            <Text className={favorited ? "text-accent-500 text-lg" : "text-gray-300 text-lg"}>
              {favorited ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
          {property.city}
        </Text>
        <Text className="font-extrabold text-brand-700 mt-2">{formatPrice(property.price)}</Text>
      </View>
    </Pressable>
  );
}
