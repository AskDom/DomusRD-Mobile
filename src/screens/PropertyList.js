import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import { colors } from "../theme/colors";

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
      <View className="px-4 pt-4 pb-1">
        <Text className="font-extrabold text-2xl text-gray-900">Propiedades</Text>
        {!loading && !error && (
          <Text className="text-gray-500 mt-0.5">
            {properties.length} {properties.length === 1 ? "disponible" : "disponibles"}
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand700} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center mb-3">{error}</Text>
          <Pressable onPress={load}>
            <Text className="text-brand-700 font-semibold">Reintentar</Text>
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
