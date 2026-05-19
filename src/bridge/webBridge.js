import { NATIVE_TO_WEB } from "./messageTypes";
import { buildSessionInjectionScript } from "./sessionStorage";

export function injectJavaScript(webViewRef, script) {
  if (!webViewRef?.current) return;
  webViewRef.current.injectJavaScript(script);
}

export function dispatchNativeEvent(webViewRef, eventName, detail) {
  const json = JSON.stringify(detail ?? {});
  const script = `
    (function () {
      try {
        window.dispatchEvent(new CustomEvent("${eventName}", { detail: ${json} }));
      } catch (_) {}
      true;
    })();
  `;
  injectJavaScript(webViewRef, script);
}

export function injectSession(webViewRef, session) {
  injectJavaScript(webViewRef, buildSessionInjectionScript(session));
}

export function injectLocation(webViewRef, coords) {
  dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.LOCATION_UPDATE, coords);
  const script = `
    (function () {
      try {
        var c = ${JSON.stringify(coords)};
        localStorage.setItem("native_lat", String(c.latitude || ""));
        localStorage.setItem("native_lng", String(c.longitude || ""));
        localStorage.setItem("native_location_accuracy", String(c.accuracy || ""));
      } catch (_) {}
      true;
    })();
  `;
  injectJavaScript(webViewRef, script);
}

export function injectNetworkStatus(webViewRef, isOnline) {
  dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.NETWORK_STATUS, { isOnline });
}

export function injectNativeReady(webViewRef, capabilities) {
  dispatchNativeEvent(webViewRef, NATIVE_TO_WEB.NATIVE_READY, capabilities);
}
