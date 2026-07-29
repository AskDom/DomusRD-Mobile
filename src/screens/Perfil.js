import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../components/PropertyCard";
import ErrorBoundary from "../components/ErrorBoundary";
import { MyPropertyRowSkeleton } from "../components/Skeleton";
import Image from "../components/Image";
import { typeLabel, statusLabel } from "../utils/propertyLabels";
import { colors } from "../theme/colors";

const ROLE_BG = {
  Admin: "bg-purple-600",
  Agente: "bg-amber-500",
  Vendedor: "bg-emerald-600",
  Cliente: "bg-brand-700",
};

const STATUS_BADGE_BG = {
  Venta: "bg-brand-50 dark:bg-brand-900/30",
  Renta: "bg-emerald-50 dark:bg-emerald-900/30",
  Vendido: "bg-gray-100 dark:bg-gray-800",
  Rentado: "bg-purple-50 dark:bg-purple-900/30",
};
const STATUS_BADGE_TEXT = {
  Venta: "text-brand-700 dark:text-brand-300",
  Renta: "text-emerald-700 dark:text-emerald-400",
  Vendido: "text-gray-500 dark:text-gray-400",
  Rentado: "text-purple-700 dark:text-purple-400",
};

function StatCard({ value, label }) {
  return (
    <View className="flex-1 items-center">
      <Text className="font-extrabold text-2xl text-gray-900 dark:text-white">{value}</Text>
      <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

function MyPropertyRow({ property, onEdit, onDelete, onVerify, iconColor }) {
  const status = statusLabel(property.status);
  const badgeBg = STATUS_BADGE_BG[status] || STATUS_BADGE_BG.Venta;
  const badgeText = STATUS_BADGE_TEXT[status] || STATUS_BADGE_TEXT.Venta;

  return (
    <View className="flex-row bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-3 overflow-hidden shadow-sm">
      {property.images?.[0] ? (
        <Image source={{ uri: property.images[0] }} className="w-24 h-24" contentFit="cover" transition={150} />
      ) : (
        <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 items-center justify-center">
          <Ionicons name="home-outline" size={24} color={iconColor} />
        </View>
      )}

      <View className="flex-1 p-3">
        <View className="flex-row items-center gap-1.5 flex-wrap mb-1">
          <View className={`${badgeBg} rounded-full px-2 py-0.5`}>
            <Text className={`text-[10px] font-bold ${badgeText}`}>{status}</Text>
          </View>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            <Text className="text-[10px] text-gray-500 dark:text-gray-400">{typeLabel(property.type)}</Text>
          </View>
          {property.verified && <Ionicons name="checkmark-circle" size={14} color="#10B981" />}
        </View>

        <Text className="font-bold text-gray-900 dark:text-white text-sm" numberOfLines={1}>
          {property.title}
        </Text>
        <Text className="font-extrabold text-brand-700 dark:text-brand-400 text-sm mt-0.5">
          {formatPrice(property.price)}
        </Text>

        <View className="flex-row items-center gap-3 mt-2">
          <Pressable onPress={() => onEdit(property)} hitSlop={6}>
            <Ionicons name="pencil-outline" size={16} color={iconColor} />
          </Pressable>
          {!property.verified && (
            <Pressable onPress={() => onVerify(property)} hitSlop={6}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            </Pressable>
          )}
          <Pressable onPress={() => onDelete(property)} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Perfil(props) {
  return (
    <ErrorBoundary>
      <PerfilScreen {...props} />
    </ErrorBoundary>
  );
}

function PerfilScreen({ navigation }) {
  const { currentUser, logout, updateAvatar } = useAuth();
  const { favorites } = useFavorites();
  const { dark, toggleDark } = useTheme();
  const { showToast } = useToast();
  const [tab, setTab] = useState("propiedades");
  const [myProperties, setMyProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const iconColor = dark ? "#9CA3AF" : "#6B7280";
  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || "?";
  const roleBg = ROLE_BG[currentUser?.role] || ROLE_BG.Cliente;

  const loadMyProperties = useCallback(async () => {
    if (!currentUser) return;
    setLoadingProps(true);
    try {
      const data = await apiFetch("/api/properties?limit=50");
      setMyProperties(data.properties.filter((p) => p.publishedById === currentUser.id));
    } catch {
      // dejamos la lista como estaba si falla
    } finally {
      setLoadingProps(false);
    }
  }, [currentUser]);

  // Antes recargaba en cada foco (useFocusEffect) — pero eso significaba que
  // el swap "cargando" -> "lista" pasaba una y otra vez cada vez que se
  // volvía a esta pantalla, y ese swap repetido era lo que seguía
  // disparando el bug de NativeWind más abajo. Ahora carga solo una vez;
  // el pull-to-refresh (RefreshControl) cubre el caso de querer refrescar.
  useEffect(() => {
    loadMyProperties();
  }, [loadMyProperties]);

  const handleAvatarPress = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setUploadingAvatar(true);
    const updated = await updateAvatar({
      uri: asset.uri,
      name: asset.fileName || `avatar-${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
    setUploadingAvatar(false);
    showToast(
      updated ? "Foto de perfil actualizada" : "No se pudo actualizar la foto de perfil.",
      updated ? "success" : "error"
    );
  };

  const handleEdit = (property) => navigation.navigate("Publish", { property });

  const handleDelete = (property) => {
    Alert.alert("¿Eliminar esta propiedad?", property.title, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/properties/${property.id}`, { method: "DELETE" });
            setMyProperties((prev) => prev.filter((p) => p.id !== property.id));
            showToast("Propiedad eliminada", "success");
          } catch (err) {
            showToast(err.message || "No se pudo eliminar la propiedad.", "error");
          }
        },
      },
    ]);
  };

  const handleVerify = async (property) => {
    try {
      await apiFetch(`/api/properties/${property.id}`, {
        method: "PUT",
        body: JSON.stringify({ verified: true }),
      });
      setMyProperties((prev) => prev.map((p) => (p.id === property.id ? { ...p, verified: true } : p)));
      showToast("Propiedad verificada", "success");
    } catch (err) {
      showToast(err.message || "No se pudo verificar la propiedad.", "error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/*
        ScrollView simple en vez de FlatList: "mis propiedades" de un
        vendedor es una lista corta, no necesita virtualización — y la
        virtualización (VirtualizedList reciclando las celdas) era la causa
        real del error de navegación: al vaciar `data` al cambiar de
        pestaña, FlatList desmontaba las celdas con los Pressable de
        editar/verificar/borrar, y ahí se repetía la misma confusión de
        NativeWind por posición que ya se había resuelto en el resto de la
        pantalla. Sin FlatList, no hay celdas que reciclar.
      */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loadingProps} onRefresh={loadMyProperties} />}
      >
        <View>
          {/* Header */}
            <View className="bg-white dark:bg-gray-900 mx-4 mt-4 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 flex-row items-center gap-4">
              <Pressable onPress={handleAvatarPress} className="relative">
                {currentUser?.avatar ? (
                  <Image
                    source={{ uri: currentUser.avatar }}
                    className="w-20 h-20 rounded-2xl"
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View className={`w-20 h-20 rounded-2xl ${roleBg} items-center justify-center`}>
                    <Text className="text-white font-extrabold text-2xl">{initial}</Text>
                  </View>
                )}
                <View className="absolute inset-0 rounded-2xl bg-black/30 items-center justify-center">
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                  )}
                </View>
              </Pressable>

              <View className="flex-1">
                <Text className="font-bold text-lg text-gray-900 dark:text-white" numberOfLines={1}>
                  {currentUser?.name}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                  {currentUser?.email}
                </Text>
                <View className={`${roleBg} self-start rounded-full px-2.5 py-0.5 mt-2`}>
                  <Text className="text-white text-[10px] font-bold">{currentUser?.role}</Text>
                </View>
              </View>

              <View className="items-center gap-4">
                <Pressable onPress={toggleDark} hitSlop={8}>
                  <Ionicons
                    name={dark ? "moon" : "sunny-outline"}
                    size={20}
                    color={dark ? colors.brand400 : "#6B7280"}
                  />
                </Pressable>
                <Pressable onPress={logout} hitSlop={8}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            </View>

            {/* Stats */}
            <View className="bg-white dark:bg-gray-900 mx-4 mt-3 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-row">
              <StatCard value={myProperties.length} label="Publicaciones" />
              <StatCard value={favorites.length} label="Favoritos" />
              <StatCard value={myProperties.filter((p) => p.verified).length} label="Verificadas" />
            </View>

            {/* Tabs */}
            <View className="flex-row gap-1 mx-4 mt-4 mb-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {[
                { key: "propiedades", label: "Mis propiedades" },
                { key: "cuenta", label: "Mi cuenta" },
              ].map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  // Las dos ramas siempre incluyen una clase dark: (aunque
                  // sea "transparent" en la inactiva) — si una rama tiene
                  // dark: y la otra no, el Pressable pasa de "no necesita
                  // variables" a "sí necesita" (o viceversa) después de su
                  // primer render, y ESO es lo que dispara este bug de
                  // NativeWind. Con las dos ramas simétricas en esa
                  // dimensión, la necesidad de variables queda constante.
                  className={`flex-1 py-2.5 rounded-lg items-center ${
                    tab === t.key
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "bg-transparent dark:bg-transparent"
                  }`}
                >
                  <Text
                    className={
                      tab === t.key
                        ? "font-semibold text-sm text-gray-900 dark:text-white"
                        : "text-sm text-gray-500 dark:text-gray-400"
                    }
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Los dos bloques quedan siempre montados — solo se oculta con
                estilo (display:none via "hidden") en vez de desmontar con
                &&. Desmontar/montar en la misma posición del árbol cada vez
                que se cambia de pestaña es lo que confundía a NativeWind y
                terminaba tirando "Couldn't find a navigation context". */}
            <View className={tab === "cuenta" ? undefined : "hidden"}>
              <View className="mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
                {[
                  { icon: "person-outline", label: "Nombre completo", value: currentUser?.name },
                  { icon: "mail-outline", label: "Correo", value: currentUser?.email },
                  { icon: "pricetag-outline", label: "Tipo de cuenta", value: currentUser?.role },
                  { icon: "key-outline", label: "ID de usuario", value: `${currentUser?.id?.slice(0, 8)}...` },
                ].map((item, i, arr) => (
                  <View
                    key={item.label}
                    className={`flex-row items-center justify-between px-4 py-3.5 ${
                      i < arr.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center">
                        <Ionicons name={item.icon} size={15} color={iconColor} />
                      </View>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">{item.label}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Mismo motivo que arriba: los tres estados (cargando/vacío/
                lista) quedan siempre montados y solo se alterna "hidden",
                para que el swap no vuelva a disparar el mismo bug cada vez
                que se recargan los datos. */}
            <View className={tab === "propiedades" ? undefined : "hidden"}>
              <View className={loadingProps ? undefined : "hidden"}>
                <MyPropertyRowSkeleton />
                <MyPropertyRowSkeleton />
                <MyPropertyRowSkeleton />
              </View>

              <View className={!loadingProps && myProperties.length === 0 ? undefined : "hidden"}>
                <View className="items-center py-10 mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <Text className="text-4xl mb-2">🏚️</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-center px-6">
                    Todavía no publicaste ninguna propiedad.
                  </Text>
                </View>
              </View>

              <View className={!loadingProps && myProperties.length > 0 ? undefined : "hidden"}>
                {myProperties.map((item) => (
                  <MyPropertyRow
                    key={item.id}
                    property={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onVerify={handleVerify}
                    iconColor={iconColor}
                  />
                ))}
              </View>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
