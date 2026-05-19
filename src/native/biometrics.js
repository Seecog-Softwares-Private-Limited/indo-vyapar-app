import * as LocalAuthentication from "expo-local-authentication";

export async function authenticateWithBiometrics(reason) {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { ok: false, error: "Biometrics not available on this device" };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return { ok: false, error: "No biometrics enrolled. Set up Face ID or fingerprint in device settings." };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason || "Unlock Indo Vyapar",
    cancelLabel: "Cancel",
    disableDeviceFallback: false
  });

  if (result.success) {
    return { ok: true };
  }

  return {
    ok: false,
    cancelled: result.error === "user_cancel",
    error: result.error || "Authentication failed"
  };
}
