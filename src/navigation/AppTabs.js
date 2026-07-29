import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeStack from "./HomeStack";
import FavoritesStack from "./FavoritesStack";
import MessagesStack from "./MessagesStack";
import PublishStack from "./PublishStack";
import PerfilStack from "./PerfilStack";
import { useAuth } from "../context/AuthContext";
import { useInbox } from "../context/InboxContext";
import { useTheme } from "../context/ThemeContext";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

const ICONS = {
  Inicio: "home",
  Publicar: "add-circle",
  Favoritos: "heart",
  Mensajes: "chatbubble-ellipses",
  Perfil: "person-circle",
};

const CAN_PUBLISH_ROLES = ["Vendedor", "Agente", "Admin"];

export default function AppTabs() {
  const { currentUser } = useAuth();
  const { getConversations } = useInbox();
  const { dark } = useTheme();
  const unreadTotal = getConversations().reduce((sum, c) => sum + c.unread, 0);
  const canPublish = CAN_PUBLISH_ROLES.includes(currentUser?.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: dark ? colors.brand400 : colors.brand700,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: dark ? "#111827" : "#ffffff",
          borderTopColor: dark ? "#1F2937" : "#E5E7EB",
        },
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
        name="Publicar"
        component={PublishStack}
        // El set de pantallas de un navegador tiene que ser estable — quitar
        // y poner un <Tab.Screen> según el rol corrompe el estado interno de
        // React Navigation (rompía los navegadores anidados, como el de
        // Perfil). Se oculta el botón en vez de sacar la pantalla.
        options={canPublish ? undefined : { tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MessagesStack}
        options={{
          tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent500 },
        }}
      />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}
