import * as ImagePicker from "expo-image-picker";

export async function pickImages({ allowsMultiple = false } = {}) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return { ok: false, error: "Photo library permission denied" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: allowsMultiple,
    quality: 0.85,
    base64: true
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, cancelled: true };
  }

  const assets = result.assets.map((a) => ({
    uri: a.uri,
    base64: a.base64,
    width: a.width,
    height: a.height,
    mimeType: a.mimeType || "image/jpeg",
    fileName: a.fileName
  }));

  return { ok: true, assets };
}
