import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: "*/*"
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, cancelled: true };
  }

  const asset = result.assets[0];
  let base64 = null;
  try {
    base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
  } catch {
    /* large files may fail — uri still usable */
  }

  return {
    ok: true,
    uri: asset.uri,
    name: asset.name,
    size: asset.size,
    mimeType: asset.mimeType,
    base64
  };
}
