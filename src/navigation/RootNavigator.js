import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function RootNavigator() {
  const { currentUser, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.brand700} />
      </View>
    );
  }

  return currentUser ? <AppTabs /> : <AuthStack />;
}
