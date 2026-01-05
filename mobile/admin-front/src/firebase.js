import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestFCMToken() {
  try {
    if (!Device.isDevice) {
      console.log("Push notifications ");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission denied");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId,
    })).data;

    console.log("EXPO PUSH TOKEN (mobile):", token);
    return token;
  } catch (err) {
    console.error("Error getting Expo push token:", err);
    return null;
  }
}

export function listenForegroundMessages(onPayload) {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    console.log("Foreground notification:", notification);
    onPayload?.(notification);
  });

  return () => sub.remove();
}
