<<<<<<< Updated upstream
/** @deprecated Import from ../bridge/injectedScript */
export { INJECTED_APP_SCRIPT } from "../bridge/injectedScript";
=======
/**
 * Minimal injection: error reporting, light color scheme (match Safari),
 * hide footer + Apple sign-in in app only. Does NOT alter site colors/images.
 */
export const INJECTED_APP_SCRIPT = `
(function () {
  function post(msg) {
    if (!window.ReactNativeWebView) return;
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } catch (e) {}
  }

  function isChunkError(message) {
    return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(message || "");
  }
  window.addEventListener("error", function (event) {
    var msg = (event && event.message) || "";
    if (isChunkError(msg)) post({ type: "chunk_error", message: msg });
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event && event.reason;
    var msg = (reason && (reason.message || String(reason))) || "";
    if (isChunkError(msg)) post({ type: "chunk_error", message: msg });
  });

  /* Force light rendering so iOS/Android dark mode does not wash out hero colors */
  function ensureLightColorScheme() {
    var head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return;
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "color-scheme");
      head.appendChild(meta);
    }
    meta.setAttribute("content", "light");

    var theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement("meta");
      theme.setAttribute("name", "theme-color");
      head.appendChild(theme);
    }
    theme.setAttribute("content", "#ffffff");

    if (!document.querySelector("style[data-indo-vyapar]")) {
      var style = document.createElement("style");
      style.setAttribute("data-indo-vyapar", "color-scheme");
      style.textContent =
        ":root{color-scheme:light !important;}" +
        "html{color-scheme:light !important;-webkit-text-size-adjust:100%;}" +
        "footer,[role='contentinfo'],.footer,#footer{display:none !important;}" +
        "a[href*='/oauth/apple'],a[href*='appleid.apple.com']{display:none !important;}" +
        "a[href*='/oauth/google'],a[href*='accounts.google.com']{display:none !important;}" +
        "a[href*='/oauth/facebook'],a[href*='facebook.com']{display:none !important;}";
      head.appendChild(style);
    }
  }

  function hideNode(node) {
    if (!node || !node.style || node.getAttribute("data-iv-hidden") === "1") return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute("data-iv-hidden", "1");
  }

  function hideAppleSignInElements() {
    document.querySelectorAll('a[href*="/oauth/apple"], a[href*="appleid.apple.com"]').forEach(hideNode);
    document.querySelectorAll("button,a,[role='button']").forEach(function (node) {
      var label = String(node.getAttribute("aria-label") || "").toLowerCase();
      var href = String(node.getAttribute("href") || "").toLowerCase();
      var text = String(node.innerText || "").trim().toLowerCase();
      if (text.length > 120) return;
      if (/oauth\\/apple|appleid\\.apple/.test(href)) {
        hideNode(node);
        return;
      }
      if (/sign in with apple|continue with apple|login with apple/.test(label + " " + text)) {
        hideNode(node);
      }
    });
    document.querySelectorAll("p,span,div").forEach(function (node) {
      var text = String(node.innerText || "").trim().toLowerCase();
      if (!text || text.length > 180) return;
      if (/^or continue with$/i.test(text) || /social login requires a secure browser session/.test(text)) {
        hideNode(node);
      }
    });
  }

  function isProviderLabel(text) {
    var t = String(text || "").trim().toLowerCase();
    return t === "google" || t === "facebook" || t === "apple";
  }

  function hideGoogleFacebookSignInElements() {
    document
      .querySelectorAll(
        'a[href*="/oauth/google"], a[href*="accounts.google.com"], a[href*="/oauth/facebook"], a[href*="facebook.com"]'
      )
      .forEach(hideNode);

    var googleBtn = null;
    var facebookBtn = null;

    document.querySelectorAll("button,a,[role='button'],div,span").forEach(function (node) {
      if (node.getAttribute("data-iv-hidden") === "1") return;
      var label = String(node.getAttribute("aria-label") || "").trim();
      var href = String(node.getAttribute("href") || "").toLowerCase();
      var text = String(node.innerText || "").trim();
      if (text.length > 80) return;

      if (/oauth\\/google|accounts\\.google|oauth\\/facebook|facebook\\.com/.test(href)) {
        hideNode(node);
        return;
      }

      if (isProviderLabel(text) || isProviderLabel(label)) {
        hideNode(node);
        if (/^google$/i.test(text) || /^google$/i.test(label)) googleBtn = node;
        if (/^facebook$/i.test(text) || /^facebook$/i.test(label)) facebookBtn = node;
        return;
      }

      if (
        /sign in with google|continue with google|login with google|sign in with facebook|continue with facebook|login with facebook/.test(
          (label + " " + text).toLowerCase()
        )
      ) {
        hideNode(node);
      }
    });

    if (googleBtn && facebookBtn && googleBtn.parentElement === facebookBtn.parentElement) {
      hideNode(googleBtn.parentElement);
    }

    document.querySelectorAll("p,span,div,h2,h3,hr").forEach(function (node) {
      var text = String(node.innerText || "").trim();
      if (!text || text.length > 60) return;
      if (/^or continue with$/i.test(text)) {
        hideNode(node);
        var parent = node.parentElement;
        if (parent) {
          var parentText = String(parent.innerText || "").trim();
          if (parentText.length < 80) hideNode(parent);
        }
      }
    });
  }

  function applyAppOnlyUi() {
    try {
      ensureLightColorScheme();
      document.querySelectorAll("footer,[role='contentinfo'],.footer,#footer").forEach(hideNode);
      hideAppleSignInElements();
      hideGoogleFacebookSignInElements();
    } catch (_) {}
  }

  applyAppOnlyUi();
  document.addEventListener("DOMContentLoaded", applyAppOnlyUi);
  var uiObs = new MutationObserver(applyAppOnlyUi);
  if (document.documentElement) {
    uiObs.observe(document.documentElement, { childList: true, subtree: true });
  }

  var startY = null;
  var armed = false;
  window.addEventListener(
    "touchstart",
    function (e) {
      if (window.scrollY <= 2 && e.touches && e.touches[0]) {
        startY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      if (startY == null || !e.touches || !e.touches[0]) return;
      var dy = e.touches[0].clientY - startY;
      if (window.scrollY <= 2 && dy > 90) armed = true;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    function () {
      if (armed) {
        armed = false;
        startY = null;
        post({ type: "pull_refresh" });
      } else {
        startY = null;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest && e.target.closest("button,a,[role='button'],input[type='submit']");
      if (!el) return;
      var text = ((el.innerText || "") + " " + (el.getAttribute("aria-label") || "")).toLowerCase();
      var style = "selection";
      if (/cart|checkout|wishlist|buy now|add to cart|place order|order now/i.test(text)) {
        style = "impact_medium";
      }
      post({ type: "haptic", style: style });
    },
    true
  );

  window.indoVyaparShare = function (title, url) {
    post({
      type: "share_request",
      title: title || document.title || "Indo Vyapar",
      url: url || String(location.href || "")
    });
  };

  true;
})();
`;
>>>>>>> Stashed changes
