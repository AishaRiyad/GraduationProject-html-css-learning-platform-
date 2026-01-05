import { useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

const API = "http://10.0.2.2:5000"; // Android emulator

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

async function requestExpoPushToken() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token || null;
}

export default function useAdminFCM() {
  useEffect(() => {
    let receivedSub;

    (async () => {
      const auth = await getAuthHeader();
      if (!auth) return;

      try {
        const pushToken = await requestExpoPushToken();
        if (pushToken) {
          await axios.post(
            `${API}/api/admin/notifications/fcm-token`,
            { token: pushToken },
            { headers: { Authorization: auth } }
          );
          console.log("Admin push token saved (expo)");
        }
      } catch (err) {
        console.error("Error getting push token:", err);
      }

      receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Foreground push:", notification);
      });
    })();

    return () => {
      if (receivedSub) receivedSub.remove();
    };
  }, []);
}
