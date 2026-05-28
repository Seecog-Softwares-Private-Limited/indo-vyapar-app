import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "indo_vyapar_session_v1";

const TOKEN_KEYS = [
  "token",
  "access_token",
  "refresh_token",
  "session_token",
  "session"
];

function normalizeSession(input) {
  if (!input || typeof input !== "object") return {};
  const out = {};
  TOKEN_KEYS.forEach((key) => {
    const alt =
      key === "access_token"
        ? input.accessToken
        : key === "refresh_token"
          ? input.refreshToken
          : key === "session_token"
            ? input.session
            : null;
    const value = input[key] ?? alt;
    if (value) out[key] = String(value);
  });
  return out;
}

export async function loadSession() {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return {};
    return normalizeSession(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function saveSession(payload) {
  const normalized = normalizeSession(payload);
  if (Object.keys(normalized).length === 0) {
    await clearSession();
    return normalized;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    /* already cleared */
  }
}

export function buildSessionInjectionScript(session) {
  const payloadJson = JSON.stringify(normalizeSession(session));
  return `
    (function () {
      try {
        var payload = ${payloadJson};
        var keys = Object.keys(payload);
        keys.forEach(function (key) {
          if (payload[key]) {
            localStorage.setItem(key, payload[key]);
            sessionStorage.setItem(key, payload[key]);
          }
        });
        window.dispatchEvent(new CustomEvent("native-session-sync", {
          detail: { type: "session", payload: payload }
        }));
      } catch (_) {}
      true;
    })();
  `;
}
