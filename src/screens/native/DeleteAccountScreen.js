import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";
import { getWebBaseUrl, SUPPORT_EMAIL } from "../../constants/appConfig";
import { NativeDialog } from "../../components/NativeDialog";

export function DeleteAccountScreen() {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const webBase = getWebBaseUrl();

  const openDeleteFlow = () => {
    setConfirmVisible(false);
    const url = `${webBase}/account/delete?native=1`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`);
    });
  };

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Delete your account</Text>
        <Text style={styles.body}>
          Deleting your account permanently removes your profile, order history, and saved
          preferences. This action cannot be undone after the grace period.
        </Text>
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Before you continue</Text>
          <Text style={styles.warningText}>
            • Complete or cancel open orders{"\n"}• Download invoices you may need{"\n"}•
            Sign out on other devices
          </Text>
        </View>
        <Pressable
          onPress={() => setConfirmVisible(true)}
          style={({ pressed }) => [styles.dangerBtn, pressed && styles.dangerPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.dangerText}>Request account deletion</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion`)}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>Or email support instead</Text>
        </Pressable>
      </ScrollView>

      <NativeDialog
        visible={confirmVisible}
        title="Confirm deletion"
        message="You will be taken to our secure account page to complete deletion. Continue?"
        confirmLabel="Continue"
        cancelLabel="Cancel"
        onConfirm={openDeleteFlow}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.primaryLight },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg
  },
  warning: {
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "#fecaca"
  },
  warningTitle: {
    fontWeight: 700,
    color: COLORS.errorText,
    marginBottom: SPACING.sm
  },
  warningText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.errorText
  },
  dangerBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center"
  },
  dangerPressed: { opacity: 0.9 },
  dangerText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600"
  },
  linkBtn: {
    marginTop: SPACING.md,
    alignItems: "center",
    padding: SPACING.sm
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600"
  }
});
