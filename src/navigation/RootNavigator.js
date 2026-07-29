import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";
import { useBiometricLock } from "../context/BiometricLockContext";
import { colors } from "../theme/colors";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import LockScreen from "../screens/LockScreen";

export default function RootNavigator() {
  const { currentUser, bootstrapping } = useAuth();
  const { enabled, unlocked, ready } = useBiometricLock();

  if (bootstrapping || !ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color={colors.brand700} />
      </View>
    );
  }

  if (currentUser && enabled && !unlocked) {
    return <LockScreen />;
  }

  return currentUser ? <AppTabs /> : <AuthStack />;
}
