/**
 * Exchange Sign in with Apple credentials with the Indo Vyapar backend.
 * Tries common mobile endpoint patterns; falls back to token injection in WebView only.
 */
export async function exchangeAppleCredential(webBaseUrl, credential) {
  const base = webBaseUrl.replace(/\/$/, "");
  const body = JSON.stringify({
    identityToken: credential.identityToken ?? null,
    authorizationCode: credential.authorizationCode ?? null,
    user: credential.user ?? null,
    email: credential.email ?? null,
    fullName: credential.fullName ?? null
  });

  const urls = [
    `${base}/api/auth/oauth/apple/mobile`,
    `${base}/api/auth/apple`,
    `${base}/api/auth/oauth/apple`,
    `${base}/api/auth/oauth/apple/callback`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch {
          return { raw: text };
        }
      }
    } catch {
      /* try next endpoint */
    }
  }

  return null;
}

export function normalizeAuthPayload(data) {
  if (!data || typeof data !== "object") {
    return {};
  }
  const d =
    data.data && typeof data.data === "object" ? data.data : data;
  return {
    token: d.token ?? d.accessToken ?? "",
    access_token: d.access_token ?? d.accessToken ?? "",
    refresh_token: d.refresh_token ?? d.refreshToken ?? "",
    session: d.session ?? d.session_token ?? ""
  };
}
