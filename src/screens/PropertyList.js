import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const formatPrice = (price) =>
  `US$${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function PropertyCard({ property, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden"
    >
      {property.images?.[0] ? (
        <Image source={{ uri: property.images[0] }} className="w-28 h-28" />
      ) : (
        <View className="w-28 h-28 bg-gray-100" />
      )}
      <View className="flex-1 p-3 justify-center">
        <Text className="font-semibold text-gray-900" numberOfLines={1}>
          {property.title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
          {property.city}
        </Text>
        <Text className="font-extrabold text-blue-700 mt-2">
          {formatPrice(property.price)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PropertyList({ navigation }) {
  const { logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/properties");
      setProperties(data.properties);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las propiedades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <View className="px-4 pt-4 flex-row items-center justify-between">
        <Text className="font-bold text-lg text-gray-900">Propiedades</Text>
        <Pressable onPress={logout}>
          <Text className="text-blue-700 font-medium">Cerrar sesión</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center mb-3">{error}</Text>
          <Pressable onPress={load}>
            <Text className="text-blue-700 font-semibold">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No hay propiedades publicadas todavía.
            </Text>
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate("PropertyDetail", { id: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
