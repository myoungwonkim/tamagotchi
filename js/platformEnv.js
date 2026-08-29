/** 플랫폼 감지: 웹 / 앱인토스 / Google Play(Capacitor) */

export function isTossEnv() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has("toss")) return true;
  if (window.__GRANITE__ != null) return true;
  if (window.__APPS_IN_TOSS__ != null) return true;
  const ua = navigator.userAgent || "";
  return /TossApp|AppsInToss/i.test(ua);
}

export function isMockAdsEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("mockAds");
}

export function isPlayEnv() {
  if (typeof window === "undefined") return false;
  try {
    const cap = window.Capacitor;
    if (!cap) return false;
    if (typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) {
      return true;
    }
    if (typeof cap.getPlatform === "function") {
      const p = cap.getPlatform();
      return p === "android" || p === "ios";
    }
  } catch {
    // ignore
  }
  return false;
}

function readMeta(name) {
  if (typeof document === "undefined") return "";
  return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "";
}

/** AdSense ca-pub-… from index.html meta (static web deploy). */
export function getWebAdsenseClient() {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB_ADSENSE_CLIENT) {
      return import.meta.env.VITE_WEB_ADSENSE_CLIENT;
    }
  } catch {
    // ignore
  }
  return readMeta("web-adsense-client");
}

export function isWebAdsEnabled() {
  if (getPlatform() !== "web") return false;
  if (readMeta("web-ads") === "0") return false;
  if (typeof location !== "undefined") {
    const host = location.hostname;
    if (host === "nolsoopgames.com" || host === "www.nolsoopgames.com") return false;
  }
  return Boolean(getWebAdsenseClient());
}

/** @returns {'toss' | 'play' | 'web'} */
export function getPlatform() {
  if (isTossEnv()) return "toss";
  if (isPlayEnv()) return "play";
  return "web";
}
