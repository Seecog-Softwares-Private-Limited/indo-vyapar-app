import { useEffect, useState } from "react";
import * as Application from "expo-application";
import { getMinAppVersion } from "../constants/appConfig";

function parseVersion(v) {
  return String(v || "0")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

function isVersionLower(current, minimum) {
  const a = parseVersion(current);
  const b = parseVersion(minimum);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av < bv) return true;
    if (av > bv) return false;
  }
  return false;
}

export function useAppVersionCheck() {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [appVersion, setAppVersion] = useState("1.0.0");

  useEffect(() => {
    const current =
      Application.nativeApplicationVersion ||
      Application.applicationId ||
      "1.0.0";
    setAppVersion(current);

    const minVersion = getMinAppVersion();
    if (minVersion && isVersionLower(current, minVersion)) {
      setUpdateRequired(true);
    }
  }, []);

  return { updateRequired, appVersion };
}
