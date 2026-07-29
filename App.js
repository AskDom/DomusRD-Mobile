import "./global.css";

import { useCallback } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  createNavigationContainerRef,
} from "@react-navigation/native";
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
import { NetworkProvider } from "./src/context/NetworkContext";
import { BiometricLockProvider } from "./src/context/BiometricLockContext";
import { AuthProvider } from "./src/context/AuthContext";
import { SocketProvider } from "./src/context/SocketContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { InboxProvider } from "./src/context/InboxContext";
import RootNavigator from "./src/navigation/RootNavigator";
import usePushNotifications from "./src/hooks/usePushNotifications";
import OfflineBanner from "./src/components/OfflineBanner";
import { colors } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync();

// Vive fuera del árbol de React a propósito: así usePushNotifications puede
// navegar al tocar una notificación sin depender de dónde esté montado.
const navigationRef = createNavigationContainerRef();

const NAV_LIGHT_THEME = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.brand700, background: "#F9FAFB" },
};
const NAV_DARK_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.brand400, background: "#030712", card: "#111827" },
};

function PushNotificationsGate() {
  usePushNotifications(navigationRef);
  return null;
}

function AppContent({ onLayoutRootView }) {
  const { dark } = useTheme();

  return (
    <AuthProvider>
      <SocketProvider>
        <FavoritesProvider>
          <InboxProvider>
            <PushNotificationsGate />
            <View className="flex-1 bg-white dark:bg-gray-950" onLayout={onLayoutRootView}>
              <NavigationContainer ref={navigationRef} theme={dark ? NAV_DARK_THEME : NAV_LIGHT_THEME}>
                <RootNavigator />
              </NavigationContainer>
              <OfflineBanner />
              <StatusBar style={dark ? "light" : "dark"} />
            </View>
          </InboxProvider>
        </FavoritesProvider>
      </SocketProvider>
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
          <NetworkProvider>
            <BiometricLockProvider>
              <AppContent onLayoutRootView={onLayoutRootView} />
            </BiometricLockProvider>
          </NetworkProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
