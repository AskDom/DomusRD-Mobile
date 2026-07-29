import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Login({ navigation }) {
  const { login, error, loading } = useAuth();
  const { dark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const placeholderColor = dark ? "#6B7280" : "#9CA3AF";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 justify-center px-6">
        <Text className="font-extrabold text-4xl text-brand-700 dark:text-brand-400">DomusRD</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-10 mt-1">
          Portal inmobiliario dominicano
        </Text>

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
          onPress={() => login({ email, password })}
          disabled={loading}
          className="bg-brand-700 rounded-2xl py-4 items-center mb-5 shadow-sm active:bg-brand-800 disabled:opacity-60"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white text-base">Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            ¿No tenés cuenta?{" "}
            <Text className="font-semibold text-brand-700 dark:text-brand-400">Regístrate</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
