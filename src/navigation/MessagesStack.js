import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Mensajes from "../screens/Mensajes";
import ConversationThread from "../screens/ConversationThread";
import BrandTitle from "../components/BrandTitle";

const Stack = createNativeStackNavigator();

export default function MessagesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MessagesList"
        component={Mensajes}
        options={{ headerTitle: () => <BrandTitle />, title: "Mensajes" }}
      />
      <Stack.Screen
        name="ConversationThread"
        component={ConversationThread}
        options={({ route }) => ({ title: route.params?.otherName || "Conversación" })}
      />
    </Stack.Navigator>
  );
}
