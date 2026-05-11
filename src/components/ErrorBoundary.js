import React, { Component } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, _info) {
    /* Production: hook to crash reporting here */
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Please try again. Your session and cart are safe.
          </Text>
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryLight
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center"
  },
  body: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600"
  }
});
