import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";
import { SUPPORT_EMAIL, SUPPORT_PHONE, WEBSITE_URL } from "../../constants/appConfig";

function ContactRow({ label, value, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      disabled={!onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Pressable>
  );
}

export function ContactScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        We are here to help with orders, account issues, and partnership inquiries.
      </Text>
      <View style={styles.card}>
        <ContactRow
          label="Email"
          value={SUPPORT_EMAIL}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        />
        <ContactRow
          label="Phone"
          value={SUPPORT_PHONE}
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`)}
        />
        <ContactRow
          label="Website"
          value={WEBSITE_URL}
          onPress={() => Linking.openURL(WEBSITE_URL)}
        />
      </View>
      <Text style={styles.hours}>
        Support hours: Monday–Saturday, 9:00 AM – 6:00 PM IST. We aim to respond within
        one business day.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.primaryLight },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden"
  },
  row: {
    padding: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border
  },
  rowPressed: { backgroundColor: COLORS.primaryLight },
  rowLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  rowValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600"
  },
  hours: {
    marginTop: SPACING.lg,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted
  }
});
