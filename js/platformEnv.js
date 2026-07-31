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

/** @returns {'toss' | 'play' | 'web'} */
export function getPlatform() {
  if (isTossEnv()) return "toss";
  if (isPlayEnv()) return "play";
  return "web";
}
