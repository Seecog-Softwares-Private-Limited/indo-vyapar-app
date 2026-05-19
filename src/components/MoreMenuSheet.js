import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";
import { NATIVE_SCREEN_IDS } from "../constants/appConfig";

const ITEMS = [
  { id: NATIVE_SCREEN_IDS.PRIVACY, label: "Privacy Policy" },
  { id: NATIVE_SCREEN_IDS.TERMS, label: "Terms & Conditions" },
  { id: NATIVE_SCREEN_IDS.CONTACT, label: "Contact Us" },
  { id: NATIVE_SCREEN_IDS.DELETE_ACCOUNT, label: "Delete Account" }
];

export function MoreMenuSheet({ visible, onClose, onSelect }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.sheetTitle}>More</Text>
        {ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowText}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Pressable onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border
  },
  rowPressed: {
    backgroundColor: COLORS.primaryLight
  },
  rowText: {
    fontSize: 16,
    color: COLORS.text
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted
  },
  cancel: {
    marginTop: SPACING.md,
    alignItems: "center",
    paddingVertical: 12
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary
  }
});
