import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

export function NativeHeader({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
  rightLabel
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? (
          <Pressable
            onPress={rightAction}
            style={({ pressed }) => [styles.rightBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.rightText}>{rightLabel || "Action"}</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 12,
    paddingBottom: 10
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 8,
    minWidth: 72
  },
  backPlaceholder: {
    minWidth: 72
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary
  },
  titleBlock: {
    flex: 1,
    alignItems: "center"
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  rightBtn: {
    paddingVertical: 8,
    paddingLeft: 8,
    minWidth: 72,
    alignItems: "flex-end"
  },
  rightText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary
  },
  pressed: {
    opacity: 0.75
  }
});
