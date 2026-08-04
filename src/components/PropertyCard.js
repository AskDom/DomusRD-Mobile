import { useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { typeLabel, statusLabel, formatLocation } from "../utils/propertyLabels";
import { colors } from "../theme/colors";
import Image from "./Image";

export const formatPrice = (price, currency = "USD") => {
  const symbol = currency === "DOP" ? "RD$" : "US$";
  return `${symbol}${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

// Mismo padding horizontal que usa el contentContainerStyle del FlatList del
// feed (16px de cada lado) — la imagen ocupa todo ese ancho, como en Airbnb.
const HORIZONTAL_PADDING = 32;

export default function PropertyCard({ property, onPress }) {
  const { width } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { dark } = useTheme();
  const [activeImage, setActiveImage] = useState(0);

  const favorited = isFavorite(property.id);
  const status = statusLabel(property.status);
  const images = property.images?.length ? property.images : [null];
  const imageSize = width - HORIZONTAL_PADDING;
  const iconMuted = dark ? "#9CA3AF" : "#6B7280";

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / imageSize);
    if (idx !== activeImage) setActiveImage(idx);
  };

  const amenities = [
    property.rooms != null && `${property.rooms} hab`,
    property.baths != null && `${property.baths} baños`,
    property.parking > 0 && `${property.parking} parq`,
  ].filter(Boolean);

  return (
    <View className="mb-7">
      <View className="relative rounded-2xl overflow-hidden" style={{ width: imageSize, height: imageSize }}>
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
        >
          {/* El Pressable de "abrir propiedad" va por imagen, adentro del
              ScrollView, en vez de envolviendo todo el card desde afuera —
              así el propio ScrollView decide si el toque fue swipe o tap
              (nativo, sin ambigüedad) en lugar de competir con un Pressable
              ancestro que a veces se quedaba con el gesto. */}
          {images.map((uri, i) => (
            <Pressable key={i} onPress={onPress}>
              {uri ? (
                <Image
                  source={{ uri }}
                  style={{ width: imageSize, height: imageSize }}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <View
                  style={{ width: imageSize, height: imageSize }}
                  className="bg-gray-100 dark:bg-gray-800 items-center justify-center"
                >
                  <Ionicons name="home-outline" size={32} color={iconMuted} />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View className="absolute bottom-2.5 self-center flex-row gap-1">
            {images.map((_, i) => (
              <View
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === activeImage ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </View>
        )}

        {status ? (
          <View className="absolute top-3 left-3 bg-white rounded-full px-2.5 py-1">
            <Text className="text-gray-900 text-[11px] font-bold">{status}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => toggleFavorite(property.id)}
          hitSlop={8}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/25 items-center justify-center"
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={19}
            color={favorited ? colors.accent500 : "#fff"}
          />
        </Pressable>
      </View>

      <Pressable onPress={onPress} className="pt-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="font-semibold text-gray-900 dark:text-white text-[15px] flex-1" numberOfLines={1}>
            {property.title}
          </Text>
          {property.verified && (
            <View className="flex-row items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full pl-1 pr-1.5 py-0.5">
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Verificado</Text>
            </View>
          )}
        </View>

        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5" numberOfLines={1}>
          {typeLabel(property.type)} en {formatLocation(property.city, property.sector)}
        </Text>

        {amenities.length > 0 && (
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-0.5" numberOfLines={1}>
            {amenities.join(" · ")}
          </Text>
        )}

        <View className="flex-row items-baseline gap-1 mt-1.5">
          <Text className="font-bold text-gray-900 dark:text-white text-[15px]">
            {formatPrice(property.price, property.currency)}
          </Text>
          {status === "Renta" && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm">/mes</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
