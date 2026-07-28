import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeStack from "./HomeStack";
import FavoritesStack from "./FavoritesStack";
import Placeholder from "../screens/Placeholder";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Favoritos" component={FavoritesStack} />
      <Tab.Screen name="Mensajes">
        {() => <Placeholder title="Mensajes" />}
      </Tab.Screen>
      <Tab.Screen name="Perfil">
        {() => <Placeholder title="Perfil" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
