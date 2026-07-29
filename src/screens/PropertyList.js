import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyMap from "../components/PropertyMap";
import { PropertyListSkeleton } from "../components/Skeleton";
import { useTheme } from "../context/ThemeContext";
import { colors } from "../theme/colors";

// Mismos filtros y mismas etiquetas que las tabs de Home.js en el web.
const TABS = [
  { label: "Todos", filter: {} },
  { label: "Apartamentos", filter: { type: "APARTAMENTO" } },
  { label: "Casas", filter: { type: "CASA" } },
  { label: "Villas", filter: { type: "VILLA" } },
  { label: "En Venta", filter: { status: "VENTA" } },
  { label: "En Renta", filter: { status: "RENTA" } },
];

export default function PropertyList({ navigation }) {
  const { dark } = useTheme();
  const placeholderColor = dark ? "#6B7280" : "#9CA3AF";
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  // El backend pagina de a 12 por default — antes esto pedía siempre la
  // página 1 y listo, así que nunca se veía nada más allá de los primeros
  // 12 resultados. buildParams arma la misma búsqueda/filtro para cualquier
  // página, para no repetirlo entre load() y loadMore().
  const buildParams = useCallback(
    (pageNum) => {
      const filter = TABS.find((t) => t.label === activeTab)?.filter || {};
      return new URLSearchParams({
        ...filter,
        ...(query.trim() ? { search: query.trim() } : {}),
        page: String(pageNum),
        limit: "20",
      });
    },
    [activeTab, query]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/properties?${buildParams(1).toString()}`);
      setProperties(data.properties);
      setPage(1);
      setHasMore(data.pagination?.hasMore ?? false);
      setTotal(data.pagination?.total ?? data.properties.length);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las propiedades.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await apiFetch(`/api/properties?${buildParams(nextPage).toString()}`);
      setProperties((prev) => [...prev, ...data.properties]);
      setPage(nextPage);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch {
      // si falla, se queda con lo que ya cargó — el usuario puede volver a
      // hacer scroll para reintentar
    } finally {
      setLoadingMore(false);
    }
  }, [buildParams, page, loading, loadingMore, hasMore]);

  // Recarga al cambiar de categoría al toque; al escribir, con un pequeño
  // debounce para no mandar una petición por cada letra. Siempre vuelve a
  // la página 1 (load, no loadMore) porque buildParams cambió.
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [load]);

  const searchAndTabs = (
    <>
      <View className="flex-row items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5">
        <Ionicons name="search-outline" size={18} color={placeholderColor} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Busca por ciudad o sector..."
          placeholderTextColor={placeholderColor}
          returnKeyType="search"
          onSubmitEditing={load}
          className="flex-1 px-2.5 py-3 text-gray-900 dark:text-white"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => {
          const active = tab.label === activeTab;
          return (
            <Pressable
              key={tab.label}
              onPress={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-full ${
                active
                  ? "bg-brand-700 dark:bg-brand-700"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={
                  active
                    ? "text-white dark:text-white font-semibold text-sm"
                    : "text-gray-600 dark:text-gray-300 text-sm"
                }
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!loading && !error && (
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? "disponible" : "disponibles"}
          </Text>

          <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            {/* Las dos ramas siempre incluyen una clase dark: — ver el
                comentario en Perfil.js sobre por qué alternar dark:
                presente/ausente en un Pressable dispara un bug de
                NativeWind al cambiar de estado. */}
            <Pressable
              onPress={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-full ${
                viewMode === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-transparent dark:bg-transparent"
              }`}
            >
              <Ionicons name="list-outline" size={16} color={viewMode === "list" ? colors.brand700 : placeholderColor} />
            </Pressable>
            <Pressable
              onPress={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-full ${
                viewMode === "map" ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-transparent dark:bg-transparent"
              }`}
            >
              <Ionicons name="map-outline" size={16} color={viewMode === "map" ? colors.brand700 : placeholderColor} />
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  if (viewMode === "map") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
        <View className="px-4 pt-4 pb-2">
          <Text className="font-extrabold text-2xl text-gray-900 dark:text-white mb-3">Propiedades</Text>
          {searchAndTabs}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand700} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-red-600 dark:text-red-400 text-center mb-3">{error}</Text>
            <Pressable onPress={load}>
              <Text className="text-brand-700 dark:text-brand-400 font-semibold">Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <PropertyMap
              properties={properties}
              dark={dark}
              onSelectProperty={(id) => navigation.navigate("PropertyDetail", { id })}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <FlatList
        data={loading || error ? [] : properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        onRefresh={load}
        refreshing={loading}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6">
              <ActivityIndicator color={colors.brand700} />
            </View>
          ) : null
        }
        ListHeaderComponent={
          // Va adentro del FlatList para que se desplace con el scroll en
          // vez de quedar fijo ocupando pantalla todo el tiempo.
          <View className="pb-4">
            <Text className="font-extrabold text-2xl text-gray-900 dark:text-white mb-3">Propiedades</Text>
            {searchAndTabs}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <PropertyListSkeleton />
          ) : error ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-red-600 dark:text-red-400 text-center mb-3">{error}</Text>
              <Pressable onPress={load}>
                <Text className="text-brand-700 dark:text-brand-400 font-semibold">Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center justify-center px-10 py-16">
              <Ionicons name="home-outline" size={40} color={dark ? "#4B5563" : "#D1D5DB"} />
              <Text className="text-center text-gray-500 dark:text-gray-400 mt-3">
                No hay propiedades que coincidan con la búsqueda.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate("PropertyDetail", { id: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}
