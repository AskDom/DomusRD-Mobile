import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Favoritos from "../screens/Favoritos";
import PropertyDetail from "../screens/PropertyDetail";

const Stack = createNativeStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FavoritesList"
        component={Favoritos}
        options={{ title: "Favoritos" }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetail}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}
