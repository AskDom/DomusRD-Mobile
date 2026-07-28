import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { apiFetch } from "../api/client";
import { colors } from "../theme/colors";

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
      <Text className="font-medium text-sm text-gray-700 mb-1.5">{label}</Text>
      {children}
    </View>
  );
}

const inputClass = "bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900";

export default function Publish({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [rooms, setRooms] = useState("1");
  const [baths, setBaths] = useState("1");
  const [parking, setParking] = useState("0");
  const [type, setType] = useState("APARTAMENTO");
  const [status, setStatus] = useState("VENTA");
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [location, setLocation] = useState(null);
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

    setSubmitting(true);
    try {
      const data = await apiFetch("/api/properties", {
        method: "POST",
        body: JSON.stringify({
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
        }),
      });
      resetForm();
      navigation.navigate("PropertyDetail", { id: data.property.id });
    } catch (err) {
      setError(err.message || "No se pudo publicar la propiedad.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text className="font-extrabold text-2xl text-gray-900 mb-1">Publicar propiedad</Text>
          <Text className="text-gray-500 mb-6">Completá los datos para publicarla en DomusRD</Text>

          <Field label="Título">
            <TextInput value={title} onChangeText={setTitle} className={inputClass} placeholder="Apartamento amplio en Piantini" placeholderTextColor="#9CA3AF" />
          </Field>

          <Field label="Descripción">
            <TextInput
              value={description}
              onChangeText={setDescription}
              className={inputClass}
              placeholder="Describí la propiedad..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </Field>

          <Field label="Precio (US$)">
            <TextInput value={price} onChangeText={setPrice} className={inputClass} placeholder="150000" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </Field>

          <Field label="Ciudad">
            <TextInput value={city} onChangeText={setCity} className={inputClass} placeholder="Santo Domingo" placeholderTextColor="#9CA3AF" />
          </Field>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 mb-1.5">Hab.</Text>
              <TextInput value={rooms} onChangeText={setRooms} className={inputClass} keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 mb-1.5">Baños</Text>
              <TextInput value={baths} onChangeText={setBaths} className={inputClass} keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm text-gray-700 mb-1.5">Parqueos</Text>
              <TextInput value={parking} onChangeText={setParking} className={inputClass} keyboardType="numeric" />
            </View>
          </View>

          <Field label="Tipo">
            <View className="flex-row gap-2">
              {TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  className={`px-4 py-2 rounded-full ${type === t.value ? "bg-brand-700" : "bg-gray-100"}`}
                >
                  <Text className={type === t.value ? "text-white font-semibold text-sm" : "text-gray-600 text-sm"}>
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
                  className={`px-4 py-2 rounded-full ${status === s.value ? "bg-brand-700" : "bg-gray-100"}`}
                >
                  <Text className={status === s.value ? "text-white font-semibold text-sm" : "text-gray-600 text-sm"}>
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
                location ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              {locating ? (
                <ActivityIndicator color={colors.brand700} />
              ) : (
                <>
                  <Ionicons
                    name={location ? "checkmark-circle" : "location-outline"}
                    size={18}
                    color={location ? "#059669" : "#374151"}
                  />
                  <Text className={location ? "text-emerald-700 font-medium" : "text-gray-700 font-medium"}>
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
                  <Image source={{ uri }} className="w-20 h-20 rounded-xl" />
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
                  className="w-20 h-20 rounded-xl bg-gray-50 border border-dashed border-gray-300 items-center justify-center"
                >
                  {uploadingImages ? (
                    <ActivityIndicator color={colors.brand700} />
                  ) : (
                    <Ionicons name="add" size={22} color="#9CA3AF" />
                  )}
                </Pressable>
              )}
            </View>
          </Field>

          {error ? <Text className="text-red-600 mb-4">{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-brand-700 rounded-2xl py-4 items-center mt-2 shadow-sm active:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white text-base">Publicar propiedad</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
