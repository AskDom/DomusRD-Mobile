import { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Boundary de diagnóstico: en vez de la pantalla roja nativa (que a veces
// trunca el component stack), muestra todo en texto seleccionable/copiable
// para poder mandar el detalle completo sin depender de una captura.
export default class ErrorBoundary extends Component {
  state = { error: null, info: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text className="font-extrabold text-lg text-red-600 mb-3">Error capturado</Text>

            <Text className="font-semibold text-gray-900 mb-1">Mensaje:</Text>
            <Text selectable className="text-sm text-red-700 mb-4">
              {String(this.state.error?.message || this.state.error)}
            </Text>

            <Text className="font-semibold text-gray-900 mb-1">Stack del error:</Text>
            <Text selectable className="text-xs text-gray-700 mb-4">
              {this.state.error?.stack || "(sin stack)"}
            </Text>

            <Text className="font-semibold text-gray-900 mb-1">Component stack:</Text>
            <Text selectable className="text-xs text-gray-500">
              {this.state.info?.componentStack || "(todavía no capturado)"}
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
