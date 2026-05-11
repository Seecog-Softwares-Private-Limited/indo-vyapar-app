import { useEffect, useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Returns whether the device has an active network connection.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [type, setType] = useState(null);

  useEffect(() => {
    let mounted = true;

    const apply = (state) => {
      if (!mounted) return;
      if (state?.isConnected === false) {
        setIsConnected(false);
        setType(state?.type ?? null);
        return;
      }
      if (state?.isInternetReachable === false) {
        setIsConnected(false);
        setType(state?.type ?? null);
        return;
      }
      setIsConnected(true);
      setType(state?.type ?? null);
    };

    NetInfo.fetch().then(apply);
    const unsubscribe = NetInfo.addEventListener(apply);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    if (state?.isConnected === false || state?.isInternetReachable === false) {
      setIsConnected(false);
      setType(state?.type ?? null);
      return false;
    }
    setIsConnected(true);
    setType(state?.type ?? null);
    return true;
  }, []);

  return { isConnected, type, refresh };
}
