import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertyList from "../screens/PropertyList";
import PropertyDetail from "../screens/PropertyDetail";
import ConversationThread from "../screens/ConversationThread";
import BrandTitle from "../components/BrandTitle";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertyList"
        component={PropertyList}
        // Header nativo con el logo — es la única marca de la app que queda
        // visible una vez pasado el login (antes no había ninguna). El
        // title queda para que el botón de "volver" de las pantallas
        // siguientes diga "Inicio" en vez del nombre crudo de la ruta.
        options={{ headerTitle: () => <BrandTitle />, title: "Inicio" }}
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
