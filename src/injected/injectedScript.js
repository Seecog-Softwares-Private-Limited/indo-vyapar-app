/**
 * Injected once after load: chunk-error reporting, image retry/fallback,
 * tablet-friendly layout CSS, pull-from-top refresh signal, haptics hints, share bridge.
 */
export const INJECTED_APP_SCRIPT = `
(function () {
  function post(msg) {
    if (!window.ReactNativeWebView) return;
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } catch (e) {}
  }

  /* --- Chunk / module load guard --- */
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

  window.__INDO_VYAPAR_MOBILE__ = true;

  /* --- Tablet / responsive polish --- */
  var style = document.createElement("style");
  style.setAttribute("data-indo-vyapar", "responsive");
  style.textContent =
    "html{-webkit-text-size-adjust:100%;}" +
    "@media (min-width:768px){body{background-color:#fff7ed;} img{max-width:100%;height:auto;}}" +
    "@media (min-width:768px){#__next,main,#root{max-width:1200px;margin-left:auto;margin-right:auto;}}" +
    "@media (min-width:1024px){#__next,main,#root{max-width:1280px;padding-left:16px;padding-right:16px;}}";
  document.documentElement.appendChild(style);

  /* --- Image retry + placeholder (no broken icon) --- */
  var PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">' +
        '<rect fill="#fff7ed" width="320" height="240"/>' +
        '<rect fill="#fed7aa" x="80" y="70" width="160" height="100" rx="6"/>' +
        '<text x="160" y="200" text-anchor="middle" fill="#ea580c" font-family="system-ui,sans-serif" font-size="12">Indo Vyapar</text>' +
      "</svg>"
    );

  function enhanceImg(img) {
    if (!img || img.dataset.ivImg === "1") return;
    img.dataset.ivImg = "1";
    var original = img.getAttribute("src") || "";
    var tries = 0;
    img.addEventListener(
      "error",
      function onErr() {
        tries += 1;
        if (tries === 1 && original) {
          var sep = original.indexOf("?") >= 0 ? "&" : "?";
          img.src = original + sep + "iv_retry=" + Date.now();
          return;
        }
        img.src = PLACEHOLDER;
        img.alt = img.alt || "Product image";
      },
      false
    );
    img.addEventListener("load", function () {
      img.style.opacity = "1";
    });
    img.style.backgroundColor = "#ffedd5";
    img.style.opacity = img.complete ? "1" : "0.65";
    img.style.transition = "opacity 0.25s ease";
  }

  function scanImages() {
    document.querySelectorAll("img").forEach(enhanceImg);
  }
  scanImages();
  var imgObs = new MutationObserver(scanImages);
  imgObs.observe(document.documentElement, { childList: true, subtree: true });

  /* --- Pull-from-top refresh (WebView cannot nest RefreshControl) --- */
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

  /* --- Heuristic haptics for cart / checkout actions --- */
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

  /* --- Optional: page can call window.indoVyaparShare(title, url) --- */
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
