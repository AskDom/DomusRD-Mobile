import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { colors } from "../theme/colors";
import Image from "../components/Image";

const TYPES = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "VILLA", label: "Villa" },
];

const STATUSES = [
  { value: "VENTA", label: "Venta" },
  { value: "RENTA", label: "Renta" },
];

function Field({ label, children }) {
  return (
    <View className="mb-4">
      <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">{label}</Text>
      {children}
    </View>
  );
}

const inputClass =
  "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white";

export default function Publish({ navigation, route }) {
  const { dark } = useTheme();
  const { showToast } = useToast();
  const placeholderColor = dark ? "#6B7280" : "#9CA3AF";
  // Si viene una propiedad por params, esta pantalla edita en vez de crear
  // — mismo formulario para las dos cosas, para no duplicar todo esto.
  const editing = route?.params?.property || null;

  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [price, setPrice] = useState(editing ? String(editing.price) : "");
  const [city, setCity] = useState(editing?.city || "");
  const [rooms, setRooms] = useState(editing ? String(editing.rooms ?? 1) : "1");
  const [baths, setBaths] = useState(editing ? String(editing.baths ?? 1) : "1");
  const [parking, setParking] = useState(editing ? String(editing.parking ?? 0) : "0");
  const [type, setType] = useState(editing?.type || "APARTAMENTO");
  const [status, setStatus] = useState(editing?.status || "VENTA");
  const [images, setImages] = useState(editing?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [location, setLocation] = useState(
    editing?.lat != null ? { lat: editing.lat, lng: editing.lng } : null
  );
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Necesitamos acceso a tus fotos para subir imágenes.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 6 - images.length,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;

    setUploadingImages(true);
    setError("");
    try {
      const formData = new FormData();
      result.assets.forEach((asset, i) => {
        formData.append("images", {
          uri: asset.uri,
          name: asset.fileName || `photo-${Date.now()}-${i}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
      });
      const data = await apiFetch("/api/upload", { method: "POST", body: formData });
      setImages((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setError(err.message || "No se pudieron subir las fotos.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const useCurrentLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError("Necesitamos tu ubicación para marcar dónde está la propiedad.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      if (!city.trim()) {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const guessedCity = place?.city || place?.subregion || place?.region;
        if (guessedCity) setCity(guessedCity);
      }
    } catch {
      setError("No se pudo obtener tu ubicación. Probá de nuevo.");
    } finally {
      setLocating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCity("");
    setRooms("1");
    setBaths("1");
    setParking("0");
    setType("APARTAMENTO");
    setStatus("VENTA");
    setImages([]);
    setLocation(null);
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim() || !description.trim() || !price || !city.trim()) {
      setError("Completá título, descripción, precio y ciudad.");
      return;
    }
    if (!location) {
      setError("Marcá la ubicación antes de publicar.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      city: city.trim(),
      lat: location.lat,
      lng: location.lng,
      rooms: Number(rooms) || 1,
      baths: Number(baths) || 1,
      parking: Number(parking) || 0,
      type,
      status,
      images,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await apiFetch(`/api/properties/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        navigation.goBack();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Propiedad actualizada", "success");
      } else {
        const data = await apiFetch("/api/properties", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        resetForm();
        navigation.navigate("PropertyDetail", { id: data.property.id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Propiedad publicada", "success");
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "No se pudo guardar la propiedad.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {editing && (
            <Pressable
              onPress={() => navigation.goBack()}
              className="flex-row items-center gap-1 mb-4 self-start"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={20} color={dark ? "#D1D5DB" : "#374151"} />
              <Text className="text-gray-700 dark:text-gray-300 font-medium">Volver</Text>
            </Pressable>
          )}

          <Text className="font-extrabold text-2xl text-gray-900 dark:text-white mb-1">
            {editing ? "Editar propiedad" : "Publicar propiedad"}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-6">
            {editing ? "Actualizá los datos de tu propiedad" : "Completá los datos para publicarla en Domify"}
          </Text>

          <Field label="Título">
            <TextInput value={title} onChangeText={setTitle} className={inputClass} placeholder="Apartamento amplio en Piantini" placeholderTextColor={placeholderColor} />
          </Field>

          <Field label="Descripción">
            <TextInput
              value={description}
              onChangeText={setDescription}
              className={inputClass}
              placeholder="Describí la propiedad..."
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </Field>

          <Field label="Precio (US$)">
            <TextInput value={price} onChangeText={setPrice} className={inputClass} placeholder="150000" placeholderTextColor={placeholderColor} keyboardType="numeric" />
          </Field>

          <Field label="Ciudad">
            <TextInput value={city} onChangeText={setCity} className={inputClass} placeholder="Santo Domingo" placeholderTextColor={placeholderColor} />
          </Field>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Hab.</Text>
              <TextInput value={rooms} onChangeText={setRooms} className={inputClass} keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Baños</Text>
              <TextInput value={baths} onChangeText={setBaths} className={inputClass} keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Parqueos</Text>
              <TextInput value={parking} onChangeText={setParking} className={inputClass} keyboardType="numeric" />
            </View>
          </View>

          <Field label="Tipo">
            <View className="flex-row gap-2">
              {TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  className={`px-4 py-2 rounded-full ${
                    type === t.value ? "bg-brand-700 dark:bg-brand-700" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={
                      type === t.value
                        ? "text-white dark:text-white font-semibold text-sm"
                        : "text-gray-600 dark:text-gray-300 text-sm"
                    }
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Estado">
            <View className="flex-row gap-2">
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => setStatus(s.value)}
                  className={`px-4 py-2 rounded-full ${
                    status === s.value ? "bg-brand-700 dark:bg-brand-700" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={
                      status === s.value
                        ? "text-white dark:text-white font-semibold text-sm"
                        : "text-gray-600 dark:text-gray-300 text-sm"
                    }
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Ubicación">
            <Pressable
              onPress={useCurrentLocation}
              disabled={locating}
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 border ${
                location
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              {locating ? (
                <ActivityIndicator color={colors.brand700} />
              ) : (
                <>
                  <Ionicons
                    name={location ? "checkmark-circle" : "location-outline"}
                    size={18}
                    color={location ? "#059669" : dark ? "#D1D5DB" : "#374151"}
                  />
                  <Text
                    className={
                      location
                        ? "text-emerald-700 dark:text-emerald-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 font-medium"
                    }
                  >
                    {location
                      ? `Ubicación marcada — ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : "Usar mi ubicación actual"}
                  </Text>
                </>
              )}
            </Pressable>
          </Field>

          <Field label={`Fotos (${images.length}/6)`}>
            <View className="flex-row flex-wrap gap-2">
              {images.map((uri, i) => (
                <View key={uri} className="relative w-20 h-20">
                  <Image source={{ uri }} className="w-20 h-20 rounded-xl" contentFit="cover" transition={150} />
                  <Pressable
                    onPress={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 items-center justify-center"
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 6 && (
                <Pressable
                  onPress={pickImages}
                  disabled={uploadingImages}
                  className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 items-center justify-center"
                >
                  {uploadingImages ? (
                    <ActivityIndicator color={colors.brand700} />
                  ) : (
                    <Ionicons name="add" size={22} color={placeholderColor} />
                  )}
                </Pressable>
              )}
            </View>
          </Field>

          {error ? <Text className="text-red-600 dark:text-red-400 mb-4">{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-brand-700 rounded-2xl py-4 items-center mt-2 shadow-sm active:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-white text-base">
                {editing ? "Guardar cambios" : "Publicar propiedad"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
