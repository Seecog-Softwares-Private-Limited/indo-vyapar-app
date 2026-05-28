import { useEffect } from "react";
import * as Linking from "expo-linking";
import { parseAuthCallbackUrl } from "../native/oauth";

export function useDeepLinking({ onAuthCallback }) {
  useEffect(() => {
    const handleUrl = (url) => {
      const params = parseAuthCallbackUrl(url);
      if (params) {
        onAuthCallback(params, url);
      }
    };

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, [onAuthCallback]);
}
