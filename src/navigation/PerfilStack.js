import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Perfil from "../screens/Perfil";
import Publish from "../screens/Publish";
import PropertyDetail from "../screens/PropertyDetail";

const Stack = createNativeStackNavigator();

export default function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PerfilHome" component={Perfil} options={{ title: "Perfil" }} />
      {/* Sin header nativo — Publish.js ya muestra su propio título y, en modo
          edición, su propio botón de volver. */}
      <Stack.Screen name="Publish" component={Publish} options={{ headerShown: false }} />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetail}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}
