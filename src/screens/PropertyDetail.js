import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";

const formatPrice = (price) =>
  `US$${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function PropertyDetail({ route }) {
  const { id } = route.params;
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
        <ActivityIndicator size="large" color="#1a56db" />
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
          <Text className="font-extrabold text-2xl text-gray-900">{property.title}</Text>
          <Text className="text-gray-500 mt-1">{property.city}</Text>
          <Text className="font-bold text-xl text-blue-700 mt-3">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row gap-4 mt-4">
            {property.rooms != null && (
              <Text className="text-gray-700">{property.rooms} hab.</Text>
            )}
            {property.baths != null && (
              <Text className="text-gray-700">{property.baths} baños</Text>
            )}
            {property.parking != null && (
              <Text className="text-gray-700">{property.parking} parqueos</Text>
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
            </View>
          ) : null}

          {!property.lat && (
            <Pressable className="mt-4">
              <Text className="text-blue-700 font-medium">
                Inicia sesión para ver la ubicación exacta
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
