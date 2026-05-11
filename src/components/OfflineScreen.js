import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

export function OfflineScreen({ onRetry, busy }) {
  return (
    <View style={styles.container} accessibilityRole="none">
      <View style={styles.card}>
        <Text style={styles.title}>You are offline</Text>
        <Text style={styles.subtitle}>
          Check your Wi‑Fi or mobile data, then try again. Indo Vyapar needs a
          connection to browse products and place orders.
        </Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          {busy ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Retry</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    zIndex: 1000
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    maxWidth: 420,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600"
  }
});
