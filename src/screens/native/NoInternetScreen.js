import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";

/**
 * Full-screen offline state (native, not overlay) for App Store–friendly UX.
 */
export function NoInternetScreen({ onRetry, busy }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.title}>No internet connection</Text>
      <Text style={styles.body}>
        Indo Vyapar needs an active connection to load products and process orders.
        Check Wi‑Fi or mobile data, then try again.
      </Text>
      <Pressable
        onPress={onRetry}
        disabled={busy}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.btnText}>Try again</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.primaryLight
  },
  icon: { fontSize: 48, marginBottom: SPACING.md },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center"
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg,
    maxWidth: 360
  },
  btn: {
    backgroundColor: COLORS.primary,
    minWidth: 160,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: "center"
  },
  btnPressed: { backgroundColor: COLORS.primaryDark },
  btnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600"
  }
});
