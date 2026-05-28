import * as ImagePicker from "expo-image-picker";

export async function capturePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    return { ok: false, error: "Camera permission denied" };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    base64: true
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, cancelled: true };
  }

  const asset = result.assets[0];
  return {
    ok: true,
    uri: asset.uri,
    base64: asset.base64,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType || "image/jpeg"
  };
}
