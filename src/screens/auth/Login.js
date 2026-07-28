import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";

export default function Login({ navigation }) {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="font-extrabold text-3xl text-gray-900 mb-8">DomusRD</Text>

        <Text className="font-medium text-sm text-gray-700 mb-1">Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="tucorreo@ejemplo.com"
        />

        <Text className="font-medium text-sm text-gray-700 mb-1">Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="••••••••"
        />

        {error ? <Text className="text-red-600 mb-4">{error}</Text> : null}

        <Pressable
          onPress={() => login({ email, password })}
          disabled={loading}
          className="bg-blue-700 rounded-xl py-3 items-center mb-4 disabled:opacity-60"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white">Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text className="text-center text-gray-600">
            ¿No tenés cuenta? <Text className="font-semibold text-blue-700">Regístrate</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
