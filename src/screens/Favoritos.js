import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "../api/client";
import { useFavorites } from "../context/FavoritesContext";
import PropertyListItem from "../components/PropertyListItem";
import { colors } from "../theme/colors";

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={["left", "right", "bottom"]}>
      <View className="px-4 pt-4 pb-1">
        <Text className="font-extrabold text-2xl text-gray-900 dark:text-white">Favoritos</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand700} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-10 pt-16">
              <Text className="text-5xl mb-3">♡</Text>
              <Text className="text-center text-gray-500 dark:text-gray-400">
                Todavía no marcaste ninguna propiedad como favorita.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PropertyListItem
              property={item}
              onPress={() => navigation.navigate("PropertyDetail", { id: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
