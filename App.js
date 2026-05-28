import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { WebView } from "react-native-webview";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { OfflineScreen } from "./src/components/OfflineScreen";
import { useNetworkStatus } from "./src/hooks/useNetworkStatus";
import { INJECTED_APP_SCRIPT } from "./src/injected/injectedScript";
import { COLORS } from "./src/constants/theme";

WebBrowser.maybeCompleteAuthSession();

const MAX_AUTO_RETRIES = 2;
const APP_REDIRECT_PATH = "oauth/callback";
const OAUTH_PATH_REGEX = /\/api\/auth\/oauth\/(google|facebook|apple)(\/|$)/i;
const OAUTH_PROVIDER_HOST_REGEX =
  /(accounts\.google\.com|facebook\.com|m\.facebook\.com|appleid\.apple\.com)/i;

/** Safari-like UA so the site serves the same styles/assets as mobile Safari (not a washed WebView theme). */
const WEBVIEW_USER_AGENT =
  Platform.OS === "ios"
    ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    : "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function stripTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getWebBaseUrl() {
  const extra = Constants.expoConfig?.extra || {};
  const devUrl = extra.webUrlDev || "http://localhost:3005";
  const prodUrl = extra.webUrlProd || "https://indovyapar.com";
  const shouldUseProdInDev =
    __DEV__ &&
    Platform.OS !== "web" &&
    /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(devUrl);
  return stripTrailingSlash(shouldUseProdInDev ? prodUrl : __DEV__ ? devUrl : prodUrl);
}

function buildAppWebUrl(baseUrl, reloadKey = 0) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}app_reload=${reloadKey}`;
}

function AppContent() {
  const webViewRef = useRef(null);
  const webBaseUrl = useMemo(() => getWebBaseUrl(), []);
  const redirectUri = useMemo(
    () => Linking.createURL(APP_REDIRECT_PATH, { scheme: "indovyapar" }),
    []
  );

  const { isConnected, refresh } = useNetworkStatus();

  const [reloadKey, setReloadKey] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [hasFatalError, setHasFatalError] = useState(false);
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentWebUrl, setCurrentWebUrl] = useState(buildAppWebUrl(webBaseUrl, 0));
  const [navUrl, setNavUrl] = useState(currentWebUrl);
  const [offlineRetryBusy, setOfflineRetryBusy] = useState(false);

  const wasOfflineRef = useRef(false);

  const persistAuthInWebView = useCallback((params) => {
    if (!webViewRef.current) {
      return;
    }

    const tokenMap = {
      token: params.token || "",
      access_token: params.access_token || params.accessToken || "",
      refresh_token: params.refresh_token || params.refreshToken || "",
      session_token: params.session || params.session_token || ""
    };

    const payloadJson = JSON.stringify(tokenMap);
    const script = `
      (function () {
        try {
          var payload = ${payloadJson};
          var keys = Object.keys(payload);
          keys.forEach(function (key) {
            if (payload[key]) {
              localStorage.setItem(key, payload[key]);
              sessionStorage.setItem(key, payload[key]);
            }
          });
          window.dispatchEvent(new CustomEvent("mobile-auth-success", { detail: payload }));
        } catch (_) {}
        true;
      })();
    `;

    webViewRef.current.injectJavaScript(script);
  }, []);

  const applyAuthResultUrl = useCallback(
    (url) => {
      if (!url) {
        return;
      }

      const parsed = Linking.parse(url);
      const params = parsed.queryParams || {};
      const hasError = Boolean(params.error || params.error_description);

      if (hasError) {
        setAuthError("Sign-in failed. Please try again.");
        return;
      }

      persistAuthInWebView(params);
      setAuthError("");
      setHasFatalError(false);
      setAutoRetryCount(0);

      const webUrlFromParams = params.web_url || params.redirect || params.return_to || params.next;
      if (typeof webUrlFromParams === "string" && /^https?:\/\//i.test(webUrlFromParams)) {
        setCurrentWebUrl(webUrlFromParams);
        setNavUrl(webUrlFromParams);
        return;
      }

      if (/^https?:\/\//i.test(url)) {
        setCurrentWebUrl(url);
        setNavUrl(url);
        return;
      }

      const next = Date.now();
      setReloadKey(next);
      setCurrentWebUrl(buildAppWebUrl(webBaseUrl, next));
      setNavUrl(buildAppWebUrl(webBaseUrl, next));
    },
    [persistAuthInWebView, webBaseUrl]
  );

  const triggerReload = useCallback(
    (isAutomatic = false) => {
      if (isAutomatic) {
        setAutoRetryCount((prev) => prev + 1);
      } else {
        setAutoRetryCount(0);
      }
      setAuthError("");
      setHasFatalError(false);
      const nextReloadKey = Date.now();
      setReloadKey(nextReloadKey);
      const nextUrl = buildAppWebUrl(webBaseUrl, nextReloadKey);
      setCurrentWebUrl(nextUrl);
      setNavUrl(nextUrl);
    },
    [webBaseUrl]
  );

  const openOAuthInSystemBrowser = useCallback(
    async (url) => {
      setAuthPending(true);
      setAuthError("");
      try {
        const absoluteUrl = /^https?:\/\//i.test(url)
          ? url
          : `${webBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
        const oauthUrl = new URL(absoluteUrl);
        oauthUrl.searchParams.set("mobile", "1");
        oauthUrl.searchParams.set("platform", "expo-webview");
        oauthUrl.searchParams.set("redirect_uri", redirectUri);

        const result = await WebBrowser.openAuthSessionAsync(oauthUrl.toString(), redirectUri, {
          showInRecents: true,
          preferEphemeralSession: false
        });

        if (result.type === "success" && result.url) {
          applyAuthResultUrl(result.url);
        } else if (result.type === "cancel" || result.type === "dismiss") {
          setAuthError("Sign-in cancelled.");
        } else {
          setAuthError("Unable to complete sign-in.");
        }
      } catch {
        setAuthError("Unable to open secure browser for sign-in.");
      } finally {
        setAuthPending(false);
      }
    },
    [applyAuthResultUrl, redirectUri, webBaseUrl]
  );

  const shouldOpenExternally = useCallback((url) => {
    try {
      const parsed = new URL(url);
      return OAUTH_PATH_REGEX.test(parsed.pathname) || OAUTH_PROVIDER_HOST_REGEX.test(parsed.host);
    } catch {
      return false;
    }
  }, []);

  const routeWebMessage = useCallback(
    async (payload) => {
      switch (payload.type) {
        case "chunk_error":
          if (autoRetryCount < MAX_AUTO_RETRIES) {
            triggerReload(true);
          } else {
            setHasFatalError(true);
          }
          break;
        case "pull_refresh":
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            /* optional */
          }
          webViewRef.current?.reload();
          break;
        case "haptic": {
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
        }
        case "custom": {
          if (payload.name === "OPEN_EXTERNAL_BROWSER" && typeof payload.payload === "string") {
            await openOAuthInSystemBrowser(payload.payload);
          }
          break;
        }
        case "share_request": {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const url = payload.url || navUrl || "";
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
        default:
          break;
      }
    },
    [autoRetryCount, navUrl, triggerReload]
  );

  const handleWebMessage = useCallback(
    (event) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data || "{}");
        routeWebMessage(payload);
      } catch {
        /* ignore */
      }
    },
    [routeWebMessage]
  );

  const handleNativeError = useCallback(() => {
    setHasFatalError(true);
  }, []);

  const handleShouldStartRequest = useCallback(
    (request) => {
      const requestUrl = request?.url || "";
      if (shouldOpenExternally(requestUrl)) {
        openOAuthInSystemBrowser(requestUrl);
        return false;
      }
      return true;
    },
    [openOAuthInSystemBrowser, shouldOpenExternally]
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      applyAuthResultUrl(url);
      setAuthPending(false);
    });

    return () => {
      subscription.remove();
    };
  }, [applyAuthResultUrl]);

  useEffect(() => {
    if (isConnected && wasOfflineRef.current) {
      webViewRef.current?.reload();
    }
    wasOfflineRef.current = !isConnected;
  }, [isConnected]);

  const handleOfflineRetry = useCallback(async () => {
    setOfflineRetryBusy(true);
    try {
      const ok = await refresh();
      if (ok) {
        webViewRef.current?.reload();
      }
    } finally {
      setOfflineRetryBusy(false);
    }
  }, [refresh]);

  const webViewCacheProps = useMemo(
    () =>
      __DEV__
        ? { cacheEnabled: false, incognito: true }
        : { cacheEnabled: true, incognito: false },
    []
  );

  if (hasFatalError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={COLORS.white} />
        <View style={styles.fallbackWrapper}>
          <Text style={styles.fallbackTitle}>Unable to load Indo Vyapar</Text>
          <Text style={styles.fallbackText}>
            Please check your internet connection and try again.
          </Text>
          <Pressable onPress={() => triggerReload(false)} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      {!isConnected ? (
        <OfflineScreen onRetry={handleOfflineRetry} busy={offlineRetryBusy} />
      ) : null}

      {authPending ? (
        <View style={styles.authBanner}>
          <Text style={styles.authBannerText}>Complete login in browser...</Text>
        </View>
      ) : null}
      {authError && !/apple sign in/i.test(authError) ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{authError}</Text>
        </View>
      ) : null}

      <WebView
        ref={webViewRef}
        key={`${currentWebUrl}-${reloadKey}`}
        source={{ uri: currentWebUrl }}
        style={styles.webview}
        userAgent={WEBVIEW_USER_AGENT}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        {...webViewCacheProps}
        injectedJavaScript={INJECTED_APP_SCRIPT}
        onMessage={handleWebMessage}
        onError={handleNativeError}
        onHttpError={handleNativeError}
        onShouldStartLoadWithRequest={handleShouldStartRequest}
        onNavigationStateChange={(nav) => {
          if (nav.url) setNavUrl(nav.url);
        }}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled={Platform.OS === "android"}
        {...(Platform.OS === "android" ? { mixedContentMode: "always", forceDarkOn: false } : {})}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        renderLoading={() => (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingLabel}>Loading Indo Vyapar…</Text>
          </View>
        )}
      />

    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  authBanner: {
    backgroundColor: "#eff6ff",
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  authBannerText: {
    textAlign: "center",
    color: "#1e3a8a",
    fontSize: 13
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  errorBannerText: {
    textAlign: "center",
    color: "#991b1b",
    fontSize: 13
  },
  loaderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: "500"
  },
  fallbackWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.white
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    color: COLORS.text
  },
  fallbackText: {
    fontSize: 15,
    textAlign: "center",
    color: COLORS.textMuted,
    marginBottom: 16
  },
  retryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white
  },
  retryText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.primaryDark
  }
});
