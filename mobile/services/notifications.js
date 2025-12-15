import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// طلب صلاحيات الإشعارات + إرجاع Expo Token
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical devices.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted!");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("📌 Expo Push Token:", token);
  return token;
}

// إشعار محلي
export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
    },
    trigger: null,
  });
}
