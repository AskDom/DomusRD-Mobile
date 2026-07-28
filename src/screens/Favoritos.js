import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import { useFavorites } from "../context/FavoritesContext";
import PropertyCard from "../components/PropertyCard";

export default function Favoritos({ navigation }) {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // /api/favorites solo da IDs — pedimos el detalle de cada uno en paralelo.
  // Los favoritos de un usuario son pocos, así que N pedidos no es un problema.
  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      favorites.map((id) => apiFetch(`/api/properties/${id}`).catch(() => null))
    );
    setProperties(results.filter(Boolean));
    setLoading(false);
  }, [favorites]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <View className="px-4 pt-4">
        <Text className="font-bold text-lg text-gray-900">Favoritos</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1a56db" />
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
              Todavía no marcaste ninguna propiedad como favorita.
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
