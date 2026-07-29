import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertyList from "../screens/PropertyList";
import PropertyDetail from "../screens/PropertyDetail";
import ConversationThread from "../screens/ConversationThread";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertyList"
        component={PropertyList}
        // El propio contenido ya tiene su título ("Propiedades") — un header
        // nativo encima solo duplicaba el mensaje. El title igual queda acá
        // porque React Navigation lo usa como texto del botón de "volver" en
        // las pantallas que se abren desde esta (si no, muestra el nombre
        // crudo de la ruta, "PropertyList").
        options={{ headerShown: false, title: "Inicio" }}
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
