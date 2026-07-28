import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertyList from "../screens/PropertyList";
import PropertyDetail from "../screens/PropertyDetail";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertyList"
        component={PropertyList}
        options={{ title: "DomusRD" }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetail}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}
