import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let permissionRequested = false;

export async function ensureNotificationPermissions() {
  if (permissionRequested) return;
  permissionRequested = true;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("rest-timer", {
      name: "Rest timer",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleRestCompleteNotification(seconds: number): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rest complete",
        body: "Back to it — your next set is ready.",
        sound: "default",
      },
      trigger:
        seconds > 0
          ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: "rest-timer" }
          : null,
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or cancelled -- nothing to do.
  }
}
