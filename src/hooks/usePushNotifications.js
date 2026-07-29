import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Pide permiso, obtiene el Expo push token del dispositivo y lo registra
// contra el backend. Requiere que el proyecto esté vinculado a EAS ("eas
// login" + "eas init" una vez) para tener un projectId — hasta que eso pase,
// esto no rompe nada, simplemente no hay token que registrar.
export default function usePushNotifications(navigationRef) {
  const { currentUser } = useAuth();
  const registeredFor = useRef(null);

  useEffect(() => {
    if (!currentUser || registeredFor.current === currentUser.id) return;

    (async () => {
      if (!Device.isDevice) return;

      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log('Push notifications: falta vincular el proyecto con "eas init" para obtener un projectId.');
        return;
      }

      try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        await apiFetch("/api/notifications/push-token", {
          method: "POST",
          body: JSON.stringify({ token, platform: Platform.OS }),
        });
        registeredFor.current = currentUser.id;
      } catch (err) {
        console.log("No se pudo registrar el push token:", err.message);
      }
    })();
  }, [currentUser]);

  // Al tocar una notificación de mensaje, ir directo a esa conversación.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "message" && navigationRef?.current?.isReady()) {
        navigationRef.current.navigate("Mensajes", {
          screen: "ConversationThread",
          params: {
            otherId: data.conversationWith,
            otherName: data.otherName || "Usuario",
            propertyId: data.propertyId,
            propertyTitle: data.propertyTitle || "",
          },
        });
      }
    });
    return () => sub.remove();
  }, [navigationRef]);
}
