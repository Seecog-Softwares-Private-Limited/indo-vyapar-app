import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/theme";
import { NATIVE_SCREEN_IDS } from "../constants/appConfig";

const TABS = [
  { id: NATIVE_SCREEN_IDS.WEB, label: "Shop", icon: "🏠" },
  { id: NATIVE_SCREEN_IDS.ABOUT, label: "About", icon: "ℹ️" },
  { id: "more", label: "More", icon: "☰" }
];

export function NativeBottomNav({ activeTab, onTabPress, onMorePress }) {
  const insets = useSafeAreaInsets();

  const handlePress = async (tab) => {
    try {
      await Haptics.selectionAsync();
    } catch {
      /* optional */
    }
    if (tab.id === "more") {
      onMorePress?.();
    } else {
      onTabPress(tab.id);
    }
  };

  const isActive = (tabId) => {
    if (tabId === "more") return false;
    if (tabId === NATIVE_SCREEN_IDS.WEB) {
      return activeTab === NATIVE_SCREEN_IDS.WEB;
    }
    return activeTab === tabId;
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => handlePress(tab)}
          style={({ pressed }) => [
            styles.tab,
            isActive(tab.id) && styles.tabActive,
            pressed && styles.tabPressed
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive(tab.id) }}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, isActive(tab.id) && styles.labelActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 6
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight
  },
  tabPressed: {
    opacity: 0.85
  },
  icon: {
    fontSize: 20,
    marginBottom: 2
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted
  },
  labelActive: {
    color: COLORS.primaryDark
  }
});
