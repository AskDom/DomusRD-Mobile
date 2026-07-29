import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Publish from "../screens/Publish";
import PropertyDetail from "../screens/PropertyDetail";

const Stack = createNativeStackNavigator();

export default function PublishStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Publish" component={Publish} options={{ headerShown: false }} />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetail}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}
