import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ErrorBoundary } from "../components/ErrorBoundary";
import { HybridWebView } from "../components/HybridWebView";
import { NativeHeader } from "../components/NativeHeader";
import { NativeBottomNav } from "../components/NativeBottomNav";
import { MoreMenuSheet } from "../components/MoreMenuSheet";
import { NativeChromeBar } from "../components/NativeChromeBar";
import { LegalInfoScreen } from "../screens/native/LegalInfoScreen";
import { ContactScreen } from "../screens/native/ContactScreen";
import { DeleteAccountScreen } from "../screens/native/DeleteAccountScreen";
import { AppUpdateRequiredScreen } from "../screens/native/AppUpdateRequiredScreen";
import { NoInternetScreen } from "../screens/native/NoInternetScreen";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useDeepLinking } from "../hooks/useDeepLinking";
import { useAppVersionCheck } from "../hooks/useAppVersionCheck";
import { NATIVE_SCREEN_IDS, getMinAppVersion } from "../constants/appConfig";
import {
  PRIVACY_POLICY,
  TERMS_CONDITIONS,
  ABOUT_APP
} from "../constants/legalContent";
import { COLORS } from "../constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SCREEN_TITLES = {
  [NATIVE_SCREEN_IDS.WEB]: "Indo Vyapar",
  [NATIVE_SCREEN_IDS.PRIVACY]: "Privacy Policy",
  [NATIVE_SCREEN_IDS.TERMS]: "Terms & Conditions",
  [NATIVE_SCREEN_IDS.CONTACT]: "Contact Us",
  [NATIVE_SCREEN_IDS.ABOUT]: "About",
  [NATIVE_SCREEN_IDS.DELETE_ACCOUNT]: "Delete Account",
  [NATIVE_SCREEN_IDS.NO_INTERNET]: "Offline",
  [NATIVE_SCREEN_IDS.UPDATE_REQUIRED]: "Update"
};

function FatalErrorScreen({ onRetry }) {
  return (
    <View style={styles.fatal}>
      <Text style={styles.fatalTitle}>Unable to load Indo Vyapar</Text>
      <Text style={styles.fatalBody}>
        Please check your connection and try again. Your session is saved securely on this
        device.
      </Text>
      <Pressable onPress={onRetry} style={styles.fatalBtn}>
        <Text style={styles.fatalBtnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

function AppShellContent() {
  const webRef = useRef(null);
  const { isConnected, refresh } = useNetworkStatus();
  const { updateRequired, appVersion } = useAppVersionCheck();

  const [activeScreen, setActiveScreen] = useState(NATIVE_SCREEN_IDS.WEB);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hasFatalError, setHasFatalError] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [chromeRefreshing, setChromeRefreshing] = useState(false);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [navMeta, setNavMeta] = useState({ title: "", url: "" });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const applyAuthFromDeepLink = useCallback((params) => {
    const hasError = Boolean(params.error || params.error_description);
    if (hasError) {
      setAuthError("Sign-in failed. Please try again.");
      return;
    }
    setAuthError("");
    setHasFatalError(false);
    setAuthPending(false);
    webRef.current?.applyAuthResult?.(params);
  }, []);

  useDeepLinking({ onAuthCallback: applyAuthFromDeepLink });

  const goToScreen = useCallback((screenId) => {
    if (screenId === NATIVE_SCREEN_IDS.WEB) {
      setActiveScreen(NATIVE_SCREEN_IDS.WEB);
      return;
    }
    setActiveScreen(screenId);
  }, []);

  const goBackToWeb = useCallback(() => {
    setActiveScreen(NATIVE_SCREEN_IDS.WEB);
  }, []);

  const handleOfflineRetry = useCallback(async () => {
    setOfflineBusy(true);
    try {
      const ok = await refresh();
      if (ok) {
        setActiveScreen(NATIVE_SCREEN_IDS.WEB);
        webRef.current?.reload();
      }
    } finally {
      setOfflineBusy(false);
    }
  }, [refresh]);

  const handleChromeRefresh = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* optional */
    }
    setChromeRefreshing(true);
    webRef.current?.reload();
    setTimeout(() => setChromeRefreshing(false), 1500);
  }, []);

  if (!appReady) {
    return <View style={styles.splash} />;
  }

  if (updateRequired) {
    return (
      <AppUpdateRequiredScreen
        currentVersion={appVersion}
        minVersion={getMinAppVersion()}
      />
    );
  }

  if (!isConnected && activeScreen === NATIVE_SCREEN_IDS.WEB) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <NativeHeader title="Offline" showBack={false} />
        <NoInternetScreen onRetry={handleOfflineRetry} busy={offlineBusy} />
        <NativeBottomNav
          activeTab={NATIVE_SCREEN_IDS.NO_INTERNET}
          onTabPress={goToScreen}
          onMorePress={() => setMoreOpen(true)}
        />
        <MoreMenuSheet
          visible={moreOpen}
          onClose={() => setMoreOpen(false)}
          onSelect={goToScreen}
        />
      </View>
    );
  }

  if (hasFatalError && activeScreen === NATIVE_SCREEN_IDS.WEB) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <NativeHeader title="Indo Vyapar" showBack={false} />
        <FatalErrorScreen onRetry={() => setHasFatalError(false)} />
      </View>
    );
  }

  const isWeb = activeScreen === NATIVE_SCREEN_IDS.WEB;
  const headerTitle = isWeb
    ? navMeta.title || SCREEN_TITLES[NATIVE_SCREEN_IDS.WEB]
    : SCREEN_TITLES[activeScreen] || "Indo Vyapar";

  const renderNativeScreen = () => {
    switch (activeScreen) {
      case NATIVE_SCREEN_IDS.PRIVACY:
        return <LegalInfoScreen content={PRIVACY_POLICY} />;
      case NATIVE_SCREEN_IDS.TERMS:
        return <LegalInfoScreen content={TERMS_CONDITIONS} />;
      case NATIVE_SCREEN_IDS.ABOUT:
        return (
          <LegalInfoScreen
            content={ABOUT_APP}
            footer={`Version ${appVersion} · ${Platform.OS}`}
          />
        );
      case NATIVE_SCREEN_IDS.CONTACT:
        return <ContactScreen />;
      case NATIVE_SCREEN_IDS.DELETE_ACCOUNT:
        return <DeleteAccountScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <NativeHeader
        title={headerTitle}
        subtitle={isWeb ? "B2B Marketplace" : undefined}
        showBack={!isWeb}
        onBack={goBackToWeb}
        rightAction={isWeb ? handleChromeRefresh : undefined}
        rightLabel={chromeRefreshing ? "…" : "Refresh"}
      />

      {authPending ? (
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerInfoText}>Complete login in browser…</Text>
        </View>
      ) : null}
      {authError ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>{authError}</Text>
        </View>
      ) : null}

      {isWeb ? (
        <NativeChromeBar
          pageTitle={navMeta.title}
          pageUrl={navMeta.url}
          onRefresh={handleChromeRefresh}
          refreshing={chromeRefreshing}
          showCompact={false}
        />
      ) : null}

      <View style={styles.body}>
        {renderNativeScreen()}
        <HybridWebView
          ref={webRef}
          visible={isWeb}
          isConnected={isConnected}
          onFatalError={() => setHasFatalError(true)}
          onAuthPendingChange={setAuthPending}
          onAuthError={setAuthError}
          onNavigateNative={goToScreen}
          onNavStateChange={setNavMeta}
        />
      </View>

      <NativeBottomNav
        activeTab={activeScreen}
        onTabPress={goToScreen}
        onMorePress={() => setMoreOpen(true)}
      />

      <MoreMenuSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onSelect={goToScreen}
      />
    </View>
  );
}

export function AppShell() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppShellContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  splash: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  },
  body: {
    flex: 1
  },
  bannerInfo: {
    backgroundColor: "#eff6ff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe"
  },
  bannerInfoText: {
    textAlign: "center",
    color: "#1e3a8a",
    fontSize: 13
  },
  bannerError: {
    backgroundColor: COLORS.errorBg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca"
  },
  bannerErrorText: {
    textAlign: "center",
    color: COLORS.errorText,
    fontSize: 13
  },
  fatal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.primaryLight
  },
  fatalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center"
  },
  fatalBody: {
    fontSize: 15,
    textAlign: "center",
    color: COLORS.textMuted,
    marginBottom: 16
  },
  fatalBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white
  },
  fatalBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.primaryDark
  }
});
