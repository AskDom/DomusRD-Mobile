import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeStack from "./HomeStack";
import FavoritesStack from "./FavoritesStack";
import MessagesStack from "./MessagesStack";
import Perfil from "../screens/Perfil";
import { useInbox } from "../context/InboxContext";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

const ICONS = {
  Inicio: "home",
  Favoritos: "heart",
  Mensajes: "chatbubble-ellipses",
  Perfil: "person-circle",
};

export default function AppTabs() {
  const { getConversations } = useInbox();
  const unreadTotal = getConversations().reduce((sum, c) => sum + c.unread, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand700,
        tabBarInactiveTintColor: colors.gray400,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Favoritos" component={FavoritesStack} />
      <Tab.Screen
        name="Mensajes"
        component={MessagesStack}
        options={{
          tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent500 },
        }}
      />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
