import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";

export function LegalInfoScreen({ content, footer }) {
  if (!content) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <Text style={styles.updated}>Last updated: {content.updated}</Text>
      {content.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2
  },
  updated: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg
  },
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted
  },
  footer: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.md
  }
});
