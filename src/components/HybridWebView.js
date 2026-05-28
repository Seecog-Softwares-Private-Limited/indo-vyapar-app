import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { INJECTED_APP_SCRIPT } from "../bridge/injectedScript";
import { createBridgeRouter } from "../bridge/bridgeRouter";
import { injectNetworkStatus } from "../bridge/webBridge";
import { saveSession } from "../bridge/sessionStorage";
import {
  buildAppWebUrl,
  getWebBaseUrl
} from "../constants/appConfig";
import {
  createOAuthRedirectUri,
  openOAuthInSystemBrowser,
  parseAuthCallbackUrl,
  shouldOpenOAuthExternally
} from "../native/oauth";
import { NativeLoader } from "./NativeLoader";
import { AppleSignInOverlay } from "./AppleSignInOverlay";
import { COLORS } from "../constants/theme";

const MAX_AUTO_RETRIES = 2;

function isLikelyAuthUrl(url) {
  if (!url) return false;
  try {
    const path = new URL(url).pathname;
    return /\/(login|sign-in|signin|register|auth|account\/login)(\/|$)/i.test(path);
  } catch {
    return false;
  }
}

export const HybridWebView = forwardRef(function HybridWebView(
  {
    visible,
    isConnected,
    onFatalError,
    onAuthPendingChange,
    onAuthError,
    onNavigateNative,
    onNavStateChange
  },
  ref
) {
  const innerRef = useRef(null);
  const webBaseUrl = useMemo(() => getWebBaseUrl(), []);
  const redirectUri = useMemo(() => createOAuthRedirectUri(), []);

  const [reloadKey, setReloadKey] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [currentWebUrl, setCurrentWebUrl] = useState(() =>
    buildAppWebUrl(webBaseUrl, 0)
  );
  const [navUrl, setNavUrl] = useState(currentWebUrl);
  const [webLoading, setWebLoading] = useState(true);
  const [authPending, setAuthPending] = useState(false);

  const triggerReload = useCallback(
    (isAutomatic = false) => {
      if (isAutomatic) {
        setAutoRetryCount((prev) => prev + 1);
      } else {
        setAutoRetryCount(0);
      }
      const nextReloadKey = Date.now();
      setReloadKey(nextReloadKey);
      const nextUrl = buildAppWebUrl(webBaseUrl, nextReloadKey);
      setCurrentWebUrl(nextUrl);
      setNavUrl(nextUrl);
    },
    [webBaseUrl]
  );

  const persistAuthInWebView = useCallback((params) => {
    saveSession(params);
    const tokenMap = {
      token: params.token || "",
      access_token: params.access_token || params.accessToken || "",
      refresh_token: params.refresh_token || params.refreshToken || "",
      session_token: params.session || params.session_token || ""
    };
    const payloadJson = JSON.stringify(tokenMap);
    innerRef.current?.injectJavaScript(`
      (function () {
        try {
          var payload = ${payloadJson};
          Object.keys(payload).forEach(function (key) {
            if (payload[key]) {
              localStorage.setItem(key, payload[key]);
              sessionStorage.setItem(key, payload[key]);
            }
          });
          window.dispatchEvent(new CustomEvent("mobile-auth-success", { detail: payload }));
        } catch (_) {}
        true;
      })();
    `);
  }, []);

  const applyAuthResult = useCallback(
    (params) => {
      const hasError = Boolean(params.error || params.error_description);
      if (hasError) {
        onAuthError?.("Sign-in failed. Please try again.");
        return;
      }

      const hasAnyToken =
        params.token ||
        params.access_token ||
        params.accessToken ||
        params.refresh_token ||
        params.refreshToken ||
        params.session ||
        params.session_token;

      if (hasAnyToken) {
        persistAuthInWebView(params);
      }

      onAuthError?.("");
      const webUrlFromParams =
        params.web_url || params.redirect || params.return_to || params.next;
      if (typeof webUrlFromParams === "string" && /^https?:\/\//i.test(webUrlFromParams)) {
        setCurrentWebUrl(webUrlFromParams);
        setNavUrl(webUrlFromParams);
        return;
      }

      triggerReload(false);
    },
    [onAuthError, persistAuthInWebView, triggerReload]
  );

  useImperativeHandle(
    ref,
    () => ({
      reload: () => innerRef.current?.reload(),
      injectJavaScript: (script) => innerRef.current?.injectJavaScript(script),
      applyAuthResult,
      getWebViewRef: () => innerRef
    }),
    [applyAuthResult]
  );

  const openOAuth = useCallback(
    async (url) => {
      setAuthPending(true);
      onAuthPendingChange?.(true);
      onAuthError?.("");
      try {
        const result = await openOAuthInSystemBrowser(url, redirectUri);
        if (result.type === "success" && result.url) {
          const params = parseAuthCallbackUrl(result.url);
          if (params) applyAuthResult(params);
        } else if (result.type === "cancel" || result.type === "dismiss") {
          onAuthError?.("Sign-in cancelled.");
        } else {
          onAuthError?.("Unable to complete sign-in.");
        }
      } catch {
        onAuthError?.("Unable to open secure browser for sign-in.");
      } finally {
        setAuthPending(false);
        onAuthPendingChange?.(false);
      }
    },
    [applyAuthResult, onAuthError, onAuthPendingChange, redirectUri]
  );

  const bridgeRouter = useMemo(
    () =>
      createBridgeRouter({
        webViewRef: innerRef,
        autoRetryCount,
        maxAutoRetries: MAX_AUTO_RETRIES,
        onChunkFatal: onFatalError,
        onTriggerReload: triggerReload,
        onNavigateNative,
        onSetWebTitle: (title) => onNavStateChange?.({ title, url: navUrl }),
        onAuthTokensFromWeb: (session) => saveSession(session)
      }),
    [
      autoRetryCount,
      navUrl,
      onFatalError,
      onNavigateNative,
      onNavStateChange,
      triggerReload
    ]
  );

  const handleWebMessage = useCallback(
    (event) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data || "{}");
        bridgeRouter.routeWebMessage(payload);
      } catch {
        /* ignore malformed */
      }
    },
    [bridgeRouter]
  );

  const handleShouldStartRequest = useCallback(
    (request) => {
      const requestUrl = request?.url || "";
      if (shouldOpenOAuthExternally(requestUrl)) {
        openOAuth(requestUrl);
        return false;
      }
      return true;
    },
    [openOAuth]
  );

  const wasOfflineRef = useRef(false);

  useEffect(() => {
    injectNetworkStatus(innerRef, isConnected);
    if (isConnected && wasOfflineRef.current) {
      innerRef.current?.reload();
    }
    wasOfflineRef.current = !isConnected;
  }, [isConnected]);

  const webViewCacheProps = useMemo(
    () =>
      __DEV__
        ? { cacheEnabled: false, incognito: true }
        : { cacheEnabled: true, incognito: false },
    []
  );

  const showAppleOverlay =
    Platform.OS === "ios" && isLikelyAuthUrl(navUrl || currentWebUrl);

  if (!visible) {
    return <View style={styles.hidden} pointerEvents="none" />;
  }

  return (
    <View style={styles.container}>
      {webLoading ? (
        <NativeLoader label="Loading Indo Vyapar…" fullScreen />
      ) : null}

      {authPending ? (
        <NativeLoader label="Complete login in your browser…" />
      ) : null}

      <WebView
        ref={innerRef}
        key={`${currentWebUrl}-${reloadKey}`}
        source={{ uri: currentWebUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        {...webViewCacheProps}
        injectedJavaScript={INJECTED_APP_SCRIPT}
        onMessage={handleWebMessage}
        onError={() => onFatalError?.()}
        onHttpError={() => onFatalError?.()}
        onShouldStartLoadWithRequest={handleShouldStartRequest}
        onNavigationStateChange={(nav) => {
          if (nav.url) setNavUrl(nav.url);
          onNavStateChange?.({ url: nav.url, title: nav.title, loading: nav.loading });
          if (!nav.loading) setWebLoading(false);
        }}
        onLoadStart={() => setWebLoading(true)}
        onLoadEnd={() => setWebLoading(false)}
        contentMode={Platform.OS === "ios" ? "mobile" : undefined}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled={Platform.OS === "android"}
        {...(Platform.OS === "android" ? { mixedContentMode: "always" } : {})}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onContentProcessDidTerminate={() => innerRef.current?.reload()}
      />

      <AppleSignInOverlay
        visible={showAppleOverlay && isConnected}
        webBaseUrl={webBaseUrl}
        webViewRef={innerRef}
        onAuthenticated={(tokens) => {
          if (tokens && typeof tokens === "object") {
            persistAuthInWebView(tokens);
          }
          triggerReload(false);
        }}
        onErrorMessage={onAuthError}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  },
  hidden: {
    flex: 0,
    height: 0,
    overflow: "hidden"
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  }
});
