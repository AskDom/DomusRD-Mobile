import "./global.css";

import { useCallback } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { ToastProvider } from "./src/context/ToastContext";
import { AuthProvider } from "./src/context/AuthContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { InboxProvider } from "./src/context/InboxContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync();

const NAV_LIGHT_THEME = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.brand700, background: "#F9FAFB" },
};
const NAV_DARK_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.brand400, background: "#030712", card: "#111827" },
};

function AppContent({ onLayoutRootView }) {
  const { dark } = useTheme();

  return (
    <AuthProvider>
      <FavoritesProvider>
        <InboxProvider>
          <View className="flex-1 bg-white dark:bg-gray-950" onLayout={onLayoutRootView}>
            <NavigationContainer theme={dark ? NAV_DARK_THEME : NAV_LIGHT_THEME}>
              <RootNavigator />
            </NavigationContainer>
            <StatusBar style={dark ? "light" : "dark"} />
          </View>
        </InboxProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppContent onLayoutRootView={onLayoutRootView} />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
