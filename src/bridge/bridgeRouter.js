import { Platform, Share } from "react-native";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { WEB_TO_NATIVE, NATIVE_TO_WEB } from "./messageTypes";
import { saveSession, loadSession, clearSession } from "./sessionStorage";
import {
  dispatchNativeEvent,
  injectLocation,
  injectNativeReady,
  injectSession
} from "./webBridge";
import { getCurrentLocation } from "../native/location";
import { capturePhoto } from "../native/camera";
import { pickImages } from "../native/imagePicker";
import { pickDocument } from "../native/fileUpload";
import { registerForPushNotifications } from "../native/pushNotifications";
import { authenticateWithBiometrics } from "../native/biometrics";
import { requestPermissionBundle } from "../native/permissions";
import { NATIVE_SCREEN_IDS } from "../constants/appConfig";

const SCREEN_MAP = {
  privacy: NATIVE_SCREEN_IDS.PRIVACY,
  "privacy-policy": NATIVE_SCREEN_IDS.PRIVACY,
  terms: NATIVE_SCREEN_IDS.TERMS,
  "terms-and-conditions": NATIVE_SCREEN_IDS.TERMS,
  contact: NATIVE_SCREEN_IDS.CONTACT,
  "contact-us": NATIVE_SCREEN_IDS.CONTACT,
  about: NATIVE_SCREEN_IDS.ABOUT,
  "about-app": NATIVE_SCREEN_IDS.ABOUT,
  delete_account: NATIVE_SCREEN_IDS.DELETE_ACCOUNT,
  "delete-account": NATIVE_SCREEN_IDS.DELETE_ACCOUNT
};

export function createBridgeRouter(deps) {
  const {
    webViewRef,
    autoRetryCount,
    maxAutoRetries,
    onChunkFatal,
    onTriggerReload,
    onNavigateNative,
    onSetWebTitle,
    onAuthTokensFromWeb
  } = deps;

  async function routeWebMessage(payload) {
    if (!payload?.type) return;

    switch (payload.type) {
      case WEB_TO_NATIVE.CHUNK_ERROR:
        if (autoRetryCount < maxAutoRetries) {
          onTriggerReload(true);
        } else {
          onChunkFatal();
        }
        break;

      case WEB_TO_NATIVE.PULL_REFRESH:
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          /* optional */
        }
        webViewRef.current?.reload();
        break;

      case WEB_TO_NATIVE.HAPTIC:
        try {
          if (payload.style === "impact_medium") {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            await Haptics.selectionAsync();
          }
        } catch {
          /* optional */
        }
        break;

      case WEB_TO_NATIVE.SHARE_REQUEST: {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const url = payload.url || "";
          const title = payload.title || "Indo Vyapar";
          await Share.share(
            Platform.OS === "ios"
              ? { url, title }
              : { message: url || "https://indovyapar.com", title }
          );
        } catch {
          /* dismissed */
        }
        break;
      }

      case WEB_TO_NATIVE.REQUEST_LOCATION: {
        const loc = await getCurrentLocation();
        if (loc.ok) {
          injectLocation(webViewRef, loc);
        } else {
          dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.LOCATION_UPDATE, {
            error: loc.error
          });
        }
        break;
      }

      case WEB_TO_NATIVE.REQUEST_CAMERA: {
        const photo = await capturePhoto();
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.CAMERA_RESULT, photo);
        break;
      }

      case WEB_TO_NATIVE.REQUEST_IMAGE_PICKER: {
        const picked = await pickImages({
          allowsMultiple: !!payload.allowsMultiple
        });
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.IMAGE_PICKER_RESULT, picked);
        break;
      }

      case WEB_TO_NATIVE.REQUEST_FILE_UPLOAD: {
        const file = await pickDocument();
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.FILE_UPLOAD_RESULT, file);
        break;
      }

      case WEB_TO_NATIVE.REQUEST_PUSH_REGISTER: {
        const push = await registerForPushNotifications();
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.PUSH_TOKEN, push);
        break;
      }

      case WEB_TO_NATIVE.REQUEST_BIOMETRIC: {
        const bio = await authenticateWithBiometrics(payload.reason);
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.BIOMETRIC_RESULT, bio);
        break;
      }

      case WEB_TO_NATIVE.REQUEST_PERMISSIONS: {
        const types = Array.isArray(payload.types) ? payload.types : [];
        const perms = await requestPermissionBundle(types);
        dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.PERMISSIONS_RESULT, perms);
        break;
      }

      case WEB_TO_NATIVE.NAVIGATE_NATIVE: {
        const screen = String(payload.screen || "").toLowerCase();
        const target = SCREEN_MAP[screen] || screen;
        onNavigateNative(target);
        break;
      }

      case WEB_TO_NATIVE.SYNC_SESSION: {
        const saved = await saveSession(payload.session || {});
        injectSession(webViewRef, saved);
        onAuthTokensFromWeb?.(saved);
        break;
      }

      case WEB_TO_NATIVE.GET_SESSION: {
        const session = await loadSession();
        injectSession(webViewRef, session);
        break;
      }

      case WEB_TO_NATIVE.CLEAR_SESSION:
        await clearSession();
        injectSession(webViewRef, {});
        break;

      case WEB_TO_NATIVE.OPEN_EXTERNAL:
        if (payload.url && /^https?:\/\//i.test(payload.url)) {
          await WebBrowser.openBrowserAsync(payload.url, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC
          });
        }
        break;

      case WEB_TO_NATIVE.WEB_READY: {
        const session = await loadSession();
        if (Object.keys(session).length) {
          injectSession(webViewRef, session);
        }
        injectNativeReady(webViewRef, {
          platform: Platform.OS,
          bridgeVersion: 2,
          biometrics: true,
          location: true,
          camera: true,
          push: true
        });
        break;
      }

      case WEB_TO_NATIVE.SET_TITLE:
        onSetWebTitle?.(payload.title || "");
        break;

      default:
        break;
    }
  }

  return { routeWebMessage };
}
