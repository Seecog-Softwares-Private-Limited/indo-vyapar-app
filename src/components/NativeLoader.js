import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

export function NativeLoader({ label = "Loading…", fullScreen }) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryLight,
    zIndex: 20
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primaryDark
  }
});
