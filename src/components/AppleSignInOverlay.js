import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Haptics from "expo-haptics";
import { COLORS, BREAKPOINTS } from "../constants/theme";
import {
  exchangeAppleCredential,
  normalizeAuthPayload
} from "../utils/appleAuthExchange";

export function AppleSignInOverlay({
  visible,
  webBaseUrl,
  webViewRef,
  onAuthenticated,
  onErrorMessage
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (Platform.OS !== "ios") {
      setAvailable(false);
      return undefined;
    }
    AppleAuthentication.isAvailableAsync().then((ok) => {
      if (!cancelled) setAvailable(!!ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const injectAppleIntoWebView = useCallback(
    (credential) => {
      if (!webViewRef?.current) return;
    const payload = {
      identityToken: credential.identityToken ?? "",
      authorizationCode: credential.authorizationCode ?? "",
      user: credential.user ?? "",
      email: credential.email ?? "",
      fullNameJson: credential.fullName ? JSON.stringify(credential.fullName) : ""
    };
      const json = JSON.stringify(payload);
      const script = `
        (function () {
          try {
            var p = ${json};
            if (p.identityToken) localStorage.setItem("apple_identity_token", p.identityToken);
            if (p.authorizationCode) localStorage.setItem("apple_authorization_code", p.authorizationCode);
            if (p.user) localStorage.setItem("apple_user", p.user);
            if (p.email) localStorage.setItem("apple_email", p.email);
            if (p.fullNameJson) localStorage.setItem("apple_full_name", p.fullNameJson);
            window.dispatchEvent(new CustomEvent("native-apple-sign-in", { detail: p }));
          } catch (e) {}
          true;
        })();
      `;
      webViewRef.current.injectJavaScript(script);
    },
    [webViewRef]
  );

  const handlePress = useCallback(async () => {
    if (Platform.OS !== "ios" || !available || busy) return;
    setBusy(true);
    onErrorMessage("");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const exchanged = await exchangeAppleCredential(webBaseUrl, credential);
      if (exchanged && typeof exchanged === "object") {
        const normalized = normalizeAuthPayload(exchanged);
        const hasToken =
          normalized.token ||
          normalized.access_token ||
          normalized.refresh_token ||
          normalized.session;
        if (hasToken) {
          injectAppleIntoWebView(credential);
          onAuthenticated(normalized);
          return;
        }
      }

      injectAppleIntoWebView(credential);
      onAuthenticated({});
    } catch (e) {
      const code = e?.code;
      if (code === "ERR_REQUEST_CANCELED") {
        onErrorMessage("Apple Sign In cancelled.");
      } else {
        onErrorMessage("Apple Sign In failed. Please try again.");
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBusy(false);
    }
  }, [
    available,
    busy,
    injectAppleIntoWebView,
    onAuthenticated,
    onErrorMessage,
    webBaseUrl,
    webViewRef
  ]);

  if (Platform.OS !== "ios" || !visible || !available) {
    return null;
  }

  return (
    <View
      style={[styles.wrap, isTablet && styles.wrapTablet]}
      pointerEvents="box-none"
    >
      <View style={styles.inner}>
        <Text style={styles.hint}>Sign in with Apple</Text>
        {busy ? (
          <View style={styles.loading}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={[
              styles.appleBtn,
              isTablet && { height: 56, maxWidth: 420, alignSelf: "center" }
            ]}
            onPress={handlePress}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "stretch",
    zIndex: 50
  },
  wrapTablet: {
    paddingHorizontal: 32,
    paddingBottom: 24
  },
  inner: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6
  },
  hint: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 10,
    textAlign: "center"
  },
  appleBtn: {
    width: "100%",
    height: 48
  },
  loading: {
    height: 48,
    justifyContent: "center",
    alignItems: "center"
  }
});
