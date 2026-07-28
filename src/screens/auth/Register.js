import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";

export default function Register({ navigation }) {
  const { register, error, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="font-extrabold text-3xl text-gray-900 mb-1">Crear cuenta</Text>
        <Text className="text-gray-500 mb-8">Sumate a DomusRD en un minuto</Text>

        <Text className="font-medium text-sm text-gray-700 mb-1.5">Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-4 text-gray-900"
          placeholderTextColor="#9CA3AF"
          placeholder="Tu nombre"
        />

        <Text className="font-medium text-sm text-gray-700 mb-1.5">Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-4 text-gray-900"
          placeholderTextColor="#9CA3AF"
          placeholder="tucorreo@ejemplo.com"
        />

        <Text className="font-medium text-sm text-gray-700 mb-1.5">Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-4 text-gray-900"
          placeholderTextColor="#9CA3AF"
          placeholder="••••••••"
        />

        {error ? <Text className="text-red-600 mb-4">{error}</Text> : null}

        <Pressable
          onPress={() => register({ name, email, password })}
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
          <Text className="text-center text-gray-600">
            ¿Ya tenés cuenta? <Text className="font-semibold text-brand-700">Inicia sesión</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
