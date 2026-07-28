import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { formatPrice } from "../components/PropertyCard";
import { colors } from "../theme/colors";

export default function PropertyDetail({ route, navigation }) {
  const { id } = route.params;
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.brand700} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-red-600 text-center">{error || "Propiedad no encontrada."}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView>
        {property.images?.[0] ? (
          <Image source={{ uri: property.images[0] }} className="w-full h-64" />
        ) : (
          <View className="w-full h-64 bg-gray-100" />
        )}

        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <Text className="font-extrabold text-2xl text-gray-900 flex-1 pr-3">
              {property.title}
            </Text>
            <Pressable onPress={() => toggleFavorite(property.id)} hitSlop={8}>
              <Text className={isFavorite(property.id) ? "text-accent-500 text-2xl" : "text-gray-300 text-2xl"}>
                {isFavorite(property.id) ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>
          <Text className="text-gray-500 mt-1">{property.city}</Text>
          <Text className="font-bold text-xl text-brand-700 mt-3">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row gap-2 mt-4">
            {property.rooms != null && (
              <View className="bg-gray-100 rounded-full px-3 py-1.5">
                <Text className="text-gray-700 text-sm">{property.rooms} hab.</Text>
              </View>
            )}
            {property.baths != null && (
              <View className="bg-gray-100 rounded-full px-3 py-1.5">
                <Text className="text-gray-700 text-sm">{property.baths} baños</Text>
              </View>
            )}
            {property.parking != null && (
              <View className="bg-gray-100 rounded-full px-3 py-1.5">
                <Text className="text-gray-700 text-sm">{property.parking} parqueos</Text>
              </View>
            )}
          </View>

          {property.description ? (
            <Text className="text-gray-700 mt-4 leading-6">{property.description}</Text>
          ) : null}

          {property.publishedBy ? (
            <View className="mt-6 pt-4 border-t border-gray-200">
              <Text className="text-gray-500 text-sm">Publicado por</Text>
              <Text className="font-semibold text-gray-900 mt-1">
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

          {!property.lat && (
            <Pressable className="mt-4">
              <Text className="text-brand-700 font-medium">
                Inicia sesión para ver la ubicación exacta
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
