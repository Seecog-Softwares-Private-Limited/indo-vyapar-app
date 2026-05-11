import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  Text
} from "react-native";
import { COLORS } from "../constants/theme";

const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect fill="#fff7ed" width="400" height="400"/>
    <rect fill="#fed7aa" x="120" y="120" width="160" height="120" rx="8"/>
    <text x="200" y="285" text-anchor="middle" fill="#ea580c" font-family="system-ui,sans-serif" font-size="14">Indo Vyapar</text>
  </svg>`
)}`;

/**
 * Reusable image with loading skeleton, one automatic retry, and branded fallback.
 * Use anywhere you render product or banner images in React Native screens.
 */
export function SmartImage({
  source,
  style,
  resizeMode = "cover",
  accessibilityLabel = "Product image"
}) {
  const [loading, setLoading] = useState(true);
  const [retryIndex, setRetryIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  const resolvedUri = useMemo(() => {
    if (!source?.uri) return null;
    if (retryIndex === 0) return source.uri;
    const sep = source.uri.includes("?") ? "&" : "?";
    return `${source.uri}${sep}iv_retry=${Date.now()}`;
  }, [source, retryIndex]);

  const onError = useCallback(() => {
    if (retryIndex < 1 && source?.uri) {
      setRetryIndex((n) => n + 1);
      setLoading(true);
      return;
    }
    setUseFallback(true);
    setLoading(false);
  }, [retryIndex, source]);

  if (!source?.uri || useFallback) {
    return (
      <View style={[styles.box, style]} accessibilityLabel={accessibilityLabel}>
        <Image
          source={{ uri: PLACEHOLDER_SVG }}
          style={styles.fill}
          resizeMode="contain"
        />
        <Text style={styles.fallbackHint} numberOfLines={1}>
          Image unavailable
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, style]}>
      {loading ? (
        <View style={styles.skeleton}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : null}
      <Image
        source={{ uri: resolvedUri }}
        style={[styles.fill, loading && styles.hidden]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={onError}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.primaryLight,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  fill: {
    width: "100%",
    height: "100%"
  },
  hidden: {
    opacity: 0
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffedd5"
  },
  fallbackHint: {
    position: "absolute",
    bottom: 8,
    fontSize: 11,
    color: COLORS.primaryDark
  }
});
