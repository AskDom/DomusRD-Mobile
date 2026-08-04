import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Image from "../../components/Image";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register({ navigation }) {
  const { register, error, setError, loading } = useAuth();
  const { dark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const placeholderColor = dark ? "#6B7280" : "#9CA3AF";

  // Mismas reglas que valida el backend (registerValidator) — esto solo
  // evita el viaje de red cuando el error ya se puede ver acá; el backend
  // sigue siendo quien realmente decide si el dato es válido.
  const handleRegister = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setError("El nombre debe tener entre 2 y 60 caracteres");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("El correo no es válido");
      return;
    }
    if (password.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres");
      return;
    }
    register({ name: trimmedName, email: email.trim(), password });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 justify-center px-6">
        <Image
          source={dark ? require("../../../assets/logo-dark.png") : require("../../../assets/logo-light.png")}
          className="w-14 h-14 mb-3"
          contentFit="contain"
        />
        <Text className="font-extrabold text-3xl text-gray-900 dark:text-white mb-1">Crear cuenta</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-8">Sumate a Domify en un minuto</Text>

        <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 mb-4 text-gray-900 dark:text-white"
          placeholderTextColor={placeholderColor}
          placeholder="Tu nombre"
        />

        <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 mb-4 text-gray-900 dark:text-white"
          placeholderTextColor={placeholderColor}
          placeholder="tucorreo@ejemplo.com"
        />

        <Text className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 mb-4 text-gray-900 dark:text-white"
          placeholderTextColor={placeholderColor}
          placeholder="••••••••"
        />

        {error ? <Text className="text-red-600 dark:text-red-400 mb-4">{error}</Text> : null}

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className="bg-brand-700 rounded-2xl py-4 items-center mb-5 shadow-sm active:bg-brand-800 disabled:opacity-60"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white text-base">Crear cuenta</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            ¿Ya tenés cuenta?{" "}
            <Text className="font-semibold text-brand-700 dark:text-brand-400">Inicia sesión</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
