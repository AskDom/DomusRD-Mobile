import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { formatPrice } from "../components/PropertyCard";
import { typeLabel, statusLabel } from "../utils/propertyLabels";
import { colors } from "../theme/colors";

const STATUS_BG = {
  Venta: "bg-brand-700",
  Renta: "bg-emerald-600",
};

function SectionHeader({ children }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-1 h-4 bg-brand-700 dark:bg-brand-400 rounded-full" />
      <Text className="font-extrabold text-base text-gray-900 dark:text-white">{children}</Text>
    </View>
  );
}

export default function PropertyDetail({ route, navigation }) {
  const { id } = route.params;
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { dark } = useTheme();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const iconColor = dark ? "#D1D5DB" : "#374151";

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/properties/${id}`);
        setProperty(data);
      } catch (err) {
        setError(err.message || "No se pudo cargar la propiedad.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color={colors.brand700} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950 px-6">
        <Text className="text-red-600 dark:text-red-400 text-center">
          {error || "Propiedad no encontrada."}
        </Text>
      </View>
    );
  }

  const status = statusLabel(property.status);
  const openInMaps = () => {
    const label = encodeURIComponent(property.title);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}&query_place_id=${label}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={["bottom"]}>
      <ScrollView>
        <View className="relative">
          {property.images?.[0] ? (
            <Image source={{ uri: property.images[0] }} className="w-full h-64" />
          ) : (
            <View className="w-full h-64 bg-gray-100 dark:bg-gray-800" />
          )}

          <View className="absolute top-3 left-3 flex-row items-center gap-1.5">
            {status ? (
              <View className={`${STATUS_BG[status] || "bg-brand-700"} rounded-full px-2.5 py-1`}>
                <Text className="text-white text-xs font-bold">{status}</Text>
              </View>
            ) : null}
            {typeLabel(property.type) ? (
              <View className="bg-white/90 dark:bg-gray-900/85 rounded-full px-2.5 py-1">
                <Text className="text-gray-700 dark:text-gray-200 text-xs font-semibold">
                  {typeLabel(property.type)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <Text className="font-extrabold text-2xl text-gray-900 dark:text-white flex-1 pr-3">
              {property.title}
            </Text>
            <Pressable onPress={() => toggleFavorite(property.id)} hitSlop={8}>
              <Text
                className={
                  isFavorite(property.id)
                    ? "text-accent-500 text-2xl"
                    : "text-gray-300 dark:text-gray-600 text-2xl"
                }
              >
                {isFavorite(property.id) ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="location-outline" size={14} color={dark ? "#9CA3AF" : "#6B7280"} />
            <Text className="text-gray-500 dark:text-gray-400">{property.city}</Text>
          </View>

          {/* Precio */}
          <View className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold mb-1">
              {status === "Renta" ? "Renta mensual" : "Precio de venta"}
            </Text>
            <Text className="font-extrabold text-3xl text-brand-700 dark:text-brand-400">
              {formatPrice(property.price)}
              {status === "Renta" && (
                <Text className="text-base font-normal text-gray-400 dark:text-gray-500"> /mes</Text>
              )}
            </Text>
          </View>

          {/* Características */}
          <View className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <SectionHeader>Características</SectionHeader>
            <View className="flex-row flex-wrap gap-2">
              {property.rooms != null && (
                <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3.5 py-2">
                  <Ionicons name="bed-outline" size={16} color={iconColor} />
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">{property.rooms}</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">hab</Text>
                </View>
              )}
              {property.baths != null && (
                <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3.5 py-2">
                  <MaterialCommunityIcons name="shower" size={16} color={iconColor} />
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">{property.baths}</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">baños</Text>
                </View>
              )}
              {property.parking != null && (
                <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3.5 py-2">
                  <Ionicons name="car-outline" size={16} color={iconColor} />
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">{property.parking}</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">parq</Text>
                </View>
              )}
              <View className="flex-row items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3.5 py-2">
                <Ionicons name="pricetag-outline" size={16} color={iconColor} />
                <Text className="font-semibold text-gray-900 dark:text-white text-sm">{typeLabel(property.type)}</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          {property.description ? (
            <View className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <SectionHeader>Descripción</SectionHeader>
              <Text className="text-gray-600 dark:text-gray-300 leading-6">{property.description}</Text>
            </View>
          ) : null}

          {/* Ubicación */}
          <View className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <SectionHeader>Ubicación</SectionHeader>
            <View className="flex-row items-center gap-1.5 mb-3">
              <Ionicons name="location-outline" size={14} color={dark ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm">{property.city}</Text>
            </View>

            {property.lat != null ? (
              <Pressable
                onPress={openInMaps}
                className="flex-row items-center justify-center gap-2 bg-brand-50 dark:bg-brand-900/25 border border-brand-100 dark:border-brand-800 rounded-2xl py-3.5 active:opacity-80"
              >
                <Ionicons name="map-outline" size={18} color={dark ? colors.brand400 : colors.brand700} />
                <Text className="text-brand-700 dark:text-brand-300 font-semibold">Abrir en Maps</Text>
              </Pressable>
            ) : (
              <View className="items-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-6 px-4">
                <Ionicons name="lock-closed-outline" size={22} color={dark ? "#6B7280" : "#9CA3AF"} />
                <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                  Inicia sesión para ver la ubicación exacta
                </Text>
              </View>
            )}
          </View>

          {property.publishedBy ? (
            <View className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">Publicado por</Text>
              <Text className="font-semibold text-gray-900 dark:text-white mt-1">
                {property.publishedBy.name}
              </Text>

              {property.publishedBy.id !== currentUser?.id && (
                <Pressable
                  onPress={() =>
                    navigation.navigate("ConversationThread", {
                      otherId: property.publishedBy.id,
                      otherName: property.publishedBy.name,
                      propertyId: property.id,
                      propertyTitle: property.title,
                    })
                  }
                  className="bg-brand-700 rounded-2xl py-3.5 items-center mt-3 shadow-sm active:bg-brand-800"
                >
                  <Text className="text-white font-semibold">Contactar al vendedor</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
