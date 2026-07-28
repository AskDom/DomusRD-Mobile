import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import PropertyCard from "../components/PropertyCard";

export default function PropertyList({ navigation }) {
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
      <View className="px-4 pt-4">
        <Text className="font-bold text-lg text-gray-900">Propiedades</Text>
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
