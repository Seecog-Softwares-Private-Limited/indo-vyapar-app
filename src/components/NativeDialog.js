import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

export function NativeDialog({
  visible,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onCancel
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityViewIsModal>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {cancelLabel ? (
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.pressed]}
              >
                <Text style={styles.btnSecondaryText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
            >
              <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  btnPrimary: {
    backgroundColor: COLORS.primary
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15
  },
  btnSecondary: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  btnSecondaryText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
    fontSize: 15
  },
  pressed: {
    opacity: 0.85
  }
});
