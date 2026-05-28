import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";

export async function requestPermissionBundle(types = []) {
  const results = {};

  if (types.includes("location")) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    results.location = status;
  }

  if (types.includes("camera")) {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    results.camera = cam.status;
  }

  if (types.includes("media")) {
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    results.media = media.status;
  }

  if (types.includes("notifications")) {
    const notif = await Notifications.requestPermissionsAsync();
    results.notifications = notif.status;
  }

  return results;
}
