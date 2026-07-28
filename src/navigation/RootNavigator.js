import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function RootNavigator() {
  const { currentUser, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return currentUser ? <AppTabs /> : <AuthStack />;
}
