import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS, BREAKPOINTS } from "../constants/theme";

export function NativeChromeBar({
  pageTitle,
  pageUrl,
  onRefresh,
  refreshing,
  showCompact
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;

  const handleShare = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = pageUrl || "";
      const message = pageTitle
        ? `${pageTitle}\n${url}`
        : `Shop on Indo Vyapar\n${url}`;
      await Share.share(
        Platform.OS === "ios"
          ? { url, title: pageTitle || "Indo Vyapar" }
          : { message: url ? message : "https://indovyapar.com", title: "Indo Vyapar" }
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* user dismissed share sheet */
    }
  }, [pageTitle, pageUrl]);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRefresh?.();
  }, [onRefresh]);

  if (showCompact) {
    return null;
  }

  return (
    <View
      style={[styles.bar, isTablet && styles.barTablet]}
      accessibilityRole="toolbar"
    >
      <Text style={[styles.brand, isTablet && styles.brandTablet]} numberOfLines={1}>
        Indo Vyapar
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          accessibilityRole="button"
          accessibilityLabel="Refresh page"
          disabled={refreshing}
        >
          <Text style={styles.chipText}>{refreshing ? "…" : "Refresh"}</Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Text style={styles.chipText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border
  },
  barTablet: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%"
  },
  brand: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
    marginRight: 8
  },
  brandTablet: {
    fontSize: 20
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  chipPressed: {
    opacity: 0.85,
    backgroundColor: "#ffedd5"
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryDark
  }
});
