import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { APP_REDIRECT_PATH, APP_SCHEME, OAUTH_PATH_REGEX, OAUTH_PROVIDER_HOST_REGEX } from "../constants/appConfig";

WebBrowser.maybeCompleteAuthSession();

export function createOAuthRedirectUri() {
  return Linking.createURL(APP_REDIRECT_PATH, { scheme: APP_SCHEME });
}

export function shouldOpenOAuthExternally(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      OAUTH_PATH_REGEX.test(parsed.pathname) ||
      OAUTH_PROVIDER_HOST_REGEX.test(parsed.host)
    );
  } catch {
    return false;
  }
}

export async function openOAuthInSystemBrowser(url, redirectUri) {
  const oauthUrl = new URL(url);
  oauthUrl.searchParams.set("mobile", "1");
  oauthUrl.searchParams.set("platform", "expo-native");

  return WebBrowser.openAuthSessionAsync(oauthUrl.toString(), redirectUri, {
    showInRecents: true,
    preferEphemeralSession: false
  });
}

export function parseAuthCallbackUrl(url) {
  if (!url) return null;
  const parsed = Linking.parse(url);
  if (!parsed?.path || parsed.path.replace(/\/$/, "") !== APP_REDIRECT_PATH) {
    return null;
  }
  return parsed.queryParams || {};
}
