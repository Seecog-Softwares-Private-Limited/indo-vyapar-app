import Constants from "expo-constants";

export const APP_SCHEME = "indovyapar";
export const APP_REDIRECT_PATH = "login-success";

export const OAUTH_PATH_REGEX = /\/api\/auth\/oauth\/(google|facebook)(\/|$)/i;
export const OAUTH_PROVIDER_HOST_REGEX =
  /(accounts\.google\.com|facebook\.com|m\.facebook\.com)/i;

export const NATIVE_SCREEN_IDS = {
  WEB: "web",
  PRIVACY: "privacy",
  TERMS: "terms",
  CONTACT: "contact",
  ABOUT: "about",
  DELETE_ACCOUNT: "delete_account",
  UPDATE_REQUIRED: "update_required",
  NO_INTERNET: "no_internet"
};

export const SUPPORT_EMAIL = "support@indovyapar.com";
export const SUPPORT_PHONE = "+91-0000000000";
export const WEBSITE_URL = "https://indovyapar.com";

function stripTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getWebBaseUrl() {
  const extra = Constants.expoConfig?.extra || {};
  const devUrl = extra.webUrlDev || "http://localhost:3005";
  const prodUrl = extra.webUrlProd || "https://indovyapar.com";
  return stripTrailingSlash(__DEV__ ? devUrl : prodUrl);
}

export function buildAppWebUrl(baseUrl, reloadKey = 0) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}app_reload=${reloadKey}&native_app=1`;
}

export function getMinAppVersion() {
  const extra = Constants.expoConfig?.extra || {};
  return extra.minAppVersion || null;
}

export function getStoreUrls() {
  const extra = Constants.expoConfig?.extra || {};
  return {
    ios: extra.storeUrlIos || "https://apps.apple.com/app/id000000000",
    android:
      extra.storeUrlAndroid ||
      "https://play.google.com/store/apps/details?id=com.seecog.indovyapar"
  };
}
