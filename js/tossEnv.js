/** 토스 WebView / 로컬 모의 환경 감지 */

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
