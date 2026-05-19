/** Messages from WebView → Native */
export const WEB_TO_NATIVE = {
  CHUNK_ERROR: "chunk_error",
  PULL_REFRESH: "pull_refresh",
  HAPTIC: "haptic",
  SHARE_REQUEST: "share_request",
  REQUEST_LOCATION: "request_location",
  REQUEST_CAMERA: "request_camera",
  REQUEST_IMAGE_PICKER: "request_image_picker",
  REQUEST_FILE_UPLOAD: "request_file_upload",
  REQUEST_PUSH_REGISTER: "request_push_register",
  REQUEST_BIOMETRIC: "request_biometric",
  REQUEST_PERMISSIONS: "request_permissions",
  NAVIGATE_NATIVE: "navigate_native",
  SYNC_SESSION: "sync_session",
  GET_SESSION: "get_session",
  CLEAR_SESSION: "clear_session",
  OPEN_EXTERNAL: "open_external",
  WEB_READY: "web_ready",
  SET_TITLE: "set_title"
};

/** Events injected Native → WebView */
export const NATIVE_TO_WEB = {
  NATIVE_READY: "native-ready",
  LOCATION_UPDATE: "native-location",
  CAMERA_RESULT: "native-camera-result",
  IMAGE_PICKER_RESULT: "native-image-picker-result",
  FILE_UPLOAD_RESULT: "native-file-upload-result",
  PUSH_TOKEN: "native-push-token",
  BIOMETRIC_RESULT: "native-biometric-result",
  SESSION_SYNC: "native-session-sync",
  NETWORK_STATUS: "native-network-status",
  PERMISSIONS_RESULT: "native-permissions-result"
};
