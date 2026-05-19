import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";
import { getStoreUrls } from "../../constants/appConfig";

export function AppUpdateRequiredScreen({ currentVersion, minVersion }) {
  const stores = getStoreUrls();

  const openStore = () => {
    const url = Platform.OS === "ios" ? stores.ios : stores.android;
    Linking.openURL(url);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⬆️</Text>
      <Text style={styles.title}>Update required</Text>
      <Text style={styles.body}>
        A newer version of Indo Vyapar is required to continue. Please update from the
        app store.
      </Text>
      {currentVersion ? (
        <Text style={styles.meta}>
          Your version: {currentVersion}
          {minVersion ? ` · Required: ${minVersion}` : ""}
        </Text>
      ) : null}
      <Pressable
        onPress={openStore}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnText}>Update now</Text>
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
    fontSize: 24,
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
    marginBottom: SPACING.lg
  },
  meta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12
  },
  btnPressed: { opacity: 0.9 },
  btnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600"
  }
});
