import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Favoritos from "../screens/Favoritos";
import PropertyDetail from "../screens/PropertyDetail";
import ConversationThread from "../screens/ConversationThread";

const Stack = createNativeStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FavoritesList"
        component={Favoritos}
        // title queda para que el botón de "volver" de las pantallas
        // siguientes diga "Favoritos" en vez del nombre crudo de la ruta.
        options={{ headerShown: false, title: "Favoritos" }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetail}
        options={{ title: "Detalle" }}
      />
      <Stack.Screen
        name="ConversationThread"
        component={ConversationThread}
        options={({ route }) => ({ title: route.params?.otherName || "Conversación" })}
      />
    </Stack.Navigator>
  );
}
